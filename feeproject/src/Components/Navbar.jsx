import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const userEmail =
    localStorage.getItem("userEmail") || "User";

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");

    navigate("/login");
  };

  return (
    <nav className="navbar">

      <div className="navbar-left">
        <h2>Google Docs Lite</h2>
      </div>

      <div className="navbar-right">

        <span>
          {userEmail}
        </span>

        <button
          className="logout-btn"
          onClick={handleLogout}
          aria-label="Logout"
        >
          Logout
        </button>

      </div>

    </nav>
  );
}

export default Navbar;