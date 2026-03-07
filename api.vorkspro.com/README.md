# VorksPro API

Node.js (Express) backend for VorksPro. Serves **web**, **mobile**, and **desktop** on `/api`, `/api/web`, `/api/mobile`, and `/api/desktop`. Uses MongoDB, Redis (cache + auth cache), and JWT.

## Run

```bash
cd api.vorkspro.com
npm install
# Configure .env (MONGODB_URI, TOKEN_SECRET_KEY, MODE, etc.)
npm run start
```

Default port is from `PORT` (e.g. 4000). For multiple workers on one machine:

```bash
ENABLE_CLUSTER=1 npm run start:cluster
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run start` | Dev server (nodemon) |
| `npm run start:cluster` | Multi-worker mode (set `ENABLE_CLUSTER=1`) |
| `npm run seed` | Seed roles and admin user |
| `npm run seed:profiles` | Ensure role profiles |

## Env (main)

| Variable | Description |
|----------|-------------|
| `MODE` | `development` \| `test` \| `production` |
| `PORT` | Server port (e.g. 4000) |
| `MONGODB_URI` | MongoDB connection string |
| `TOKEN_SECRET_KEY` | JWT secret |
| `REDIS_URL` | Redis URL (optional; auth + response cache use it) |
| `CORS_ORIGIN` | Allowed origin for CORS |
| `AUTH_CACHE_ENABLED` | `1` (default) or `0` — Redis cache for JWT user lookup |
| `AUTH_CACHE_TTL_SECONDS` | Auth cache TTL (default 90) |
| `API_KEY` | **Production:** if set, all `/api` requests must send `X-API-Key` (or `Authorization: ApiKey <key>`). Set the same value as `VITE_APP_API_KEY` in the web app. Omit in dev to skip the check. |

## Structure

- **`src/`** — App code: `app.js`, `index.js`, `startup/routes.js`, `platforms/`, `routes/`, `controllers/`, `models/`, `services/`, `middlewares/`, `database/`.
- **`STRUCTURE.md`** — Folder layout and URL/platform routing.
- **`load-balancer/`** — Round-robin proxy; see `load-balancer/README.md`.
- **`nginx/`** — Nginx example; see `nginx/README.md`.
- **`PERFORMANCE.md`** — Auth cache, response cache, cluster, Cache-Control, DB tips.

## Load balancing

- **Node proxy:** `load-balancer/server.js` — run from `load-balancer/` with `BACKEND_*_PORTS` or `BACKEND_PORTS`.
- **Nginx:** Use `nginx/loadbalancer.conf.example` for production with separate upstreams per platform.

See repo root **README.md** for full quick start and LB examples.
