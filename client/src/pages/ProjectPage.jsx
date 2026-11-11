
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import { useAuth } from "../context/AuthContext";

import {
  getProjectById,
  addProjectMember,
} from "../services/projectService";

import {
  enableProjectSharing,
  disableProjectSharing,
} from "../services/shareService";

export default function ProjectPage() {
  const { projectId } = useParams();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [memberRole, setMemberRole] = useState("editor");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [shareUrl, setShareUrl] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [shareLoading, setShareLoading] = useState(false);

  // Load project details
  useEffect(() => {
    let cancelled = false;

    const loadProject = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProjectById(projectId);

        if (cancelled) return;

        setProject(data.project);
        setRole(data.role || "");
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load this project."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProject();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // Identify project owner
  const ownerId =
    typeof project?.owner === "object"
      ? project.owner?._id
      : project?.owner;

  const currentUserId = user?._id || user?.id;

  const isOwner =
    Boolean(ownerId) &&
    Boolean(currentUserId) &&
    String(ownerId) === String(currentUserId);

  const displayRole = isOwner
    ? "Owner"
    : role
      ? role.charAt(0).toUpperCase() +
        role.slice(1).toLowerCase()
      : "Not available";

  // Add team member
  const handleAddMember = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");
    setSaving(true);

    try {
      const data = await addProjectMember(projectId, {
        email,
        role: memberRole,
      });

      setProject(data.project);
      setEmail("");
      setMessage("Team member added successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to add this team member."
      );
    } finally {
      setSaving(false);
    }
  };

  // Enable public sharing
  const handleEnableSharing = async () => {
    try {
      setShareLoading(true);
      setShareMessage("");

      const data = await enableProjectSharing(projectId);

      setShareUrl(data.shareUrl || "");

      setShareMessage(
        data.shareUrl
          ? "Public sharing is enabled."
          : "Sharing was enabled, but no link was returned."
      );
    } catch (err) {
      setShareMessage(
        err.response?.data?.message ||
          "Could not enable sharing."
      );
    } finally {
      setShareLoading(false);
    }
  };

  // Disable public sharing
  const handleDisableSharing = async () => {
    try {
      setShareLoading(true);
      setShareMessage("");

      await disableProjectSharing(projectId);

      setShareUrl("");
      setShareMessage("Public sharing is disabled.");
    } catch (err) {
      setShareMessage(
        err.response?.data?.message ||
          "Could not disable sharing."
      );
    } finally {
      setShareLoading(false);
    }
  };

  // Copy sharing link
  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareMessage("Link copied to clipboard.");
    } catch {
      setShareMessage(
        "Copy failed. Select and copy the link manually."
      );
    }
  };

  if (loading) {
    return <p className="loading">Loading project...</p>;
  }

  if (!project) {
    return (
      <main className="dashboard">
        <p className="error-message">
          {error || "Project not found."}
        </p>

        <Link to="/dashboard">
          Back to dashboard
        </Link>
      </main>
    );
  }

  const ownerName =
    typeof project.owner === "object"
      ? project.owner?.name
      : null;

  const ownerEmail =
    typeof project.owner === "object"
      ? project.owner?.email
      : null;

  return (
    <main className="dashboard">

      {/* Back to dashboard */}
      <Link className="back-link" to="/dashboard">
        ← Back to dashboard
      </Link>

      {/* Project header */}
      <section className="welcome-card project-detail-header">
        <p className="eyebrow">PROJECT WORKSPACE</p>

        <h1>{project.name}</h1>

        <p>
          {project.description || "No description added yet."}
        </p>

        <span className="role-pill">
          Your role: {displayRole}
        </span>
      </section>

      {/* Project information */}
      <section className="project-section">
        <h2>Project information</h2>

        <div className="project-info-card">
          <p>
            <strong>Owner:</strong>{" "}
            {ownerName || "Owner details not loaded"}
          </p>

          <p>
            <strong>Owner email:</strong>{" "}
            {ownerEmail || "Owner email not loaded"}
          </p>

          <p>
            <strong>Created:</strong>{" "}
            {project.createdAt
              ? new Date(
                  project.createdAt
                ).toLocaleDateString()
              : "Not available"}
          </p>

          <p>
            <strong>Team members:</strong>{" "}
            {project.members?.length || 0}
          </p>
        </div>
      </section>

      {/* Team members */}
      <section className="project-section">
        <h2>Team members</h2>

        {!project.members?.length ? (
          <div className="empty-state">
            <h3>No teammates yet</h3>

            <p>
              Add a registered user to collaborate on this project.
            </p>
          </div>
        ) : (
          <div className="member-list">
            {project.members.map((member, index) => {
              const memberUser =
                member.user &&
                typeof member.user === "object"
                  ? member.user
                  : null;

              const memberId =
                memberUser?._id ||
                member.user ||
                member._id ||
                index;

              const memberDisplayRole =
                member.role
                  ? member.role.charAt(0).toUpperCase() +
                    member.role.slice(1).toLowerCase()
                  : "Not available";

              return (
                <article
                  className="member-card"
                  key={String(memberId)}
                >
                  <div>
                    <strong>
                      {memberUser?.name ||
                        "User details not loaded"}
                    </strong>

                    <p>
                      {memberUser?.email ||
                        "Member email not loaded"}
                    </p>
                  </div>

                  <span className="role-pill">
                    {memberDisplayRole}
                  </span>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Add team member */}
      {isOwner && (
        <section className="project-section">
          <h2>Add a team member</h2>

          <p className="section-description">
            Only registered users can be added at this stage.
          </p>

          <form
            className="project-form"
            onSubmit={handleAddMember}
          >
            <label htmlFor="member-email">
              Member email
            </label>

            <input
              id="member-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="teammate@example.com"
              required
            />

            <label htmlFor="member-role">
              Permission
            </label>

            <select
              id="member-role"
              value={memberRole}
              onChange={(event) =>
                setMemberRole(event.target.value)
              }
            >
              <option value="editor">
                Editor — can edit
              </option>

              <option value="viewer">
                Viewer — read only
              </option>
            </select>

            <button type="submit" disabled={saving}>
              {saving ? "Adding member..." : "Add member"}
            </button>
          </form>

          {error && (
            <p className="error-message">{error}</p>
          )}

          {message && (
            <p className="success-message">{message}</p>
          )}
        </section>
      )}

      {/* Public sharing */}
      {isOwner && (
        <section className="project-section share-section">
          <h2>Public sharing</h2>

          <p className="section-description">
            Create a read-only link to share this project's
            public overview. A project note titled README is
            included in the shared page.
          </p>

          <button
            type="button"
            onClick={handleEnableSharing}
            disabled={shareLoading}
          >
            {shareLoading
              ? "Please wait..."
              : "Generate share link"}
          </button>

          {shareUrl && (
            <div className="share-link-row">
              <input
                aria-label="Public project link"
                type="text"
                value={shareUrl}
                readOnly
              />

              <button
                type="button"
                onClick={handleCopyShareLink}
                disabled={shareLoading}
              >
                Copy link
              </button>

              <button
                type="button"
                onClick={handleDisableSharing}
                disabled={shareLoading}
              >
                Disable link
              </button>
            </div>
          )}

          {shareMessage && (
            <p
              className={
                shareMessage.includes("enabled") ||
                shareMessage.includes("copied")
                  ? "success-message"
                  : "section-description"
              }
              role="status"
            >
              {shareMessage}
            </p>
          )}
        </section>
      )}

      {/* Project tools */}
      <section className="project-section">
        <h2>Project tools</h2>

        <p className="section-description">
          Access all your collaboration and development tools.
        </p>

        <div className="project-tools">

          {/* NEW: Notes */}
          <Link to={`/projects/${project._id}/notes`}>
            <AppIcon name="notes" /> Project Notes
            <AppIcon name="arrow" size={17} />
          </Link>

          {/* Existing tools */}
          <Link to={`/projects/${project._id}/files`}>
            <AppIcon name="folder" /> Shared Files
            <AppIcon name="arrow" size={17} />
          </Link>

          <Link to={`/projects/${project._id}/ai`}>
            <AppIcon name="sparkle" /> AI Workspace
            <AppIcon name="arrow" size={17} />
          </Link>

          <Link to={`/projects/${project._id}/documentation`}>
            <AppIcon name="file" /> Documentation Generator
            <AppIcon name="arrow" size={17} />
          </Link>

          <Link to={`/projects/${project._id}/activity`}>
            <AppIcon name="activity" /> Activity Dashboard
            <AppIcon name="arrow" size={17} />
          </Link>

        </div>
      </section>

      {error && !message && (
        <p className="error-message">{error}</p>
      )}

    </main>
  );
}
