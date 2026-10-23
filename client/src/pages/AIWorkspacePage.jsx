
import { useState } from "react";
import { useParams } from "react-router-dom";
import { askAI } from "../services/aiService";

const tasks = [
  { value: "general", label: "Ask a question" },
  { value: "explain_code", label: "Explain code" },
  { value: "generate_readme", label: "Generate README" },
  { value: "explain_api", label: "Explain an API" },
];

export default function AIWorkspacePage() {
  const { projectId } = useParams();

  const [task, setTask] = useState("general");
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!prompt.trim()) {
      setError("Please enter a question or some code.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setAnswer("");

      const data = await askAI(projectId, {
        task,
        prompt: prompt.trim(),
      });

      setAnswer(data.answer);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not get an AI response. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="ai-workspace">
      <header className="ai-header">
        <p className="eyebrow">COLLABSPHERE AI</p>
        <h1>Your Developer Assistant</h1>
        <p>
          Understand code, ask programming questions, and draft
          project documentation.
        </p>
      </header>

      <form className="ai-form" onSubmit={handleSubmit}>
        <label htmlFor="ai-task">What do you want help with?</label>

        <select
          id="ai-task"
          value={task}
          onChange={(event) => setTask(event.target.value)}
        >
          {tasks.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <label htmlFor="ai-prompt">Your question or content</label>

        <textarea
          id="ai-prompt"
          rows={9}
          maxLength={12000}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Example: Explain how useState works in React..."
        />

        <p className="ai-character-count">
          {prompt.length}/12000 characters
        </p>

        <button
          className="primary-button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Generating answer..." : "Ask CollabSphere AI"}
        </button>
      </form>

      {error && (
        <p className="status-message error">{error}</p>
      )}

      {answer && (
        <section className="ai-answer">
          <h2>AI Response</h2>
          <pre>{answer}</pre>
        </section>
      )}
    </main>
  );
}
