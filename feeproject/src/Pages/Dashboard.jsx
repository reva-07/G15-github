import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const userEmail =
    localStorage.getItem("userEmail") || "User";

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");

    navigate("/login");
  };

  const handleNewDocument = () => {
    navigate("/document/1");
  };

  return (
    <div className="dashboard-page">
      <nav className="dashboard-navbar">
        <h2>Google Docs Lite</h2>

        <div className="dashboard-user">
          <span>{userEmail}</span>

          <button onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>My Documents</h1>
            <p>Manage your documents easily.</p>
          </div>

          <button
            className="new-document-btn"
            onClick={handleNewDocument}
          >
            + New Document
          </button>
        </div>

        <div className="document-card">
          <h3>My First Document</h3>

          <p>
            Start writing your document here.
          </p>

          <small>
            Last edited: Today
          </small>

          <button
            onClick={() => navigate("/document/1")}
          >
            Open
          </button>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;