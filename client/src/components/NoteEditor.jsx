import { useRef, useState } from "react";
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
  const editorRef = useRef(null);

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

  const formatSelection = ({
    prefix,
    suffix = "",
    placeholder = "text",
    formatLines = false,
  }) => {
    const textarea = editorRef.current;

    if (!textarea) {
      return;
    }

    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    let replaceStart = selectionStart;
    let replaceEnd = selectionEnd;
    let selectedText = content.slice(selectionStart, selectionEnd);

    if (formatLines) {
      replaceStart = content.lastIndexOf("\n", selectionStart - 1) + 1;
      const nextLineBreak = content.indexOf("\n", selectionEnd);
      replaceEnd = nextLineBreak === -1 ? content.length : nextLineBreak;
      selectedText = content.slice(replaceStart, replaceEnd);

      if (!selectedText) {
        selectedText = placeholder;
      }

      selectedText = selectedText
        .split("\n")
        .map((line) => `${prefix}${line}`)
        .join("\n");
    } else {
      if (!selectedText) {
        selectedText = placeholder;
      }

      selectedText = `${prefix}${selectedText}${suffix}`;
    }

    const updatedContent =
      content.slice(0, replaceStart) +
      selectedText +
      content.slice(replaceEnd);

    if (updatedContent.length > 50000) {
      setError("Formatting would exceed the 50,000 character limit.");
      return;
    }

    setError("");
    setContent(updatedContent);

    const selectionOffset = formatLines ? 0 : prefix.length;
    const nextSelectionStart = replaceStart + selectionOffset;
    const nextSelectionEnd = formatLines
      ? replaceStart + selectedText.length
      : nextSelectionStart +
        (content.slice(selectionStart, selectionEnd).length ||
          placeholder.length);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextSelectionStart, nextSelectionEnd);
    });
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
            aria-pressed={mode === "edit"}
            onClick={() => setMode("edit")}
          >
            Edit Markdown
          </button>

          <button
            type="button"
            className={mode === "preview" ? "active" : ""}
            aria-pressed={mode === "preview"}
            onClick={() => setMode("preview")}
          >
            Preview
          </button>
        </div>

        {mode === "edit" ? (
          <>
            <div className="markdown-formatting-toolbar" role="toolbar" aria-label="Markdown formatting">
              <button
                type="button"
                title="Bold"
                aria-label="Bold"
                onClick={() =>
                  formatSelection({ prefix: "**", suffix: "**", placeholder: "bold text" })
                }
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                title="Italic"
                aria-label="Italic"
                onClick={() =>
                  formatSelection({ prefix: "*", suffix: "*", placeholder: "italic text" })
                }
              >
                <em>I</em>
              </button>
              <button
                type="button"
                title="Heading"
                aria-label="Heading"
                onClick={() =>
                  formatSelection({ prefix: "## ", placeholder: "Heading", formatLines: true })
                }
              >
                H
              </button>
              <button
                type="button"
                title="Link"
                aria-label="Link"
                onClick={() =>
                  formatSelection({
                    prefix: "[",
                    suffix: "](url)",
                    placeholder: "link text",
                  })
                }
              >
                Link
              </button>
              <button
                type="button"
                title="Quote"
                aria-label="Quote"
                onClick={() =>
                  formatSelection({ prefix: "> ", placeholder: "Quote", formatLines: true })
                }
              >
                Quote
              </button>
              <button
                type="button"
                title="Bulleted list"
                aria-label="Bulleted list"
                onClick={() =>
                  formatSelection({ prefix: "- ", placeholder: "List item", formatLines: true })
                }
              >
                • List
              </button>
              <button
                type="button"
                title="Numbered list"
                aria-label="Numbered list"
                onClick={() =>
                  formatSelection({ prefix: "1. ", placeholder: "List item", formatLines: true })
                }
              >
                1. List
              </button>
              <button
                type="button"
                title="Inline code"
                aria-label="Inline code"
                onClick={() =>
                  formatSelection({ prefix: "`", suffix: "`", placeholder: "code" })
                }
              >
                {"< >"}
              </button>
              <button
                type="button"
                title="Code block"
                aria-label="Code block"
                onClick={() =>
                  formatSelection({
                    prefix: "```\n",
                    suffix: "\n```",
                    placeholder: "code",
                  })
                }
              >
                {"```"}
              </button>
            </div>
            <textarea
              ref={editorRef}
              className="markdown-input"
              aria-label="Note content in Markdown"
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
          </>
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