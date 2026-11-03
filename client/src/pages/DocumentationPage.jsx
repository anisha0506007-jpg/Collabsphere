import { useState } from "react";
import { useParams } from "react-router-dom";

import {
  generateDocsWithGemini,
  generateReadmeWithGemini,
} from "../services/aiService";

export default function DocumentationPage() {
  const { projectId } = useParams();

  const [task, setTask] = useState("readme");
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [setup, setSetup] = useState("");
  const [endpoint, setEndpoint] = useState("");

  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleGenerate = async (event) => {
    event.preventDefault();

    if (!projectName.trim() || !description.trim()) {
      setError("Project name and description are required.");
      return;
    }

    const content = task === "readme"
      ? `Project name: ${projectName}

Description: ${description}

Technologies: ${technologies || "Not provided"}

Setup instructions: ${setup || "Not provided"}`
      : `Project name: ${projectName}

Description: ${description}

Technologies: ${technologies || "Not provided"}

API endpoint details: ${endpoint || "Not provided"}`;

    try {
      setLoading(true);
      setError("");
      setMessage("");
      setAnswer("");

      const data = task === "readme"
        ? await generateReadmeWithGemini(projectId, content)
        : await generateDocsWithGemini(projectId, content);

      setAnswer(data.answer);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Documentation generation failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(answer);
      setMessage("Copied successfully.");
    } catch {
      setError("Could not copy the documentation.");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([answer], {
      type: "text/markdown;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;

    link.download =
      task === "readme"
        ? "README.md"
        : "API-DOCUMENTATION.md";

    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <main className="docs-page">
      <header className="docs-header">
        <p className="eyebrow">COLLABSPHERE AI</p>
        <h1>Documentation Generator</h1>
        <p>Generate README and API documentation using Gemini.</p>
      </header>

      <form className="docs-form" onSubmit={handleGenerate}>
        <label>Documentation type</label>

        <select
          value={task}
          onChange={(event) => {
            setTask(event.target.value);
            setAnswer("");
          }}
        >
          <option value="readme">README Generator</option>
          <option value="docs">API Documentation</option>
        </select>

        <label>Project name</label>

        <input
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
          placeholder="CollabSphere"
          required
        />

        <label>Project description</label>

        <textarea
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />

        <label>Technologies</label>

        <input
          value={technologies}
          onChange={(event) => setTechnologies(event.target.value)}
          placeholder="React, Node.js, MongoDB..."
        />

        {task === "readme" ? (
          <>
            <label>Installation instructions</label>

            <textarea
              rows={4}
              value={setup}
              onChange={(event) => setSetup(event.target.value)}
            />
          </>
        ) : (
          <>
            <label>API endpoint details</label>

            <textarea
              rows={5}
              value={endpoint}
              onChange={(event) => setEndpoint(event.target.value)}
              placeholder="Method, route, request body, response..."
            />
          </>
        )}

        <button
          className="primary-button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate with Gemini"}
        </button>
      </form>

      {error && (
        <p className="status-message error">{error}</p>
      )}

      {message && (
        <p className="status-message success">{message}</p>
      )}

      {answer && (
        <section className="docs-result">
          <h2>Generated Documentation</h2>

          <div className="docs-actions">
            <button
              className="secondary-button"
              onClick={handleCopy}
            >
              Copy
            </button>

            <button
              className="primary-button"
              onClick={handleDownload}
            >
              Download Markdown
            </button>
          </div>

          <textarea
            className="docs-output"
            rows={20}
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
          />
        </section>
      )}
    </main>
  );
}