import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const authUser = localStorage.getItem("authUser");
  if (!authUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
}