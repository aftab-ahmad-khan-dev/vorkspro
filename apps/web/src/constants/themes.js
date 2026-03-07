/**
 * App-wide theme options (Slack/ClickUp style). Used by Layout and Settings.
 * Each theme has light/dark accent and optional neon glow for swatches.
 */
export const THEME_KEYS = [
  "vorkspro",
  "neonCyan",
  "neonGreen",
  "neonPink",
  "neonPurple",
  "electricBlue",
  "amber",
  "coral",
  "teal",
  "violet",
];

export const THEME_LABELS = {
  vorkspro: "Vorks Pro",
  neonCyan: "Neon Cyan",
  neonGreen: "Neon Green",
  neonPink: "Neon Pink",
  neonPurple: "Neon Purple",
  electricBlue: "Electric Blue",
  amber: "Amber",
  coral: "Coral",
  teal: "Teal",
  violet: "Violet",
};

/** Light mode accent (hex). */
export const THEMES_LIGHT = {
  vorkspro: "#251A3C",
  neonCyan: "#06B6D4",
  neonGreen: "#10B981",
  neonPink: "#EC4899",
  neonPurple: "#8B5CF6",
  electricBlue: "#3B82F6",
  amber: "#F59E0B",
  coral: "#F43F5E",
  teal: "#14B8A6",
  violet: "#7C3AED",
};

/** Dark mode accent (hex) – slightly brighter for contrast. */
export const THEMES_DARK = {
  vorkspro: "#251A3C",
  neonCyan: "#22D3EE",
  neonGreen: "#34D399",
  neonPink: "#F472B6",
  neonPurple: "#A78BFA",
  electricBlue: "#60A5FA",
  amber: "#FBBF24",
  coral: "#FB7185",
  teal: "#2DD4BF",
  violet: "#8B5CF6",
};

/** For Settings swatch glow (optional). */
export const THEME_GLOW = {
  vorkspro: "#251A3C",
  neonCyan: "#06B6D4",
  neonGreen: "#10B981",
  neonPink: "#EC4899",
  neonPurple: "#8B5CF6",
  electricBlue: "#3B82F6",
  amber: "#F59E0B",
  coral: "#F43F5E",
  teal: "#14B8A6",
  violet: "#7C3AED",
};

export function getThemeColor(themeKey, isDark) {
  const map = isDark ? THEMES_DARK : THEMES_LIGHT;
  return map[themeKey] ?? map.vorkspro;
}
