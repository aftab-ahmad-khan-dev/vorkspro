# VorksPro client apps

All client applications live under **`apps/`**. The API (`api.vorkspro.com`) serves each platform on separate paths and supports per-platform load balancing.

| App         | Path            | Description                                                                                                       |
| ----------- | --------------- | ----------------------------------------------------------------------------------------------------------------- |
| **web**     | `apps/web/`     | React (Vite) web app. Run: `cd apps/web && npm install && npm run dev`                                            |
| **mobile**  | `apps/mobile/`  | Placeholder for React Native / Expo or Flutter. Send `X-Client-Platform: mobile` and use `/api/mobile` or `/api`. |
| **desktop** | `apps/desktop/` | Placeholder for Electron or Tauri. Send `X-Client-Platform: desktop` and use `/api/desktop` or `/api`.            |

The API exposes **`/api`**, **`/api/web`**, **`/api/mobile`**, and **`/api/desktop`**. The load balancer (see `api.vorkspro.com/load-balancer/` and `api.vorkspro.com/nginx/`) can route each platform to its own backend pool for better distribution and scaling.

**API base URL:** Point each app to the API (e.g. `http://localhost:4000` for direct API, or `http://localhost:3000` when using the load balancer). Use the `/api` prefix in the base URL as required by your app (e.g. `http://localhost:4000/api`).
