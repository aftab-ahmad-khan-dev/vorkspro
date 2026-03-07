/**
 * Response cache helper — use for read-heavy GET/list endpoints to reduce DB load.
 * Project-wide rule: on any mutation (create/update/delete/toggle), call invalidateCache(CACHE_KEYS.*)
 * so Redis is updated immediately and TTL is ignored for correctness.
 */
import { client } from "../database/redis.js";

const DEFAULT_TTL = 60; // 1 minute

/** Central cache keys — invalidate on any mutation so next read is from DB. */
export const CACHE_KEYS = {
  ROLES_ACTIVE: "roles:active",
  DEPARTMENTS_ACTIVE: "departments:active",
  DOCUMENT_TYPES_ACTIVE: "documentTypes:active",
  INDUSTRY_TYPES_ACTIVE: "industryTypes:active",
  LEAVE_TYPES_ACTIVE: "leaveTypes:active",
};

/**
 * Return cached JSON if present, otherwise run fn(), cache result, and return.
 * @param {string} key - Redis key (e.g. "projects:list:user123:page1" or "lookup:departments")
 * @param {number} ttlSeconds - TTL in seconds (default 60)
 * @param {() => Promise<any>} fn - Async function that returns the value to cache (and return)
 * @returns {Promise<any>} - Cached or freshly computed value
 */
export async function getCachedOrRun(key, ttlSeconds = DEFAULT_TTL, fn) {
  const cached = await client.get(key).catch(() => null);
  if (cached != null) {
    try {
      return JSON.parse(cached);
    } catch {
      // invalid JSON, fall through to fn
    }
  }
  const value = await fn();
  await client.set(key, JSON.stringify(value), { EX: ttlSeconds }).catch(() => {});
  return value;
}

/**
 * Build a cache key from path and query (and optional userId for per-user lists).
 */
export function cacheKey(prefix, req, options = {}) {
  const path = (req.url || "").split("?")[0];
  const query = (req.url || "").split("?")[1] || "";
  const userId = options.userId ?? req.user?._id?.toString();
  const parts = [prefix, path];
  if (userId) parts.push(userId);
  if (query) parts.push(query);
  return parts.join(":");
}

/**
 * Invalidate cache by key. Call on every mutation (create/update/delete/toggle) so next read is from DB.
 * TTL is then irrelevant until the key is repopulated.
 */
export async function invalidateCache(key) {
  await client.del(key).catch(() => {});
}
