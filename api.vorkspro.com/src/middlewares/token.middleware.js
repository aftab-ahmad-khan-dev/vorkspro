import crypto from "crypto";
import jwt from "jsonwebtoken";
import { User } from "../startup/models.js";
import { getTenantConnection } from "../database/tenant.js";
import { client as redis } from "../database/redis.js";
import logger from "../services/logger.js";

const tokenSecret = process.env.TOKEN_SECRET_KEY;
const AUTH_CACHE_TTL = parseInt(process.env.AUTH_CACHE_TTL_SECONDS || "90", 10); // 90s default
const AUTH_CACHE_ENABLED = process.env.AUTH_CACHE_ENABLED !== "0";

function authCacheKey(token) {
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  return `auth:${hash}`;
}

/*
 * Public routes (no token required)
 */
const publicUrls = [
  "/",
  "/file",
  "/file/upload-single",
  "/file/upload-multiple",
  "/health",

  "/api/user/login",
  "/api/user/register",
  "/api/user/registration-draft",
  "/api/user/forgot-password",
  "/api/user/refresh-token",
  "/api/user/verify-reset-code",

  "/uploads/:id",
];

/*
 * Routes that require optional token (authenticated or guest)
 */
const optionalAuthUrls = ["/"];

/*
 * Parameterized route matchers
 */
const publicUrlWithParams = ["/file/remove-single/"];

/*
 * Normalize path for platform-prefixed routes: /api/web/..., /api/mobile/..., /api/desktop/... -> /api/...
 */
const normalizedPath = (url) => {
  if (url.startsWith("/api/web")) return "/api" + url.slice("/api/web".length) || "/api";
  if (url.startsWith("/api/mobile")) return "/api" + url.slice("/api/mobile".length) || "/api";
  if (url.startsWith("/api/desktop")) return "/api" + url.slice("/api/desktop".length) || "/api";
  return url;
};

/*
 * Check if request URL matches public routes
 */
const isPublicUrl = (req) => {
  const path = normalizedPath(req.url);
  return (
    publicUrls.includes(path) ||
    publicUrlWithParams.some((url) => path.startsWith(url)) ||
    path.startsWith("/file/")
  );
};

/*
 * Helper — check if request URL matches optional-auth routes
 */
const isOptionalAuthUrl = (req) => {
  return optionalAuthUrls.some((url) => req.url.startsWith(url));
};

/*
 * ✅ Strict Token Middleware — Requires valid JWT. Uses Redis auth cache to skip DB on repeat requests.
 */
export const tokenCheckerMiddleware = async (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Invalid token format." });
  }

  try {
    if (AUTH_CACHE_ENABLED) {
      const key = authCacheKey(token);
      const cached = await redis.get(key).catch(() => null);
      if (cached) {
        const user = JSON.parse(cached);
        req.user = user;
        if (user.tenantDbName) {
          const tenantConn = getTenantConnection(user.tenantDbName);
          if (tenantConn) {
            req.tenantConn = tenantConn;
            req.tenantDbName = user.tenantDbName;
            req.orgSlug = user.orgSlug || null;
          }
        }
        return next();
      }
    }

    const decoded = jwt.verify(token, tokenSecret);
    let user;
    if (decoded.dbName) {
      const tenantConn = getTenantConnection(decoded.dbName);
      if (!tenantConn) return res.status(401).json({ message: "Invalid token." });
      const UserTenant = tenantConn.model("User");
      user = await UserTenant.findById(decoded._id).select("_id isActive role isSuperAdmin").lean();
      if (user) {
        req.tenantConn = tenantConn;
        req.tenantDbName = decoded.dbName;
        req.orgSlug = decoded.orgSlug || null;
      }
    } else {
      user = await User.findById(decoded._id).select("_id isActive role isSuperAdmin").lean();
    }

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Your account has been deactivated." });
    }

    if (AUTH_CACHE_ENABLED) {
      const key = authCacheKey(token);
      await redis.set(key, JSON.stringify({ ...user, tenantDbName: req.tenantDbName, orgSlug: req.orgSlug }), { EX: AUTH_CACHE_TTL }).catch(() => {});
    }

    req.user = user;
    next();
  } catch (err) {
    logger.error("Token verification failed", "Auth", err.message);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

/*
 * ✅ Optional Token Middleware — Token may exist but is not mandatory
 */
export const optionalTokenMiddleware = async (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) return next();

  const token = authHeader.split(" ")[1];
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, tokenSecret);
    let user;
    if (decoded.dbName) {
      const tenantConn = getTenantConnection(decoded.dbName);
      if (tenantConn) user = await tenantConn.model("User").findById(decoded._id).populate("role");
    } else {
      user = await User.findById(decoded._id).populate("role");
    }
    if (user && user.isActive) {
      req.user = user.toObject ? user.toObject() : user;
      if (decoded.dbName) {
        req.tenantConn = getTenantConnection(decoded.dbName);
        req.tenantDbName = decoded.dbName;
        req.orgSlug = decoded.orgSlug || null;
      }
    }
  } catch (err) {
    logger.debug("Optional token invalid", "Auth", err.message);
  }

  next();
};

/*
 * ✅ Master Token Checker — decides which middleware to run
 */
export const tokenChecker = async (req, res, next) => {
  if (isPublicUrl(req)) {
    return next(); // ✅ public route — skip auth
  }

  // if (isOptionalAuthUrl(req)) {
  //   return optionalTokenMiddleware(req, res, next);
  // }

  /*
   * All other routes require valid JWT
   */
  return tokenCheckerMiddleware(req, res, next);
};

/**
 * Invalidate auth cache for a token (call on logout / password change so cached user is cleared).
 */
export async function invalidateAuthCache(token) {
  if (!token || !AUTH_CACHE_ENABLED) return;
  const key = authCacheKey(token);
  await redis.del(key).catch(() => {});
}
