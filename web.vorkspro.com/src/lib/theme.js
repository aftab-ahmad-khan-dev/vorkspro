import { THEME_KEYS, THEMES_LIGHT, THEMES_DARK } from "@/constants/themes";

/** Parse hex to r,g,b (0-255). */
function hexToRgb(hex) {
  const n = hex.replace(/^#/, "");
  if (n.length === 6) {
    return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
  }
  return [37, 26, 60]; // fallback vorkspro
}

/** Dark mode: use solid dark base for readability; accent only for primary/button. */
const DARK_BACKGROUND = "oklch(18.7% 0.039 264.7)";
const DARK_CARD = "oklch(22.583% 0.02357 277)";
const DARK_BORDER = "oklch(1 0 0 / 10%)";

/** Light mode: very light tint for bg/card. */
function lightBgFromAccent(hex) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, 0.04)`;
}

function lightCardFromAccent(hex) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, 0.06)`;
}

function lightBorderFromAccent(hex) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, 0.2)`;
}

function applyAccentPalette(root, hex, isDark) {
  root.style.setProperty("--primary", hex);
  root.style.setProperty("--button", hex);
  root.style.setProperty("--background", isDark ? DARK_BACKGROUND : lightBgFromAccent(hex));
  root.style.setProperty("--card", isDark ? DARK_CARD : lightCardFromAccent(hex));
  root.style.setProperty("--border", isDark ? DARK_BORDER : lightBorderFromAccent(hex));
}

/**
 * Apply theme preference across the app (sidebar, topbar, content).
 * Updates dashboard bg, card, border and highlight (primary/button).
 * value can be: "light" | "dark" (mode) or one of THEME_KEYS (accent for current mode).
 */
export function applyThemePreference(themePreference) {
  const root = document.documentElement;
  const value = themePreference || "neonPurple";

  root.classList.remove("theme-neon-purple", "dark");

  if (value === "light") {
    root.classList.remove("dark");
    try {
      localStorage.setItem("themePreference", "light");
      localStorage.setItem("themeMode", "light");
      const lightColor = localStorage.getItem("lightColor") || "vorkspro";
      const hex = THEMES_LIGHT[lightColor] || THEMES_LIGHT.vorkspro;
      applyAccentPalette(root, hex, false);
    } catch (_) {}
    return;
  }

  if (value === "dark") {
    root.classList.add("dark");
    try {
      localStorage.setItem("themePreference", "dark");
      localStorage.setItem("themeMode", "dark");
      const darkColor = localStorage.getItem("darkColor") || "neonPurple";
      const hex = THEMES_DARK[darkColor] || THEMES_DARK.neonPurple;
      applyAccentPalette(root, hex, true);
    } catch (_) {}
    return;
  }

  // Accent key (one of THEME_KEYS): apply bg + highlight for current mode
  if (THEME_KEYS.includes(value)) {
    const mode = (typeof localStorage !== "undefined" && localStorage.getItem("themeMode")) || "light";
    const isDark = mode === "dark";
    if (isDark) root.classList.add("dark");
    else root.classList.remove("dark");
    const hex = isDark ? (THEMES_DARK[value] ?? THEMES_DARK.neonPurple) : (THEMES_LIGHT[value] ?? THEMES_LIGHT.vorkspro);
    applyAccentPalette(root, hex, isDark);
    try {
      localStorage.setItem("themePreference", value);
      localStorage.setItem(isDark ? "darkColor" : "lightColor", value);
    } catch (_) {}
    return;
  }

  // Legacy: neon-purple → dark + neonPurple accent + full palette
  if (value === "neon-purple") {
    root.classList.add("dark", "theme-neon-purple");
    const hex = "#a855f7";
    applyAccentPalette(root, hex, true);
    try {
      localStorage.setItem("themePreference", "neonPurple");
      localStorage.setItem("themeMode", "dark");
      localStorage.setItem("darkColor", "neonPurple");
    } catch (_) {}
  }
}

export function getThemePreference() {
  try {
    return localStorage.getItem("themePreference") || "neonPurple";
  } catch (_) {
    return "neonPurple";
  }
}
