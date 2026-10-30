import { useState, useEffect } from "react";
import Modal from "./Modal";
import InputField from "./InputField";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

export default function ShareDocModal({ isOpen, onClose, document: doc }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !doc?.id) return;
    let mounted = true;

    async function loadShares() {
      setLoading(true);
      try {
        const list = await api.shares.list(doc.id, user);
        if (mounted) setShares(list);
      } catch (err) {
        console.error("Failed to load shares:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadShares();
    return () => {
      mounted = false;
    };
  }, [isOpen, doc?.id, user]);

  async function handleAddShare(e) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid collaborator email.");
      return;
    }

    if (email.trim().toLowerCase() === user?.email?.toLowerCase()) {
      setError("You are already the owner of this document.");
      return;
    }

    setAdding(true);
    try {
      await api.shares.add(doc.id, email.trim(), role, user);
      addToast(`Shared "${doc.title}" with ${email.trim()} as ${role}`, "success");
      setEmail("");
      // Reload shares
      const list = await api.shares.list(doc.id, user);
      setShares(list);
    } catch (err) {
      setError(err?.message || "Failed to share document.");
      addToast("Failed to share document", "error");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemoveShare(shareEmail) {
    try {
      await api.shares.remove(doc.id, shareEmail);
      setShares((prev) => prev.filter((s) => s.shared_with_email !== shareEmail));
      addToast(`Removed access for ${shareEmail}`, "info");
    } catch (err) {
      console.error(err);
      addToast("Could not remove collaborator", "error");
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Share "${doc?.title || "Document"}"`}
      maxWidth="520px"
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="btn-clay" onClick={onClose}>
            Done
          </button>
        </div>
      }
    >
      <form onSubmit={handleAddShare} style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <InputField
              id="share-email"
              label="Add collaborator by email"
              type="email"
              placeholder="teammate@college.edu"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              error={error}
            />
          </div>

          <div className="field" style={{ width: "110px", marginBottom: error ? "25px" : "19px" }}>
            <label htmlFor="share-role">Permission</label>
            <select
              id="share-role"
              className="tb-select"
              style={{ width: "100%", height: "42px", padding: "0 8px" }}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "auto", height: "42px", padding: "0 16px", marginBottom: error ? "25px" : "19px" }}
            disabled={adding}
          >
            {adding ? "Adding..." : "Invite"}
          </button>
        </div>
      </form>

      <div>
        <h4 style={{ fontSize: "13px", color: "var(--ink-soft)", marginBottom: "8px" }}>
          Who has access:
        </h4>
        <div className="share-list">
          {/* Owner item */}
          <div className="share-list-item">
            <div className="share-user-meta">
              <span className="share-avatar">{user?.name ? user.name[0].toUpperCase() : "U"}</span>
              <div>
                <div className="share-user-name">{user?.name || "You"} (You)</div>
                <div className="share-user-email">{user?.email}</div>
              </div>
            </div>
            <span className="share-role-badge">Owner</span>
          </div>

          {/* Invited collaborators */}
          {loading ? (
            <p style={{ fontSize: "13px", color: "var(--ink-soft)", padding: "10px" }}>
              Loading collaborators...
            </p>
          ) : (
            shares.map((share) => (
              <div key={share.id || share.shared_with_email} className="share-list-item">
                <div className="share-user-meta">
                  <span className="share-avatar">
                    {share.shared_with_email[0].toUpperCase()}
                  </span>
                  <div>
                    <div className="share-user-email">{share.shared_with_email}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="share-role-badge">{share.role}</span>
                  <button
                    className="share-remove-btn"
                    onClick={() => handleRemoveShare(share.shared_with_email)}
                    title="Remove access"
                    aria-label={`Remove access for ${share.shared_with_email}`}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
