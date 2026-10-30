import { TEMPLATES } from "./templates.js";

/**
 * Small pure helper functions used across Dashboard, Editor, and Document Cards.
 */

export function createEmptyDocument(templateId = "blank") {
  const template = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];
  return {
    id: crypto.randomUUID(),
    title: template.defaultTitle,
    content: template.content,
    is_starred: false,
    is_trashed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function formatRelativeTime(isoString) {
  if (!isoString) return "recently";
  const now = new Date();
  const then = new Date(isoString);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return then.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function countWordsAndChars(htmlContent = "") {
  if (!htmlContent) return { words: 0, chars: 0 };
  const plainText = htmlContent.replace(/<[^>]*>/g, " ").trim();
  const words = plainText.length === 0 ? 0 : plainText.split(/\s+/).filter(Boolean).length;
  const chars = plainText.length;
  return { words, chars };
}

export function extractPlainText(html = "") {
  if (!html) return "Start writing your document...";
  try {
    const temp = window.document.createElement("div");
    temp.innerHTML = html;
    const text = temp.textContent || temp.innerText || "";
    return text.trim() || "Start writing your document...";
  } catch {
    return "Start writing your document...";
  }
}

/**
 * Safely validate and normalize URLs for Insert Link in Editor.
 * Rejects dangerous protocols (javascript:, data:, vbscript:, file:).
 * Supports http, https, mailto, tel, and normalizes plain domains (e.g. google.com -> https://google.com).
 */
export function normalizeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  // Strictly reject executable or dangerous protocols
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return null;
  }

  // Support mailto: links
  if (lower.startsWith("mailto:")) {
    const emailPart = trimmed.slice(7).trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailPart)) {
      return `mailto:${emailPart}`;
    }
    return null;
  }

  // Support tel: links
  if (lower.startsWith("tel:")) {
    return trimmed;
  }

  // Handle explicit http:// or https://
  if (lower.startsWith("http://") || lower.startsWith("https://")) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.href;
      }
      return null;
    } catch {
      return null;
    }
  }

  // Auto-normalize domain-like inputs without protocol (e.g. google.com -> https://google.com/)
  try {
    const parsed = new URL(`https://${trimmed}`);
    if (parsed.hostname && parsed.hostname.includes(".")) {
      return parsed.href;
    }
  } catch {
    return null;
  }

  return null;
}

