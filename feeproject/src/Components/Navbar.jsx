import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  // 🔽 CHANGE 1: Get user info from localStorage
  const authUser = JSON.parse(localStorage.getItem("authUser"));
  const userName = authUser?.name || "Guest"; // fallback agar name na mile

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
        {/* 🔽 CHANGE 2: Hard-coded "Bhumi" replaced with dynamic name */}
        <span className="user-name">{userName}</span>

        {/* 🔽 CHANGE 3: Avatar letter also dynamic */}
        <div className="avatar" aria-label={`${userName}'s profile`}>
          {userName.charAt(0).toUpperCase()}
        </div>

        <button className="btn-ghost" onClick={handleLogout} aria-label="Log out">
          Logout
        </button>
      </div>
    </nav>
  );
}
