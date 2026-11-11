import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AppIcon from "../components/AppIcon";

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

  const [contributions, setContributions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setError("");

      const [activityData, statsData] = await Promise.all([
        getProjectActivity(projectId),
        getProjectStats(projectId),
      ]);

      setActivities(activityData.activities || []);
      setStats(statsData.stats || {});
      setContributions(statsData.contributions || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Could not load activity."
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
          Try Again
        </button>
      </main>
    );
  }

  return (
    <main className="activity-page">
      <header className="activity-header">
        <p className="eyebrow">PROJECT INSIGHTS</p>
        <h1>Activity Dashboard</h1>
        <p>
          Track project progress and individual team contributions.
        </p>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <span><AppIcon name="notes" /></span>
          <p>Total Notes</p>
          <h2>{stats.notes}</h2>
        </article>

        <article className="stat-card">
          <span><AppIcon name="folder" /></span>
          <p>Total Files</p>
          <h2>{stats.files}</h2>
        </article>

        <article className="stat-card">
          <span><AppIcon name="users" /></span>
          <p>Team Members</p>
          <h2>{stats.members}</h2>
        </article>
      </section>

      <section className="contribution-panel">
        <div className="activity-panel-heading">
          <div>
            <h2>Member Contributions</h2>
            <p>Notes and files contributed by each team member.</p>
          </div>

          <button
            className="secondary-button"
            onClick={loadDashboard}
          >
            Refresh
          </button>
        </div>

        {contributions.length === 0 ? (
          <p>No contribution data available.</p>
        ) : (
          <div className="contribution-table-wrapper">
            <table className="contribution-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th>Notes</th>
                  <th>Files</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {contributions.map((member) => (
                  <tr key={member.userId}>
                    <td>
                      <strong>{member.name}</strong>
                      <small>{member.email}</small>
                    </td>

                    <td>{member.role || "Owner"}</td>
                    <td>{member.notes}</td>
                    <td>{member.files}</td>
                    <td>
                      <strong>{member.total}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="activity-panel">
        <h2>Recent Activity</h2>

        {activities.length === 0 ? (
          <p>No activity yet.</p>
        ) : (
          <div className="activity-list">
            {activities.map((activity) => (
              <article
                className="activity-item"
                key={activity._id}
              >
                <div className="activity-dot" />

                <div className="activity-item-content">
                  <p>
                    <strong>
                      {activity.user?.name || "A team member"}
                    </strong>{" "}
                    {actionLabels[activity.action] ||
                      "performed an action"}
                  </p>

                  {activity.details && (
                    <span>{activity.details}</span>
                  )}

                  <time>
                    {new Date(
                      activity.createdAt
                    ).toLocaleString()}
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