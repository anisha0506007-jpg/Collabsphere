import { Navigate, Routes, Route } from "react-router-dom";

import ThemeToggle from "./components/ThemeToggle";
import ProtectedRoute from "./components/ProtectedRoute";

import DashboardPage from "./pages/DashboardPage";
import ProjectPage from "./pages/ProjectPage";
import FilesPage from "./pages/FilesPage";
import AIWorkspacePage from "./pages/AIWorkspacePage";
import DocumentationPage from "./pages/DocumentationPage";
import ActivityPage from "./pages/ActivityPage";
import PublicProjectPage from "./pages/PublicProjectPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route
            path="/projects/:projectId"
            element={<ProjectPage />}
          />

          <Route
            path="/projects/:projectId/files"
            element={<FilesPage />}
          />

          <Route
            path="/projects/:projectId/ai"
            element={<AIWorkspacePage />}
          />

          <Route
            path="/projects/:projectId/documentation"
            element={<DocumentationPage />}
          />

          <Route
            path="/projects/:projectId/activity"
            element={<ActivityPage />}
          />
        </Route>

        <Route
          path="/public/:token"
          element={<PublicProjectPage />}
        />

        <Route
          path="/shared/:token"
          element={<PublicProjectPage />}
        />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>

      <ThemeToggle />
    </>
  );
}

export default App;