# VorksPro

**Role-based business operations platform** — manage projects, clients, employees, milestones, finance, HR, and more from a single dashboard with configurable permissions.

---

## Description

VorksPro is a full-stack web application for teams and organizations to manage operations in one place. It includes:

- **Dashboard** — Role-based overview with stats, quick actions, and activity (leave requests, upcoming to-dos, project status).
- **Project Management** — Projects with team members, milestones, blockages, keys & credentials, and progress tracking.
- **Client Management** — Clients, contacts, and project linkage.
- **Employees** — Employee records, departments, sub-departments, attendance, performance, and payroll.
- **HR Management** — Leave requests, holidays, and leave types.
- **Finance** — Transactions, reports, and **invoice generation** (PDF with client, project/milestone pricing, and org branding).
- **Other modules** — Announcements, follow-up hub, my to-do hub, knowledge base, reports & analytics, admin & assets, and categories (departments, leave types, document types, etc.).

Access is **role-based**: admins define roles and assign modules/actions (e.g. View Records, Create Records). Users see only what their role allows. Super Admin and optional self-service “assign default role” are supported.

---

## Tech Stack

| Layer    | Stack                                                   |
| -------- | ------------------------------------------------------- |
| Frontend | React 19, Vite, Tailwind CSS, Radix UI, Recharts, jsPDF |
| Backend  | Node.js, Express, Mongoose (MongoDB), Redis, JWT        |
| Auth     | JWT access + refresh tokens, role-based permissions     |

---

## Repo Structure (SaaS & PaaS, modular)

| Path | Purpose |
|------|--------|
| **`api.vorkspro.com/`** | Backend API serving **web**, **mobile**, and **desktop** separately for better load balancing. Includes **`load-balancer/`** (Node proxy, per-platform backends) and **`nginx/`** (example nginx config). |
| **`apps/web/`** | React (Vite) web app. |
| **`apps/mobile/`** | Placeholder for mobile client (React Native / Expo or Flutter). |
| **`apps/desktop/`** | Placeholder for desktop client (Electron or Tauri). |

The API detects client platform via header **`X-Client-Platform`** or **`X-App-Source`** (`web` \| `mobile` \| `desktop`) and sets `req.platform` for logging or platform-specific logic.

---

## Deployment (Vercel)

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for Vercel setup — Root Directory for **Web**: `apps/web`, for **API**: `api.vorkspro.com`.

---

## Quick Start

1. **API** (from repo root):
   ```bash
   cd api.vorkspro.com
   npm install
   cp .env.example .env   # set MONGO_URI, TOKEN_SECRET, etc.
   npm run start
   ```
2. **Web** (from repo root):
   ```bash
   cd apps/web
   npm install
   cp .env.example .env   # set VITE_APP_BASE_URL to your API (e.g. http://localhost:4000/api or http://localhost:3000/api when using LB)
   npm run dev
   ```
3. **(Optional)** Seed roles and admin user:
   ```bash
   cd api.vorkspro.com && node src/seed/seed.js
   ```
4. Log in with the seeded admin (e.g. from env `ADMIN_EMAIL` / `ADMIN_PASSWORD`) or create a role and assign it to a user.

---

## Load Balancer & Nginx (inside API repo)

Load balancer and nginx config live in **`api.vorkspro.com/`**:

- **Node.js round-robin proxy** (no paid packages): `api.vorkspro.com/load-balancer/`
- **Nginx example**: `api.vorkspro.com/nginx/loadbalancer.conf.example`

```bash
# Option A: Single pool
cd api.vorkspro.com && PORT=4000 node -r dotenv/config src/index.js
cd api.vorkspro.com && PORT=4001 node -r dotenv/config src/index.js
cd api.vorkspro.com/load-balancer && LB_PORT=3000 BACKEND_PORTS=4000,4001 node server.js

# Option B: Per-platform backends (better load distribution)
# Terminals 1–2: web | 3: mobile | 4: desktop
PORT=4000 node -r dotenv/config src/index.js   # web
PORT=4001 node -r dotenv/config src/index.js   # web
PORT=4002 node -r dotenv/config src/index.js   # mobile
PORT=4003 node -r dotenv/config src/index.js   # desktop
cd api.vorkspro.com/load-balancer
LB_PORT=3000 BACKEND_WEB_PORTS=4000,4001 BACKEND_MOBILE_PORTS=4002 BACKEND_DESKTOP_PORTS=4003 node server.js
```

Point **web** (e.g. `apps/web`) and other clients to `http://localhost:3000`. For production use **nginx**; copy `api.vorkspro.com/nginx/loadbalancer.conf.example` (separate upstreams per platform).

**API cluster mode** (multiple workers on one port, Node built-in):

```bash
cd api.vorkspro.com
ENABLE_CLUSTER=1 npm run start:cluster
```

---

## API performance

The API uses **Redis** for auth cache (fewer DB lookups per request) and optional response caching for list/lookup endpoints. For production throughput see **`api.vorkspro.com/PERFORMANCE.md`** (cluster, cache, Cache-Control, DB tips).

---

## License

ISC (or your chosen license).
