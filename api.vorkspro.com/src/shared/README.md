# Shared (cross-platform)

Code used by **all** platforms (web, mobile, desktop).

- **shared/routes/index.js** — Aggregates all route modules from `src/routes/` into one router. Each platform (`platforms/web`, `platforms/mobile`, `platforms/desktop`) mounts this and can add its own routes on top.

Shared route modules, controllers, models, services, and middlewares live at the top level: `src/routes/`, `src/controllers/`, `src/models/`, `src/services/`, `src/middlewares/`.
