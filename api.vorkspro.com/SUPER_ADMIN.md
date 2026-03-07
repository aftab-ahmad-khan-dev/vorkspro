# Super Admin User

**Email:** `admin@vorkspro.com`  
**Password:** `password` (or set via `ADMIN_PASSWORD` env)

This super admin user must **never be removed**. The following protections are enforced:

- **Employee delete** – Cannot soft-delete the employee linked to this user
- **Employee terminate** – Cannot deactivate this user (isActive)
- **User role** – Cannot change or unassign the role of this user

These checks are in:
- `src/controllers/employee.controller.js` – `deleteEmployee`, `terminateEmployee`
- `src/controllers/user.controller.js` – `updateUserRole`

The super admin is seeded in `src/seed/seed.js` (or created via `ADMIN_EMAIL` env).
