import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CreateDocModal from "../components/CreateDocModal";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { useToast } from "../hooks/useToast";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const modeInfo = api.getMode();

  const [activeTab, setActiveTab] = useState("appearance"); // 'appearance' | 'profile'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenCreateModal={() => setIsCreateOpen(true)}
      />

      <div className="app-main">
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          title="Settings"
        />

        <main className="dash-body">
          <div className="dash-toolbar">
            <div>
              <h1 className="dash-page-heading">Settings</h1>
              <p className="dash-page-sub">
                Manage your preferences and account details.
              </p>
            </div>
          </div>

          {/* Settings Tabs */}
          <div className="settings-tabs" role="tablist">
            <button
              className={`settings-tab-btn ${activeTab === "appearance" ? "active" : ""}`}
              onClick={() => setActiveTab("appearance")}
              role="tab"
              aria-selected={activeTab === "appearance"}
            >
              🎨 Appearance & Theme
            </button>
            <button
              className={`settings-tab-btn ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
              role="tab"
              aria-selected={activeTab === "profile"}
            >
              👤 Account Profile
            </button>
          </div>

          {/* Tab Content */}
          <div className="settings-card">
            {activeTab === "appearance" && (
              <div>
                <h3 className="settings-card-title">Color Theme</h3>
                <p className="settings-card-desc">
                  Choose your preferred workspace aesthetic. High-contrast typography and paper styles are maintained across both light and dark themes.
                </p>

                <div className="theme-options-grid">
                  <div
                    className={`theme-card ${theme === "light" ? "active" : ""}`}
                    onClick={() => {
                      setTheme("light");
                      addToast("Light theme applied", "info");
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="theme-preview-box light-preview">
                      <div className="preview-mini-header"></div>
                      <div className="preview-mini-line"></div>
                      <div className="preview-mini-line short"></div>
                    </div>
                    <div className="theme-title">Light Mode</div>
                    <div className="theme-subtitle">Clean emerald & warm paper</div>
                  </div>

                  <div
                    className={`theme-card ${theme === "dark" ? "active" : ""}`}
                    onClick={() => {
                      setTheme("dark");
                      addToast("Dark theme applied", "info");
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="theme-preview-box dark-preview">
                      <div className="preview-mini-header"></div>
                      <div className="preview-mini-line"></div>
                      <div className="preview-mini-line short"></div>
                    </div>
                    <div className="theme-title">Dark Mode</div>
                    <div className="theme-subtitle">Deep charcoal & slate teal</div>
                  </div>

                  <div
                    className={`theme-card ${theme === "system" ? "active" : ""}`}
                    onClick={() => {
                      setTheme("system");
                      addToast("System theme applied", "info");
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="theme-preview-box system-preview">
                      <div className="preview-mini-split">
                        <div className="split-left"></div>
                        <div className="split-right"></div>
                      </div>
                    </div>
                    <div className="theme-title">System Default</div>
                    <div className="theme-subtitle">
                      Matches OS ({resolvedTheme} active)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div>
                <h3 className="settings-card-title">Account Details</h3>
                <p className="settings-card-desc">
                  Information associated with your current session.
                </p>

                <div className="profile-details-grid">
                  <div className="profile-field">
                    <span className="profile-field-label">Display Name</span>
                    <span className="profile-field-value">{user?.name || "Anonymous User"}</span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-field-label">Email Address</span>
                    <span className="profile-field-value">{user?.email || "No email"}</span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-field-label">User Identifier (UID)</span>
                    <code className="profile-field-code">{user?.id || "N/A"}</code>
                  </div>
                  <div className="profile-field">
                    <span className="profile-field-label">Session Storage</span>
                    <span className="profile-field-value">
                      {modeInfo.isCloud ? "Supabase Auth JWT Token" : "Encrypted Local Session"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <CreateDocModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={async (tpl) => {
          const doc = await api.documents.create({
            currentUser: user,
            title: tpl.title,
            content: tpl.content,
          });
          setIsCreateOpen(false);
          navigate(`/documents/${doc.id}`);
        }}
      />
    </div>
  );
}
