import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import DropdownMenu from "./DropdownMenu";
import { useNavigate } from "react-router-dom";

export default function Navbar({ onToggleSidebar, title }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, resolvedTheme } = useTheme();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const initial = user?.name ? user.name[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : "U";

  const userMenuItems = [
    {
      label: `${user?.name || "User"} (${user?.email || ""})`,
      disabled: true,
    },
    { divider: true },
    {
      label: "Account Settings",
      icon: "⚙️",
      onClick: () => navigate("/settings"),
    },
    {
      label: "Log out",
      icon: "🚪",
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <header className="dash-navbar">
      <div className="navbar-left">
        {onToggleSidebar && (
          <button
            className="sidebar-toggle-btn"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
          >
            ☰
          </button>
        )}
        <div className="brand brand-mobile-hide">
          <div className="brand-mark">G</div>
          <span className="brand-name">Google Docs Lite</span>
        </div>
        {title && <span className="navbar-page-title">{title}</span>}
      </div>

      <div className="navbar-right">
        {/* Theme Toggle Button */}
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={`Current theme: ${theme} (${resolvedTheme}). Click to toggle.`}
          aria-label={`Toggle theme, current is ${resolvedTheme}`}
        >
          {resolvedTheme === "dark" ? "☀️" : "🌙"}
        </button>

        {/* User Profile & Dropdown */}
        <DropdownMenu
          trigger={
            <div className="avatar-trigger-btn" aria-label="User account menu">
              <span className="user-name user-name-hide-mobile">{user?.name || "Account"}</span>
              <div className="avatar">{initial}</div>
            </div>
          }
          items={userMenuItems}
          align="right"
        />
      </div>
    </header>
  );
}
