/**
 * Platform detection for SaaS/PaaS: one API serves web, mobile, and desktop.
 * Sets req.platform to "web" | "mobile" | "desktop" for logging, rate limits, or platform-specific logic.
 *
 * Clients should send header: X-Client-Platform: web | mobile | desktop
 * Or: X-App-Source: web | mobile | desktop
 */

const VALID_PLATFORMS = ["web", "mobile", "desktop"];

function normalizePlatform(value) {
  if (!value || typeof value !== "string") return "web";
  const v = value.toLowerCase().trim();
  return VALID_PLATFORMS.includes(v) ? v : "web";
}

export function platformMiddleware(req, res, next) {
  const fromHeader =
    req.headers["x-client-platform"] || req.headers["x-app-source"] || "";
  req.platform = normalizePlatform(fromHeader);
  next();
}
