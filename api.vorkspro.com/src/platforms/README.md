# Platform-specific structure (web, mobile, desktop)

One API serves three clients. Each platform has its own **entry** under `src/platforms/<platform>/`.

## Folder layout

```
src/
├── shared/                    # Cross-platform
│   ├── routes/
│   │   └── index.js           # Aggregates all route modules (from src/routes/)
│   └── README.md
├── platforms/
│   ├── web/
│   │   ├── routes.js          # Mounts shared routes; add web-only routes here
│   │   └── controllers/       # Optional web-specific controller overrides
│   ├── mobile/
│   │   ├── routes.js
│   │   └── controllers/
│   ├── desktop/
│   │   ├── routes.js
│   │   └── controllers/
│   └── README.md
├── routes/                    # Shared route modules (project, user, client, …)
├── controllers/
├── models/
├── services/
└── middlewares/
```

## URL paths

| Path           | Platform | Use case |
|----------------|----------|----------|
| `/api`         | web      | Backward compatibility (same as `/api/web`) |
| `/api/web`     | web      | Web app |
| `/api/mobile`  | mobile   | Mobile app |
| `/api/desktop` | desktop  | Desktop app |

Clients can call either `/api/...` (web) or `/api/mobile/...`, `/api/desktop/...`. `req.platform` is set by middleware from `X-Client-Platform` or from the path.

## Adding platform-specific logic

- **Routes:** Edit `platforms/<platform>/routes.js` and add routes before or after `router.use("/", sharedRoutes)`.
- **Controllers:** Put overrides in `platforms/<platform>/controllers/` and reference them from the platform’s routes.
