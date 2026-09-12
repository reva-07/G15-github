// Small pure helper functions used across Dashboard and Editor.

export function createEmptyDocument() {
  return {
    id: crypto.randomUUID(),
    title: "Untitled document",
    content: "<p>Start writing...</p>",
    updatedAt: new Date().toISOString(),
  };
}

export function formatRelativeTime(isoString) {
  const now = new Date();
  const then = new Date(isoString);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "yesterday";
  return `${diffDays} days ago`;
}

export function countWordsAndChars(htmlContent) {
  const plainText = htmlContent.replace(/<[^>]*>/g, " ").trim();
  const words = plainText.length === 0 ? 0 : plainText.split(/\s+/).length;
  const chars = plainText.length;
  return { words, chars };
}