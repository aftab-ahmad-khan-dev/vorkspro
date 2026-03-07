/**
 * API Key middleware for production. When API_KEY env is set, all /api requests must send a valid key.
 * Accepts: X-API-Key header or Authorization: ApiKey <key>
 * When API_KEY is not set (e.g. development), the check is skipped.
 */
const API_KEY = process.env.API_KEY?.trim();

function getApiKeyFromRequest(req) {
  const fromHeader = req.get("X-API-Key");
  if (fromHeader) return fromHeader.trim();
  const auth = req.get("Authorization");
  if (auth?.startsWith("ApiKey ")) return auth.slice(7).trim();
  return null;
}

export function apiKeyMiddleware(req, res, next) {
  if (!API_KEY) {
    return next();
  }

  const path = req.originalUrl?.split("?")[0] || req.url?.split("?")[0] || "";
  if (!path.startsWith("/api")) {
    return next();
  }

  const key = getApiKeyFromRequest(req);
  if (!key) {
    return res.status(401).json({
      isSuccess: false,
      message: "API key required. Send X-API-Key header or Authorization: ApiKey <key>.",
    });
  }

  if (key !== API_KEY) {
    return res.status(403).json({
      isSuccess: false,
      message: "Invalid API key.",
    });
  }

  next();
}
