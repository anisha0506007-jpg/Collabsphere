
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  createProject,
  getProjects,
} from "../services/projectService";

function getOwnerId(project) {
  return String(
    project?.owner?._id ||
      project?.owner?.id ||
      project?.owner ||
      ""
  );
}

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "U"
  );
}

function formatDate(date) {
  if (!date) return "Recently created";

  const parsed = new Date(date);

  return Number.isNaN(parsed.getTime())
    ? "Recently created"
    : parsed.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentUserId = String(user?.id || user?._id || "");

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      try {
        const data = await getProjects();

        if (!cancelled) {
          setProjects(
            Array.isArray(data.projects) ? data.projects : []
          );
          setError("");
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load your workspace. Please try again."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  const ownProjects = useMemo(
    () =>
      projects.filter(
        (project) => getOwnerId(project) === currentUserId
      ),
    [projects, currentUserId]
  );

  const sharedProjects = useMemo(
    () =>
      projects.filter(
        (project) => getOwnerId(project) !== currentUserId
      ),
    [projects, currentUserId]
  );

  const filteredProjects = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return projects;

    return projects.filter((project) =>
      `${project.name || ""} ${project.description || ""}`
        .toLowerCase()
        .includes(term)
    );
  }, [projects, search]);

  async function handleCreateProject(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Please enter a project name.");
      return;
    }

    setCreating(true);

    try {
      const data = await createProject({
        name: name.trim(),
        description: description.trim(),
      });

      if (data.project) {
        setProjects((current) => [
          data.project,
          ...current.filter(
            (project) => project._id !== data.project._id
          ),
        ]);
      }

      setName("");
      setDescription("");
      setSuccess("Your project has been created successfully.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to create the project. Please try again."
      );
    } finally {
      setCreating(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function renderProject(project) {
    const ownedByMe =
      getOwnerId(project) === currentUserId;

    const ownerName =
      project.owner?.name ||
      (ownedByMe ? user?.name : "Workspace member");

    return (
      <article className="cs-project-card" key={project._id}>
        <div className="cs-project-card-top">
          <div className="cs-project-symbol" aria-hidden="true">
            {(project.name || "P").trim().charAt(0).toUpperCase()}
          </div>

          <span
            className={`cs-project-badge ${
              ownedByMe ? "is-owned" : "is-shared"
            }`}
          >
            <span className="cs-badge-dot" />
            {ownedByMe ? "Owned by you" : "Shared with you"}
          </span>
        </div>

        <h3>{project.name}</h3>

        <p className="cs-project-description">
          {project.description ||
            "A new space for your ideas, notes, and project files."}
        </p>

        <div className="cs-project-details">
          <span className="cs-project-owner">
            <span className="cs-mini-avatar">
              {getInitials(ownerName)}
            </span>

            <span>
              {ownedByMe ? "Your workspace" : `By ${ownerName}`}
            </span>
          </span>

          <span>{formatDate(project.createdAt)}</span>
        </div>

        <Link
          className="cs-open-project"
          to={`/projects/${project._id}`}
        >
          Open workspace <span aria-hidden="true">↗</span>
        </Link>
      </article>
    );
  }

  return (
    <main className="cs-dashboard" data-theme={theme}>
      <header className="cs-topbar">
        <Link
          className="cs-brand"
          to="/dashboard"
          aria-label="CollabSphere home"
        >
          <span className="cs-brand-mark">C</span>
          <span>
            Collab<span>Sphere</span>
          </span>
        </Link>

        <div className="cs-topbar-right">
          <div className="cs-account-chip">
            <span className="cs-account-avatar">
              {getInitials(user?.name)}
            </span>

            <span className="cs-account-copy">
              <strong>{user?.name || "Your account"}</strong>
              <small>{user?.email || "Personal workspace"}</small>
            </span>
          </div>

          <button
            className="cs-logout-button"
            onClick={handleLogout}
            type="button"
          >
            <span aria-hidden="true">↗</span> Log out
          </button>
        </div>
      </header>

      <section className="cs-hero">
        <div className="cs-hero-copy">
          <span className="cs-eyebrow">
            <span className="cs-live-dot" />
            YOUR PERSONAL WORKSPACE
          </span>

          <h1>
            Make room for
            <br />
            <span>great ideas.</span>
          </h1>

          <p>
            Bring your projects, notes, files, and AI tools together
            in one calm, focused workspace.
          </p>

          <a className="cs-hero-cta" href="#create-project">
            <span aria-hidden="true">＋</span> Create a project
          </a>
        </div>

        <div className="cs-hero-art" aria-hidden="true">
          <div className="cs-art-orbit cs-orbit-one" />
          <div className="cs-art-orbit cs-orbit-two" />

          <div className="cs-art-window">
            <div className="cs-art-window-bar">
              <i />
              <i />
              <i />
              <span>project-space</span>
            </div>

            <div className="cs-art-window-body">
              <div className="cs-art-sidebar">
                <b />
                <i />
                <i />
                <i />
              </div>

              <div className="cs-art-content">
                <span className="cs-art-label">
                  YOUR NEXT BIG THING
                </span>

                <b className="cs-art-line wide" />
                <b className="cs-art-line medium" />

                <div className="cs-art-task">
                  <span>✓</span>
                  <i />
                  <b />
                </div>

                <div className="cs-art-task">
                  <span>✦</span>
                  <i />
                  <b />
                </div>

                <div className="cs-art-task">
                  <span>↗</span>
                  <i />
                  <b />
                </div>
              </div>
            </div>
          </div>

          <div className="cs-art-float cs-float-note">
            <span>✦</span>
            <div>
              <b>Ideas, organized</b>
              <small>One workspace at a time</small>
            </div>
          </div>

          <div className="cs-art-float cs-float-ai">
            <span>AI</span>
            <div>
              <b>AI assistant</b>
              <small>Ready when you are</small>
            </div>
          </div>
        </div>

        <div className="cs-hero-decoration" aria-hidden="true">
          ✳
        </div>
      </section>

      <section
        className="cs-overview"
        aria-label="Workspace overview"
      >
        <div className="cs-overview-card">
          <span className="cs-overview-icon orange">▦</span>
          <div>
            <p>All accessible projects</p>
            <strong>{loading ? "—" : projects.length}</strong>
          </div>
          <small>In your workspace</small>
        </div>

        <div className="cs-overview-card">
          <span className="cs-overview-icon peach">✦</span>
          <div>
            <p>Created by you</p>
            <strong>{loading ? "—" : ownProjects.length}</strong>
          </div>
          <small>Your projects</small>
        </div>

        <div className="cs-overview-card">
          <span className="cs-overview-icon green">↗</span>
          <div>
            <p>Shared with you</p>
            <strong>{loading ? "—" : sharedProjects.length}</strong>
          </div>
          <small>Collaborations</small>
        </div>
      </section>

      <section className="cs-main-grid">
        <div className="cs-projects-panel">
          <div className="cs-section-heading">
            <div>
              <span className="cs-eyebrow">
                YOUR WORK, AT A GLANCE
              </span>

              <h2>
                Projects{" "}
                <span className="cs-count-pill">
                  {loading ? "…" : projects.length}
                </span>
              </h2>

              <p>
                Only your projects and projects shared with your
                account appear here.
              </p>
            </div>

            <label className="cs-search-box">
              <span aria-hidden="true">⌕</span>
              <input
                aria-label="Search projects"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search projects"
              />
            </label>
          </div>

          {error && (
            <p className="cs-alert cs-alert-error" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="cs-alert cs-alert-success" role="status">
              {success}
            </p>
          )}

          {loading ? (
            <div className="cs-loading-state">
              <span className="cs-spinner" />
              Loading your projects…
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="cs-empty-state">
              <div className="cs-empty-icon">▦</div>

              <h3>
                {search
                  ? "No matching projects"
                  : "Your workspace starts here"}
              </h3>

              <p>
                {search
                  ? "Try another project name or keyword."
                  : "Create your first project and keep everything you need in one place."}
              </p>

              {!search && (
                <a
                  href="#create-project"
                  className="cs-empty-link"
                >
                  Create your first project <span>→</span>
                </a>
              )}
            </div>
          ) : (
            <div className="cs-project-grid">
              {filteredProjects.map(renderProject)}
            </div>
          )}
        </div>

        <aside className="cs-create-panel" id="create-project">
          <div className="cs-create-icon">＋</div>

          <span className="cs-eyebrow">START SOMETHING NEW</span>

          <h2>Create a project</h2>

          <p>
            Give your idea a home. You can invite collaborators
            from the project workspace later.
          </p>

          <form
            className="cs-create-form"
            onSubmit={handleCreateProject}
          >
            <label htmlFor="project-name">
              Project name <span>*</span>
            </label>

            <input
              id="project-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Portfolio website"
              maxLength={100}
              required
            />

            <label htmlFor="project-description">
              Short description <small>Optional</small>
            </label>

            <textarea
              id="project-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="What are you planning to build?"
              rows={4}
              maxLength={1000}
            />

            <button
              type="submit"
              className="cs-create-button"
              disabled={creating}
            >
              {creating ? "Creating project…" : "Create project"}
              <span aria-hidden="true">→</span>
            </button>

            <small className="cs-privacy-note">
              <span aria-hidden="true">♢</span>
              Your projects are private to your account by default.
            </small>
          </form>
        </aside>
      </section>

      <footer className="cs-footer">
        <span>© {new Date().getFullYear()} CollabSphere</span>
        <span>Build together. Think bigger.</span>
      </footer>
    </main>
  );
}
