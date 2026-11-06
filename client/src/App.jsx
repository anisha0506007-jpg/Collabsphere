import { Navigate, Route, Routes } from "react-router-dom";

import ProjectPage from "./pages/ProjectPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";

import ProtectedRoute from "./components/ProtectedRoute";

import FilesPage from "./pages/FilesPage";
import NotesPage from "./pages/NotesPage";
import AIWorkspacePage from "./pages/AIWorkspacePage";
import DocumentationPage from "./pages/DocumentationPage";
import ActivityPage from "./pages/ActivityPage";
import PublicProjectPage from "./pages/PublicProjectPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/shared/:token"
        element={<PublicProjectPage />}
      />
      <Route
        path="/public/:token"
        element={<PublicProjectPage />}
      />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route
          path="/projects/:projectId"
          element={<ProjectPage />}
        />

        <Route
          path="/projects/:projectId/notes"
          element={<NotesPage />}
        />

        <Route
          path="/projects/:projectId/files"
          element={<FilesPage />}
        />

        <Route
          path="/projects/:projectId/activity"
          element={<ActivityPage />}
        />

        <Route
          path="/projects/:projectId/ai"
          element={<AIWorkspacePage />}
        />

        <Route
          path="/projects/:projectId/documentation"
          element={<DocumentationPage />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}