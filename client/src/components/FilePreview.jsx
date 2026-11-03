import { useEffect, useState } from "react";
import api from "../services/api";
import { explainWithGemini } from "../services/aiService";

export default function FilePreview({
  projectId,
  file,
  onClose,
}) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    let objectUrl;

    const loadPreview = async () => {
      try {
        setLoading(true);
        setError("");

        const extension =
          file.originalName.split(".").pop().toLowerCase();

        const isImage = [
          "png", "jpg", "jpeg", "webp",
        ].includes(extension);

        const isPdf = extension === "pdf";

        const response = await api.get(
          `/files/${projectId}/${file._id}/preview`,
          {
            responseType:
              isImage || isPdf ? "blob" : "json",
          }
        );

        if (isImage || isPdf) {
          objectUrl = URL.createObjectURL(response.data);

          setPreview({
            type: isImage ? "image" : "pdf",
            url: objectUrl,
          });
        } else {
          setPreview(response.data);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Could not load file preview."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPreview();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [projectId, file]);

  const explainCode = async () => {
    if (!preview?.content) return;

    try {
      setAiLoading(true);
      setAiAnswer("");
      setError("");

      const response = await explainWithGemini(
        projectId,
        `Explain this source code in detail.

File: ${file.originalName}

Code:
${preview.content}`
      );

      setAiAnswer(response.answer);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Could not explain this code."
      );
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <section className="file-preview-modal">
      <div className="file-preview-header">
        <h2>{file.originalName}</h2>

        <button
          className="secondary-button"
          onClick={onClose}
        >
          Close
        </button>
      </div>

      {loading && <p>Loading preview...</p>}

      {error && (
        <p className="status-message error">{error}</p>
      )}

      {preview?.type === "image" && (
        <img
          className="file-preview-image"
          src={preview.url}
          alt={file.originalName}
        />
      )}

      {preview?.type === "pdf" && (
        <iframe
          className="file-preview-pdf"
          src={preview.url}
          title={file.originalName}
        />
      )}

      {preview?.type === "code" && (
        <>
          <pre className="file-code-content">
            <code>{preview.content}</code>
          </pre>

          <button
            className="primary-button"
            onClick={explainCode}
            disabled={aiLoading}
          >
            {aiLoading
              ? "Gemini is explaining..."
              : "Explain this Code with Gemini"}
          </button>
        </>
      )}

      {preview?.type === "unsupported" && (
        <p>{preview.message}</p>
      )}

      {aiAnswer && (
        <section className="gemini-result">
          <h3>Gemini Code Explanation</h3>
          <pre>{aiAnswer}</pre>
        </section>
      )}
    </section>
  );
}