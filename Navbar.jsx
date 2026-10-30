import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("authUser");
    navigate("/login");
  }

  return (
    <nav className="dash-navbar">
      <div className="brand">
        <div className="brand-mark">G</div>
        <span className="brand-name">Google Docs Lite</span>
      </div>
      <div className="navbar-right">
        <span className="user-name">Bhumi</span>
        <div className="avatar" aria-label="Bhumi's profile">B</div>
        <button className="btn-ghost" onClick={handleLogout} aria-label="Log out">
          Logout
        </button>
      </div>
    </nav>
  );
}