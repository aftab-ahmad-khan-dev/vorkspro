import jwt from "jsonwebtoken";
import { User } from "../startup/models.js";
import logger from "../services/logger.js";

const tokenSecret = process.env.TOKEN_SECRET_KEY;

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
 * Check if request URL matches public routes
 */
const isPublicUrl = (req) => {
  return (
    publicUrls.includes(req.url) ||
    publicUrlWithParams.some((url) => req.url.startsWith(url)) ||
    req.url.startsWith("/file/")
  );
};

/*
 * Helper — check if request URL matches optional-auth routes
 */
const isOptionalAuthUrl = (req) => {
  return optionalAuthUrls.some((url) => req.url.startsWith(url));
};

/*
 * ✅ Strict Token Middleware — Requires valid JWT
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
    const decoded = jwt.verify(token, tokenSecret);
    const user = await User.findById(decoded._id).select('_id isActive role isSuperAdmin').lean();

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Your account has been deactivated." });
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
    const user = await User.findById(decoded._id).populate("role");

    if (user && user.isActive) {
      req.user = user.toObject();
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
