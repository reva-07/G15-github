// Small wrapper around localStorage so we always handle JSON parsing safely.

export function getItem(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error(`Error reading "${key}" from localStorage:`, error);
    return fallback;
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving "${key}" to localStorage:`, error);
  }
}

export function removeItem(key) {
  localStorage.removeItem(key);
}