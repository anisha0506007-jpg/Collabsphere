import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import api from "../services/api";

import {
  getProjectFiles,
  uploadProjectFile,
  deleteProjectFile,
} from "../services/fileService";

import FilePreview from "../components/FilePreview";

export default function FilesPage() {
  const { projectId } = useParams();

  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadFiles = async () => {
    try {
      setError("");

      const data = await getProjectFiles(projectId);

      setFiles(data.files || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Could not load files."
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

    if (!uploadFile) {
      setError("Please select a file.");
      return;
    }

    if (uploadFile.size > 10 * 1024 * 1024) {
      setError("Maximum file size is 10 MB.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setMessage("");

      await uploadProjectFile(projectId, uploadFile);

      setUploadFile(null);
      event.target.reset();

      setMessage("File uploaded successfully.");

      await loadFiles();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "File upload failed."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (file) => {
    try {
      const response = await api.get(
        `/files/${projectId}/${file._id}`,
        { responseType: "blob" }
      );

      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");

      link.href = url;
      link.download = file.originalName;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Download failed."
      );
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Delete this file permanently?")) {
      return;
    }

    try {
      await deleteProjectFile(projectId, fileId);

      setFiles((current) =>
        current.filter((file) => file._id !== fileId)
      );

      if (selectedFile?._id === fileId) {
        setSelectedFile(null);
      }

      setMessage("File deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Could not delete file."
      );
    }
  };

  if (loading) {
    return <main className="files-page">Loading files...</main>;
  }

  return (
    <main className="files-page">
      <header className="files-header">
        <p className="eyebrow">PROJECT WORKSPACE</p>
        <h1>Shared Files</h1>
        <p>
          Upload, preview, download and explain your project files.
        </p>
      </header>

      {error && (
        <p className="status-message error">{error}</p>
      )}

      {message && (
        <p className="status-message success">{message}</p>
      )}

      <form className="upload-card" onSubmit={handleUpload}>
        <h2>Upload a file</h2>

        <p>
          Upload PDFs, images, Markdown, documents and source code.
          Maximum size: 10 MB.
        </p>

        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.docx,.js,.jsx,.ts,.tsx,.py,.html,.css,.json,.java,.c,.cpp,.cs,.php,.sql,.xml,.yml,.yaml,.sh"
          onChange={(event) =>
            setUploadFile(event.target.files?.[0] || null)
          }
        />

        {uploadFile && (
          <p>Selected: {uploadFile.name}</p>
        )}

        <button
          className="primary-button"
          type="submit"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload File"}
        </button>
      </form>

      <section className="files-list">
        <h2>Project files ({files.length})</h2>

        {files.length === 0 ? (
          <p>No files uploaded yet.</p>
        ) : (
          files.map((file) => (
            <article className="file-card" key={file._id}>
              <div className="file-details">
                <strong>{file.originalName}</strong>

                <span>
                  {(file.size / 1024).toFixed(1)} KB
                </span>

                <span>
                  Uploaded by: {file.uploadedBy?.name || "Unknown"}
                </span>

                <span>
                  {new Date(file.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="file-actions">
                <button
                  className="secondary-button"
                  onClick={() => setSelectedFile(file)}
                >
                  Preview
                </button>

                <button
                  className="secondary-button"
                  onClick={() => handleDownload(file)}
                >
                  Download
                </button>

                <button
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

      {selectedFile && (
        <div className="file-preview-overlay">
          <FilePreview
            projectId={projectId}
            file={selectedFile}
            onClose={() => setSelectedFile(null)}
          />
        </div>
      )}
    </main>
  );
}