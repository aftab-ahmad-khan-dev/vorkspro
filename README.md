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

| Layer    | Stack |
|----------|--------|
| Frontend | React 19, Vite, Tailwind CSS, Radix UI, Recharts, jsPDF |
| Backend  | Node.js, Express, Mongoose (MongoDB), Redis, JWT |
| Auth     | JWT access + refresh tokens, role-based permissions |

---

## Repo Structure

- **`web.vorkspro.com/`** — React (Vite) frontend; runs on `/portal` or dev server.
- **`api.vorkspro.com/`** — Express API; auth, CRUD, and permission middleware.

---

## Quick Start

1. **API** (from repo root):
   ```bash
   cd api.vorkspro.com
   npm install
   cp .env.example .env   # set MONGO_URI, TOKEN_SECRET, etc.
   npm run start
   ```
2. **Web**:
   ```bash
   cd web.vorkspro.com
   npm install
   cp .env.example .env   # set VITE_APP_BASE_URL to your API (e.g. http://localhost:4000/api/)
   npm run dev
   ```
3. **(Optional)** Seed roles and admin user:
   ```bash
   cd api.vorkspro.com && node src/seed/seed.js
   ```
4. Log in with the seeded admin (e.g. from env `ADMIN_EMAIL` / `ADMIN_PASSWORD`) or create a role and assign it to a user.

---

## License

ISC (or your chosen license).
