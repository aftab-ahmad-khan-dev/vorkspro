# API folder structure (platform-specific)

```
api.vorkspro.com/
├── load-balancer/                   # Round-robin proxy (Node built-in http only)
│   ├── server.js
│   ├── package.json
│   └── README.md
├── nginx/                           # Nginx config examples
│   ├── loadbalancer.conf.example
│   └── README.md
├── src/
│   ├── shared/                      # Shared across web, mobile, desktop
│   │   ├── routes/
│   │   │   └── index.js             # Aggregates all route modules
│   │   └── README.md
│   │
│   ├── platforms/                   # Platform-specific entry points
│   │   ├── web/
│   │   │   ├── routes.js            # Web API entry (mounts shared routes)
│   │   │   └── controllers/        # Optional web-only controller overrides
│   │   ├── mobile/
│   │   │   ├── routes.js
│   │   │   └── controllers/
│   │   ├── desktop/
│   │   │   ├── routes.js
│   │   │   └── controllers/
│   │   └── README.md
│   │
│   ├── routes/                      # Shared route modules (user, project, client, …)
│   ├── controllers/
│   ├── models/
│   ├── services/
│   ├── middlewares/
│   ├── database/
│   ├── startup/
│   │   └── routes.js                # Mounts /api, /api/web, /api/mobile, /api/desktop
│   ├── app.js
│   └── index.js
│
├── STRUCTURE.md
└── package.json
```

## URL layout

| Base path      | Platform |
|----------------|----------|
| `/api`         | Web (backward compatible) |
| `/api/web`     | Web |
| `/api/mobile`  | Mobile |
| `/api/desktop` | Desktop |

Example: `POST /api/mobile/user/login` and `POST /api/user/login` both hit the same handler; token middleware normalizes platform-prefixed paths for public/auth checks.

## Load balancing (per platform)

The API handles web, mobile, and desktop on separate paths so the load balancer can route and scale each platform independently:

- **Node LB** (`load-balancer/server.js`): use `BACKEND_WEB_PORTS`, `BACKEND_MOBILE_PORTS`, `BACKEND_DESKTOP_PORTS` to send `/api/web`, `/api/mobile`, `/api/desktop` to different backend pools.
- **Nginx** (`nginx/loadbalancer.conf.example`): separate upstreams `vorkspro_web`, `vorkspro_mobile`, `vorkspro_desktop` with matching `location` blocks.
