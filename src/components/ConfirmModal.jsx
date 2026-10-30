import Modal from "./Modal";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmLabel = "Confirm",
  confirmVariant = "clay",
  isProcessing = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="420px"
      footer={
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button className="btn-ghost" onClick={onClose} disabled={isProcessing}>
            Cancel
          </button>
          <button
            className={confirmVariant === "danger" ? "btn-clay" : "btn-primary"}
            style={confirmVariant === "danger" ? { background: "#c9502f" } : {}}
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : confirmLabel}
          </button>
        </div>
      }
    >
      <p style={{ color: "var(--ink-soft)", lineHeight: "1.5" }}>{message}</p>
    </Modal>
  );
}
