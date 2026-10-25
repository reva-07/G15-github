import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="empty-state" style={{ margin: "80px auto", maxWidth: "420px" }}>
      <h3>Page not found</h3>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/dashboard" className="btn-clay">Back to dashboard</Link>
    </div>
  );
}