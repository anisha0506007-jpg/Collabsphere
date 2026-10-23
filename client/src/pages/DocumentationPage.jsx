
import { useState } from "react";
import { useParams } from "react-router-dom";
import { askAI } from "../services/aiService";

export default function DocumentationPage() {
  const { projectId } = useParams();

  const [task, setTask] = useState("generate_readme");
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

    const prompt = task === "generate_readme"
      ? `Create a README for this project.

Project name: ${projectName}
Description: ${description}
Technologies: ${technologies || "Not specified"}
Setup instructions: ${setup || "Not specified"}

Do not invent missing details. Use placeholders when needed.`
      : `Create API documentation for this endpoint.

Project: ${projectName}
Description: ${description}
Endpoint details: ${endpoint || "Not specified"}
Technologies: ${technologies || "Not specified"}

Document only the details provided. Clearly mark missing information.`;

    try {
      setLoading(true);
      setError("");
      setMessage("");
      setAnswer("");

      const data = await askAI(projectId, {
        task,
        prompt,
      });

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
      setMessage("Documentation copied to clipboard.");
    } catch {
      setError("Could not copy. Please select and copy the text manually.");
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
      task === "generate_readme" ? "README.md" : "API-DOCUMENTATION.md";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <main className="docs-page">
      <header className="docs-header">
        <p className="eyebrow">COLLABSPHERE AI TOOLS</p>
        <h1>Documentation Generator</h1>
        <p>
          Create a first draft of your project README or API documentation.
        </p>
      </header>

      <form className="docs-form" onSubmit={handleGenerate}>
        <label htmlFor="doc-task">Documentation type</label>
        <select
          id="doc-task"
          value={task}
          onChange={(event) => {
            setTask(event.target.value);
            setAnswer("");
            setError("");
            setMessage("");
          }}
        >
          <option value="generate_readme">Project README</option>
          <option value="explain_api">API documentation</option>
        </select>

        <label htmlFor="project-name">Project name *</label>
        <input
          id="project-name"
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
          placeholder="Example: CollabSphere"
          maxLength={100}
          required
        />

        <label htmlFor="project-description">Project description *</label>
        <textarea
          id="project-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What does your project do?"
          rows={3}
          maxLength={2000}
          required
        />

        <label htmlFor="technologies">Technologies used</label>
        <input
          id="technologies"
          value={technologies}
          onChange={(event) => setTechnologies(event.target.value)}
          placeholder="React, Express, MongoDB..."
          maxLength={500}
        />

        {task === "generate_readme" ? (
          <>
            <label htmlFor="setup">Installation and run instructions</label>
            <textarea
              id="setup"
              value={setup}
              onChange={(event) => setSetup(event.target.value)}
              placeholder="Add the real commands needed to run your project."
              rows={4}
              maxLength={3000}
            />
          </>
        ) : (
          <>
            <label htmlFor="endpoint">API endpoint details</label>
            <textarea
              id="endpoint"
              value={endpoint}
              onChange={(event) => setEndpoint(event.target.value)}
              placeholder="Method, route, authentication, request body, response..."
              rows={5}
              maxLength={4000}
            />
          </>
        )}

        <button className="primary-button" disabled={loading} type="submit">
          {loading ? "Generating..." : "Generate documentation"}
        </button>
      </form>

      {error && <p className="status-message error">{error}</p>}
      {message && <p className="status-message success">{message}</p>}

      {answer && (
        <section className="docs-result">
          <div className="docs-result-header">
            <div>
              <h2>Generated Markdown</h2>
              <p>Review the content before adding it to your project.</p>
            </div>

            <div className="docs-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={handleCopy}
              >
                Copy
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={handleDownload}
              >
                Download .md
              </button>
            </div>
          </div>

          <textarea
            className="docs-output"
            aria-label="Generated documentation, editable"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            rows={20}
          />
        </section>
      )}
    </main>
  );
}
