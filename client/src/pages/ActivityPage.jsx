
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getProjectActivity,
  getProjectStats,
} from "../services/activityService";

const actionLabels = {
  project_created: "created this project",
  member_added: "added a team member",
  note_created: "created a note",
  note_updated: "updated a note",
  note_deleted: "deleted a note",
  file_uploaded: "uploaded a file",
  file_deleted: "deleted a file",
};

export default function ActivityPage() {
  const { projectId } = useParams();

  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({
    notes: 0,
    files: 0,
    members: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setError("");

      const [activityData, statsData] = await Promise.all([
        getProjectActivity(projectId),
        getProjectStats(projectId),
      ]);

      setActivities(activityData.activities);
      setStats(statsData.stats);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load project activity."
      );
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return <main className="activity-page">Loading dashboard...</main>;
  }

  if (error) {
    return (
      <main className="activity-page">
        <p className="status-message error">{error}</p>
        <button
          className="secondary-button"
          onClick={loadDashboard}
        >
          Try again
        </button>
      </main>
    );
  }

  return (
    <main className="activity-page">
      <header className="activity-header">
        <p className="eyebrow">PROJECT INSIGHTS</p>
        <h1>Activity Dashboard</h1>
        <p>See your project's progress and recent team activity.</p>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <span className="stat-icon">📝</span>
          <p>Total notes</p>
          <h2>{stats.notes}</h2>
        </article>

        <article className="stat-card">
          <span className="stat-icon">📁</span>
          <p>Shared files</p>
          <h2>{stats.files}</h2>
        </article>

        <article className="stat-card">
          <span className="stat-icon">👥</span>
          <p>Team members</p>
          <h2>{stats.members + 1}</h2>
          <span className="stat-hint">Including the owner</span>
        </article>
      </section>

      <section className="activity-panel">
        <div className="activity-panel-heading">
          <div>
            <h2>Recent activity</h2>
            <p>The latest project events recorded by CollabSphere.</p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={loadDashboard}
          >
            Refresh
          </button>
        </div>

        {activities.length === 0 ? (
          <p className="empty-activity">
            No activity yet. Create a note or upload a file to get started.
          </p>
        ) : (
          <div className="activity-list">
            {activities.map((activity) => (
              <article className="activity-item" key={activity._id}>
                <div className="activity-dot" />

                <div className="activity-item-content">
                  <p>
                    <strong>
                      {activity.user?.name || "A team member"}
                    </strong>{" "}
                    {actionLabels[activity.action] || "performed an action"}
                  </p>

                  {activity.details && (
                    <span>{activity.details}</span>
                  )}

                  <time dateTime={activity.createdAt}>
                    {new Date(activity.createdAt).toLocaleString()}
                  </time>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
