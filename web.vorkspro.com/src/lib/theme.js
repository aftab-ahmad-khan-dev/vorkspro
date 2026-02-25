/**
 * Apply theme preference across the app (sidebar, topbar, content).
 * Persists to localStorage so it can be synced with server on next load.
 * @param {'light'|'dark'|'neon-purple'} themePreference
 */
export function applyThemePreference(themePreference) {
  const root = document.documentElement;
  const value = themePreference || "neon-purple";

  root.classList.remove("theme-neon-purple", "dark");
  if (value === "neon-purple") {
    root.classList.add("dark", "theme-neon-purple");
    root.style.setProperty("--primary", "#a855f7");
    root.style.setProperty("--button", "#a855f7");
  } else if (value === "dark") {
    root.classList.add("dark");
    root.style.removeProperty("--primary");
    root.style.removeProperty("--button");
  } else {
    root.style.removeProperty("--primary");
    root.style.removeProperty("--button");
  }

  try {
    localStorage.setItem("themePreference", value);
    localStorage.setItem("themeMode", value === "light" ? "light" : "dark");
  } catch (_) {}
}

export function getThemePreference() {
  try {
    return localStorage.getItem("themePreference") || "neon-purple";
  } catch (_) {
    return "neon-purple";
  }
}
