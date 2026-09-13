import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import NotFound from "./Pages/NotFound";
import ProtectedRoute from "./Components/ProtectedRoute";

import Editor from "./Editor";
import { useDocuments } from "./useDocuments";

function App() {
  const documentsState = useDocuments();

  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Dashboard - Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Document Editor - Protected */}
        <Route
          path="/document/:id"
          element={
            <ProtectedRoute>
              <Editor {...documentsState} />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route
          path="/404"
          element={<NotFound />}
        />

        {/* Unknown URL */}
        <Route
          path="*"
          element={<Navigate to="/404" replace />}
        />

        {/* Default */}
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
