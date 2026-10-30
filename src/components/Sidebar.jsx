import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ isOpen, onClose, onOpenCreateModal }) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const filterParam = searchParams.get("filter");

  const navItems = [
    {
      to: "/dashboard",
      label: "All Documents",
      icon: "📑",
      exact: true,
      active: location.pathname === "/dashboard" && !filterParam,
    },
    {
      to: "/my-documents",
      label: "My Documents",
      icon: "👤",
      active: location.pathname === "/my-documents",
    },
    {
      to: "/shared",
      label: "Shared with Me",
      icon: "👥",
      active: location.pathname === "/shared",
    },
    {
      to: "/dashboard?filter=starred",
      label: "Starred",
      icon: "⭐",
      active: location.pathname === "/dashboard" && filterParam === "starred",
    },
    {
      to: "/trash",
      label: "Trash",
      icon: "🗑️",
      active: location.pathname === "/trash",
    },
    {
      to: "/settings",
      label: "Settings",
      icon: "⚙️",
      active: location.pathname === "/settings",
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`app-sidebar ${isOpen ? "open" : ""}`} aria-label="Main Navigation">
        <div className="sidebar-brand">
          <div className="brand-mark">G</div>
          <span className="brand-name">Google Docs Lite</span>
        </div>

        <div className="sidebar-action">
          <button
            className="btn-clay sidebar-create-btn"
            onClick={() => {
              if (onClose) onClose();
              onOpenCreateModal();
            }}
          >
            <span>+</span>
            <span>New Document</span>
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={onClose}
              className={`sidebar-nav-item ${item.active ? "active" : ""}`}
              aria-current={item.active ? "page" : undefined}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
