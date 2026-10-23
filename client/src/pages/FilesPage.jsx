
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import {
  getProjectFiles,
  uploadProjectFile,
  deleteProjectFile,
} from "../services/fileService";

export default function FilesPage() {
  const { projectId } = useParams();

  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadFiles = async () => {
    try {
      setError("");
      const data = await getProjectFiles(projectId);
      setFiles(data.files);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not load files."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [projectId]);

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("The maximum file size is 10 MB.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setMessage("");

      await uploadProjectFile(projectId, selectedFile);

      setSelectedFile(null);
      event.target.reset();

      setMessage("File uploaded successfully.");
      await loadFiles();
    } catch (err) {
      setError(
        err.response?.data?.message || "File upload failed."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (file) => {
    try {
      setError("");

      const response = await api.get(
        `/files/${projectId}/${file._id}`,
        { responseType: "blob" }
      );

      const blobUrl = URL.createObjectURL(response.data);
      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = file.originalName;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError(
        err.response?.data?.message || "Download failed."
      );
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await deleteProjectFile(projectId, fileId);

      setFiles((currentFiles) =>
        currentFiles.filter((file) => file._id !== fileId)
      );

      setMessage("File deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not delete file."
      );
    }
  };

  if (loading) return <p>Loading files...</p>;

  return (
    <main className="files-page">
      <header className="files-header">
        <p className="eyebrow">PROJECT WORKSPACE</p>
        <h1>Shared Files</h1>
        <p>Keep your team's project documents in one place.</p>
      </header>

      {error && <p className="status-message error">{error}</p>}
      {message && <p className="status-message success">{message}</p>}

      <form className="upload-card" onSubmit={handleUpload}>
        <h2>Upload a file</h2>
        <p>PDFs, images, text, Markdown, and DOCX files up to 10 MB.</p>

        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.docx"
          onChange={(event) =>
            setSelectedFile(event.target.files?.[0] || null)
          }
        />

        <button
          className="primary-button"
          type="submit"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload file"}
        </button>
      </form>

      <section className="files-list">
        <h2>Project files ({files.length})</h2>

        {files.length === 0 ? (
          <p className="empty-files">
            No files uploaded yet. Add the first project document.
          </p>
        ) : (
          files.map((file) => (
            <article className="file-card" key={file._id}>
              <div className="file-details">
                <strong>{file.originalName}</strong>
                <span>
                  {(file.size / 1024).toFixed(1)} KB
                </span>
                <span>
                  Uploaded{" "}
                  {new Date(file.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="file-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => handleDownload(file)}
                >
                  Download
                </button>

                <button
                  type="button"
                  className="danger-button"
                  onClick={() => handleDelete(file._id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
