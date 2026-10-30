import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="not-found-wrap">
      <div className="brand" style={{ justifyContent: "center", marginBottom: "24px" }}>
        <div className="brand-mark">G</div>
        <span className="brand-name">Google Docs Lite</span>
      </div>

      <div className="not-found-card">
        <h1 className="not-found-code">404</h1>
        <h2>Page not found</h2>
        <p className="not-found-text">
          The document, page, or resource you were looking for doesn't exist or may have been moved.
        </p>
        <Link to="/dashboard" className="btn-clay not-found-btn">
          ← Back to All Documents
        </Link>
      </div>
    </div>
  );
}
