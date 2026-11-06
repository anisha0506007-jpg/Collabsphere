
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { getPublicProject } from "../services/shareService";

function PublicProjectPage() {
  const { token } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getPublicProject(token);
        setProject(data.project);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load this public project."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [token]);

  if (loading) {
    return <main className="public-project">Loading project...</main>;
  }

  if (error || !project) {
    return (
      <main className="public-project">
        <h1>Project unavailable</h1>
        <p>{error || "This project is not available publicly."}</p>
      </main>
    );
  }

  return (
    <main className="public-project">
      <div className="public-project-card">
        <p className="public-project-label">
          COLLABSPHERE · PUBLIC PROJECT
        </p>

        <h1>{project.name}</h1>

        <p className="public-project-description">
          {project.description || "No project description provided."}
        </p>

        {project.readme && (
          <section className="public-project-readme">
            <h2>{project.readme.title}</h2>
            <div className="markdown-preview">
              <ReactMarkdown>
                {project.readme.content || ""}
              </ReactMarkdown>
            </div>
          </section>
        )}

        <p className="public-project-date">
          Created on{" "}
          {new Date(project.createdAt).toLocaleDateString()}
        </p>

        <p className="public-project-notice">
          You are viewing the public project overview
          {project.readme ? " and README" : ""}.
        </p>
      </div>
    </main>
  );
}

export default PublicProjectPage;
