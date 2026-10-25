import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import Editor from "./Pages/Editor";
import NotFound from "./Pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { useDocuments } from "./hooks/useDocuments";

function App() {
  // Called ONCE here — this is "lifting state up". Dashboard and Editor
  // both receive the same state + functions as props ("prop drilling")
  // instead of each independently reading localStorage.
  const documentsState = useDocuments();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard {...documentsState} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/document/:id"
          element={
            <ProtectedRoute>
              <Editor {...documentsState} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
