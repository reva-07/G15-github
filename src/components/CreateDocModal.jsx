import { useState } from "react";
import Modal from "./Modal";
import InputField from "./InputField";
import { TEMPLATES } from "../utils/templates";

export default function CreateDocModal({
  isOpen,
  onClose,
  onCreate,
  isCreating = false,
}) {
  const [selectedTemplate, setSelectedTemplate] = useState("blank");
  const [title, setTitle] = useState("");

  function handleSelectTemplate(tpl) {
    setSelectedTemplate(tpl.id);
    if (!title || TEMPLATES.some((t) => t.defaultTitle === title)) {
      setTitle(tpl.defaultTitle);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const tpl = TEMPLATES.find((t) => t.id === selectedTemplate) || TEMPLATES[0];
    const finalTitle = title.trim() || tpl.defaultTitle;
    onCreate({
      title: finalTitle,
      content: tpl.content,
      templateId: tpl.id,
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Document"
      maxWidth="560px"
      footer={
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button className="btn-ghost" type="button" onClick={onClose} disabled={isCreating}>
            Cancel
          </button>
          <button
            className="btn-clay"
            type="button"
            onClick={handleSubmit}
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Create & Open Editor"}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <InputField
          id="doc-title"
          label="Document Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. My Next Article"
          autoFocus
        />

        <div style={{ marginTop: "16px" }}>
          <label style={{ fontSize: "13px", fontWeight: "650", display: "block", marginBottom: "8px" }}>
            Choose a Starter Template
          </label>
          <div className="template-picker-grid">
            {TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                className={`template-picker-card ${
                  selectedTemplate === tpl.id ? "active" : ""
                }`}
                onClick={() => handleSelectTemplate(tpl)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleSelectTemplate(tpl)}
              >
                <div className="template-picker-icon">{tpl.icon}</div>
                <div className="template-picker-name">{tpl.name}</div>
                <div className="template-picker-desc">{tpl.description}</div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
