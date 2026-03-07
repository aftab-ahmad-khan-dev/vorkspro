# VorksPro Web App

React (Vite) web client for VorksPro — dashboard, projects, clients, HR, finance, follow-ups, to-dos, and more. Role-based access; talks to the API at `api.vorkspro.com`.

## Run

```bash
cd apps/web
npm install
cp .env.example .env   # configure VITE_APP_BASE_URL (see below)
npm run dev
```

## Env

| Variable | Description |
|----------|-------------|
| `VITE_APP_BASE_URL` | API base URL (e.g. `http://localhost:4000/api` for direct API, or `http://localhost:3000/api` when using the load balancer). |

## Build

```bash
npm run build
```

Output is in `dist/`. Serve with any static host; ensure the API is reachable at the same base URL you used at build time (or configure at runtime if your app supports it).

## Platform header

The web app can send `X-Client-Platform: web` (or `X-App-Source: web`) so the API and load balancer can track or route web traffic separately from mobile/desktop.

## Related

- **Apps overview:** `apps/README.md`
- **API:** `api.vorkspro.com/` (see repo root README and `api.vorkspro.com/README.md`)
