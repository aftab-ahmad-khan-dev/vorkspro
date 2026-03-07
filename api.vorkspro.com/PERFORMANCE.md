# API performance

Tips to keep web API response time low.

## 1. Auth cache (Redis)

Protected requests no longer hit the DB on every call. JWT is verified and the user is cached in Redis for a short TTL so repeat requests with the same token skip `User.findById`.

- **Env:** `AUTH_CACHE_ENABLED=1` (default). Set to `0` to disable.
- **Env:** `AUTH_CACHE_TTL_SECONDS=90` (default 90s).
- On logout or password change, call `invalidateAuthCache(token)` from `middlewares/token.middleware.js` so the cached user is cleared.

## 2. Response cache for list/lookup endpoints

Use the cache service for read-heavy GET endpoints (lists, lookups):

```js
import { getCachedOrRun, cacheKey } from "../services/cache.service.js";

// In controller:
const key = cacheKey("projects:list", req, { userId: req.user._id.toString() });
const data = await getCachedOrRun(key, 60, async () => {
  // ... fetch from DB, return payload to cache
  return await Project.find(...).lean();
});
return generateApiResponse(res, StatusCodes.OK, true, "OK", { projects: data });
```

- **`getCachedOrRun(key, ttlSeconds, fn)`** — returns cached value or runs `fn()`, caches and returns.
- **`cacheKey(prefix, req, { userId })`** — builds a key from path, query, and optional user id.
- Invalidate when data changes: `invalidateCache(key)` from `services/cache.service.js`.

## 3. HTTP cache headers

For stable list/lookup responses you can set `Cache-Control` so clients/CDNs can cache:

```js
return generateApiResponse(res, StatusCodes.OK, true, "OK", data, { cacheMaxAge: 60 });
```

Use only for data that is safe to cache for that many seconds (e.g. reference data).

## 4. Database

- Connection pool is already set (`maxPoolSize: 10`, `minPoolSize: 2` in `database/database.js`).
- Prefer `.lean()` on read-only Mongoose queries to avoid document overhead.
- Ensure indexes on frequently filtered/sorted fields (e.g. `isDeleted`, `createdAt`, `user`).

## 5. Cluster mode (production)

Run multiple workers on the same machine so you use more than one CPU:

```bash
# From api.vorkspro.com root
ENABLE_CLUSTER=1 npm run start:cluster
# or: node -r dotenv/config src/cluster.js
```

Combine with the load balancer and multiple API instances for best throughput.

## 6. Compression

`compression()` is already enabled in `app.js` for JSON and other response bodies.

## 7. Existing Redis usage

Several controllers already cache reference data (departments, document types, industry types, leave types, roles, user roles) with 10-minute TTL. New list endpoints can follow the same pattern or use `cache.service.js`.
