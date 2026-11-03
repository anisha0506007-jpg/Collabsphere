import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";

import NoteEditor from "../components/NoteEditor";

import {
  getProjectNotes,
  createNote,
  updateNote,
  deleteNote,
} from "../services/noteService";

export default function NotesPage() {
  const { projectId } = useParams();

  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadNotes = async () => {
    try {
      const data = await getProjectNotes(projectId);

      setNotes(data.notes || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Could not load project notes."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    getProjectNotes(projectId)
      .then((data) => {
        if (!cancelled) {
          setNotes(data.notes || []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
            "Could not load project notes."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const handleSave = async (noteData) => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (selectedNote) {
        await updateNote(
          projectId,
          selectedNote._id,
          noteData
        );

        setMessage("Note updated successfully.");
      } else {
        await createNote(projectId, noteData);

        setMessage("Note created successfully.");
      }

      setEditorOpen(false);
      setSelectedNote(null);

      await loadNotes();
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (note) => {
    setSelectedNote(note);
    setEditorOpen(true);
    setMessage("");
    setError("");
  };

  const handleCreate = () => {
    setSelectedNote(null);
    setEditorOpen(true);
    setMessage("");
    setError("");
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm("Delete this note permanently?")) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await deleteNote(projectId, noteId);

      setNotes((current) =>
        current.filter((note) => note._id !== noteId)
      );

      if (selectedNote?._id === noteId) {
        setSelectedNote(null);
        setEditorOpen(false);
      }

      setMessage("Note deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Could not delete note."
      );
    }
  };

  if (loading) {
    return <main className="notes-page">Loading notes...</main>;
  }

  return (
    <main className="notes-page">
      <header className="notes-header">
        <div>
          <p className="eyebrow">PROJECT WORKSPACE</p>
          <h1>Project Notes</h1>
          <p>
            Write, organize and improve your project notes
            using Markdown and Gemini AI.
          </p>
        </div>

        <div className="notes-header-actions">
          <Link
            className="secondary-button"
            to={`/projects/${projectId}`}
          >
            Back to Project
          </Link>

          <button
            className="primary-button"
            onClick={handleCreate}
          >
            + Create Note
          </button>
        </div>
      </header>

      {error && (
        <p className="status-message error">{error}</p>
      )}

      {message && (
        <p className="status-message success">{message}</p>
      )}

      {editorOpen && (
        <NoteEditor
          key={selectedNote?._id || "new-note"}
          projectId={projectId}
          note={selectedNote}
          onSave={handleSave}
          onCancel={() => {
            setEditorOpen(false);
            setSelectedNote(null);
          }}
          saving={saving}
        />
      )}

      <section className="notes-list">
        <div className="notes-list-heading">
          <h2>All Notes</h2>
          <span>{notes.length} notes</span>
        </div>

        {notes.length === 0 ? (
          <div className="empty-notes">
            <h3>No notes yet</h3>
            <p>
              Create your first Markdown note for this project.
            </p>

            <button
              className="primary-button"
              onClick={handleCreate}
            >
              Create your first note
            </button>
          </div>
        ) : (
          <div className="notes-grid">
            {notes.map((note) => (
              <article className="note-card" key={note._id}>
                <div className="note-card-header">
                  <h3>{note.title}</h3>

                  <span>
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="note-card-preview">
                  <ReactMarkdown>
                    {(note.content || "").slice(0, 450)}
                  </ReactMarkdown>
                </div>

                <p className="note-author">
                  By {note.author?.name || "Unknown member"}
                </p>

                <div className="note-card-actions">
                  <button
                    className="secondary-button"
                    onClick={() => handleEdit(note)}
                  >
                    Edit
                  </button>

                  <button
                    className="danger-button"
                    onClick={() => handleDelete(note._id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}