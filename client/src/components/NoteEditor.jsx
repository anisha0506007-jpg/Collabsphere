import { useState } from "react";
import ReactMarkdown from "react-markdown";

import {
  explainWithGemini,
} from "../services/aiService";

export default function NoteEditor({
  projectId,
  note,
  onSave,
  onCancel,
  saving,
}) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [mode, setMode] = useState("edit");

  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      setError("Please enter a note title.");
      return;
    }

    try {
      setError("");

      await onSave({
        title: title.trim(),
        content,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Could not save your note."
      );
    }
  };

  const askGemini = async (task) => {
    if (!content.trim()) {
      setError("Write some content before using Gemini.");
      return;
    }

    try {
      setAiLoading(true);
      setAiAnswer("");
      setError("");

      const prompt =
        task === "explain"
          ? `Explain this note in simple language with examples:\n\n${content}`
          : `Review this note and suggest improvements. Check clarity, structure, missing information, grammar and technical accuracy. Provide an improved version where useful:\n\n${content}`;

      const data = await explainWithGemini(
        projectId,
        prompt
      );

      setAiAnswer(data.answer);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Gemini could not process this note."
      );
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <section className="note-editor">
      <form onSubmit={handleSubmit}>
        <div className="note-editor-heading">
          <h2>{note ? "Edit Note" : "Create New Note"}</h2>

          <button
            type="button"
            className="secondary-button"
            onClick={onCancel}
          >
            Close
          </button>
        </div>

        {error && (
          <p className="status-message error">{error}</p>
        )}

        <label htmlFor="note-title">Note title</label>

        <input
          id="note-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Enter note title"
          maxLength={150}
          required
        />

        <div className="markdown-toolbar">
          <button
            type="button"
            className={mode === "edit" ? "active" : ""}
            onClick={() => setMode("edit")}
          >
            Edit Markdown
          </button>

          <button
            type="button"
            className={mode === "preview" ? "active" : ""}
            onClick={() => setMode("preview")}
          >
            Preview
          </button>
        </div>

        {mode === "edit" ? (
          <textarea
            className="markdown-input"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={`# My Notes

## Introduction

Write your notes using Markdown.

- Point one
- Point two

\`\`\`javascript
console.log("Hello CollabSphere");
\`\`\`
`}
            rows={14}
            maxLength={50000}
          />
        ) : (
          <div className="markdown-preview">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}

        <p className="character-count">
          {content.length}/50000 characters
        </p>

        <div className="gemini-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => askGemini("explain")}
            disabled={aiLoading}
          >
            {aiLoading ? "Please wait..." : "Explain this Note"}
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={() => askGemini("improve")}
            disabled={aiLoading}
          >
            Suggest Improvements
          </button>
        </div>

        {aiAnswer && (
          <section className="gemini-result">
            <h3>Gemini Suggestions</h3>

            <div className="markdown-preview">
              <ReactMarkdown>{aiAnswer}</ReactMarkdown>
            </div>
          </section>
        )}

        <div className="note-editor-footer">
          <button
            type="button"
            className="secondary-button"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-button"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : note
                ? "Update Note"
                : "Create Note"}
          </button>
        </div>
      </form>
    </section>
  );
}