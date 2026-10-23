
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getProjectById,
  addProjectMember,
} from "../services/projectService";
import {
  enableProjectSharing,
  disableProjectSharing,
} from "../services/shareService";

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}

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

  useEffect(() => {
    let cancelled = false;

    async function loadProject() {
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
    }

    loadProject();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

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

  const ownerName =
    typeof project?.owner === "object"
      ? project.owner?.name
      : null;

  const ownerEmail =
    typeof project?.owner === "object"
      ? project.owner?.email
      : null;

  async function handleAddMember(event) {
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
  }

  async function handleEnableSharing() {
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
  }

  async function handleDisableSharing() {
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
  }

  async function handleCopyShareLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareMessage("Link copied to clipboard.");
    } catch {
      setShareMessage(
        "Copy failed. Select and copy the link manually."
      );
    }
  }

  if (loading) {
    return (
      <main className="workspace-page">
        <div className="workspace-loading">
          <span className="workspace-spinner" />
          Loading your workspace…
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="workspace-page">
        <div className="workspace-alert error-message">
          {error || "Project not found."}
        </div>

        <Link className="workspace-back-link" to="/dashboard">
          ← Back to dashboard
        </Link>
      </main>
    );
  }

  const tools = [
    {
      icon: "▤",
      title: "Shared files",
      description:
        "Upload, organize, and download project files.",
      path: `/projects/${project._id}/files`,
      label: "Open files",
    },
    {
      icon: "✦",
      title: "AI workspace",
      description:
        "Ask questions, explain code, and get development help.",
      path: `/projects/${project._id}/ai`,
      label: "Open AI tools",
    },
    {
      icon: "⌘",
      title: "Documentation",
      description:
        "Generate and refine README or API documentation.",
      path: `/projects/${project._id}/documentation`,
      label: "Create documentation",
    },
    {
      icon: "↗",
      title: "Activity dashboard",
      description:
        "Review project activity and collaboration stats.",
      path: `/projects/${project._id}/activity`,
      label: "View activity",
    },
  ];

  return (
    <main className="workspace-page">
      <div className="workspace-topline">
        <Link className="workspace-back-link" to="/dashboard">
          ← All projects
        </Link>

        <span className="workspace-breadcrumb">
          Workspace <span>/</span> {project.name}
        </span>
      </div>

      <section className="workspace-hero">
        <div className="workspace-hero-copy">
          <div className="workspace-project-mark">
            {(project.name || "P").charAt(0).toUpperCase()}
          </div>

          <div className="workspace-kicker">
            PROJECT WORKSPACE
          </div>

          <h1>{project.name}</h1>

          <p>
            {project.description ||
              "Your team's space for files, documentation, and AI-powered development."}
          </p>

          <div className="workspace-hero-meta">
            <span className="workspace-role-pill">
              <span className="workspace-role-dot" />
              Your role: {displayRole}
            </span>

            <span className="workspace-created">
              Created{" "}
              {project.createdAt
                ? new Date(project.createdAt).toLocaleDateString()
                : "recently"}
            </span>
          </div>
        </div>

        <div className="workspace-hero-art" aria-hidden="true">
          <span>✦</span>
          <i />
          <b />
          <em />
        </div>
      </section>

      {error && (
        <p className="workspace-alert error-message" role="alert">
          {error}
        </p>
      )}

      {message && (
        <p
          className="workspace-alert success-message"
          role="status"
        >
          {message}
        </p>
      )}

      <section className="workspace-section">
        <div className="workspace-section-heading">
          <div>
            <span className="workspace-overline">
              YOUR PROJECT
            </span>
            <h2>Workspace tools</h2>
            <p>
              Everything you need to keep this project moving.
            </p>
          </div>
        </div>

        <div className="workspace-tool-grid">
          {tools.map((tool) => (
            <Link
              className="workspace-tool-card"
              to={tool.path}
              key={tool.title}
            >
              <span className="workspace-tool-icon">
                {tool.icon}
              </span>

              <h3>{tool.title}</h3>
              <p>{tool.description}</p>

              <span className="workspace-tool-link">
                {tool.label} <span>→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="workspace-section">
        <div className="workspace-section-heading">
          <div>
            <span className="workspace-overline">
              PROJECT DETAILS
            </span>
            <h2>Project information</h2>
          </div>
        </div>

        <div className="workspace-info-grid">
          <article className="workspace-info-card">
            <span className="workspace-info-label">
              Project owner
            </span>

            <div className="workspace-owner-row">
              <span className="workspace-member-avatar">
                {getInitials(ownerName || user?.name)}
              </span>

              <div>
                <strong>
                  {ownerName ||
                    (isOwner ? user?.name : null) ||
                    "Project owner"}
                </strong>
                <p>
                  {ownerEmail ||
                    (isOwner ? user?.email : null) ||
                    "Owner email not available"}
                </p>
              </div>
            </div>
          </article>

          <article className="workspace-info-card">
            <span className="workspace-info-label">
              Team members
            </span>

            <strong className="workspace-info-number">
              {(project.members?.length || 0) + 1}
            </strong>

            <p>Including the project owner</p>
          </article>

          <article className="workspace-info-card">
            <span className="workspace-info-label">
              Your permission
            </span>

            <strong className="workspace-info-role">
              {displayRole}
            </strong>

            <p>
              {isOwner
                ? "You manage this project"
                : role === "viewer"
                  ? "Read-only access"
                  : "Collaborator access"}
            </p>
          </article>
        </div>
      </section>

      <section className="workspace-section">
        <div className="workspace-section-heading">
          <div>
            <span className="workspace-overline">
              COLLABORATION
            </span>
            <h2>Team members</h2>
            <p>People who have access to this project.</p>
          </div>

          <span className="workspace-count">
            {project.members?.length || 0} members
          </span>
        </div>

        {project.members?.length ? (
          <div className="workspace-members">
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

              const memberDisplayRole = member.role
                ? member.role.charAt(0).toUpperCase() +
                  member.role.slice(1).toLowerCase()
                : "Not available";

              return (
                <article
                  className="workspace-member-card"
                  key={String(memberId)}
                >
                  <span className="workspace-member-avatar">
                    {getInitials(memberUser?.name || "Member")}
                  </span>

                  <div className="workspace-member-copy">
                    <strong>
                      {memberUser?.name || "Member"}
                    </strong>
                    <p>
                      {memberUser?.email ||
                        "Member email not available"}
                    </p>
                  </div>

                  <span
                    className={`workspace-member-role ${
                      member.role === "viewer"
                        ? "viewer"
                        : "editor"
                    }`}
                  >
                    {memberDisplayRole}
                  </span>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="workspace-empty">
            <span>♧</span>
            <h3>No teammates yet</h3>
            <p>
              Add a registered user to collaborate on this project.
            </p>
          </div>
        )}
      </section>

      {isOwner && (
        <section className="workspace-section workspace-management-grid">
          <div className="workspace-management-card">
            <span className="workspace-overline">
              INVITE COLLABORATORS
            </span>

            <h2>Add a team member</h2>

            <p>
              Invite an existing CollabSphere user and choose
              their access level.
            </p>

            <form
              className="project-form workspace-member-form"
              onSubmit={handleAddMember}
            >
              <label htmlFor="member-email">
                Member email
              </label>

              <input
                id="member-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="teammate@example.com"
                required
              />

              <label htmlFor="member-role">
                Permission level
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
                {saving ? "Adding member…" : "Add team member →"}
              </button>
            </form>
          </div>

          <div className="workspace-management-card workspace-sharing-card">
            <span className="workspace-overline">
              SHARE YOUR WORK
            </span>

            <h2>Public sharing</h2>

            <p>
              Create a read-only link to share this project's
              public overview. Anyone with the link may be able
              to view it.
            </p>

            <button
              className="primary-button"
              type="button"
              onClick={handleEnableSharing}
              disabled={shareLoading}
            >
              {shareLoading
                ? "Please wait…"
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
                  className="secondary-button"
                  type="button"
                  onClick={handleCopyShareLink}
                  disabled={shareLoading}
                >
                  Copy
                </button>

                <button
                  className="danger-button"
                  type="button"
                  onClick={handleDisableSharing}
                  disabled={shareLoading}
                >
                  Disable
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
          </div>
        </section>
      )}

      <footer className="workspace-footer">
        <Link to="/dashboard">← Back to all projects</Link>
        <span>CollabSphere · Build together. Think bigger.</span>
      </footer>
    </main>
  );
}
