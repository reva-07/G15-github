export default function EmptyState({ title, message, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{message}</p>
      {actionLabel && (
        <button className="btn-clay" onClick={onAction}>{actionLabel}</button>
      )}
    </div>
  );
}