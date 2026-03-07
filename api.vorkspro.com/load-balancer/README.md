# VorksPro Load Balancer

Round-robin reverse proxy, **platform-aware** (no paid packages). Routes `/api/web`, `/api/mobile`, `/api/desktop` to separate backend pools so each platform can be scaled independently.

## Usage

1. Start API instances (one pool or separate ports per platform) from **`api.vorkspro.com`** root, e.g. `PORT=4000 node -r dotenv/config src/index.js` or `npm run start`.
2. Start the load balancer from this folder:

```bash
# From api.vorkspro.com/load-balancer

# Single pool (all platforms → same backends)
node server.js
# or: BACKEND_PORTS=4000,4001 node server.js

# Per-platform backends (better load distribution)
BACKEND_WEB_PORTS=4000,4001 BACKEND_MOBILE_PORTS=4002 BACKEND_DESKTOP_PORTS=4003 node server.js
```

3. Point **web** app to `http://localhost:3000` (or LB_PORT). Mobile/desktop use `/api/mobile`, `/api/desktop` and are routed to their pools.

## Env

| Variable                  | Description |
|---------------------------|-------------|
| `LB_PORT`                 | Port the load balancer listens on (default 3000) |
| `BACKEND_PORTS`           | Single pool: comma-separated ports (same host) |
| `BACKEND_HOSTS`           | Single pool: comma-separated full URLs |
| `BACKEND_WEB_PORTS`       | Ports for /api and /api/web (e.g. 4000,4001) |
| `BACKEND_MOBILE_PORTS`    | Ports for /api/mobile |
| `BACKEND_DESKTOP_PORTS`   | Ports for /api/desktop |
| `BACKEND_HOST`            | Host when using BACKEND_*_PORTS (default localhost) |

If per-platform vars are not set, all traffic uses `BACKEND_PORTS` / `BACKEND_HOSTS` or `http://localhost:4000`.

## Production (nginx)

Use **nginx** with separate upstreams per platform: **`../nginx/loadbalancer.conf.example`**.
