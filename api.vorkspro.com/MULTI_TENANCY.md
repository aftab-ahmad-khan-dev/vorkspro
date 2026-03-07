# Multi-tenancy (DB per organization)

Each organization has its own MongoDB database so data is fully isolated.

## How it works

- **Registry DB** (`VorksProRegistry`): Stores one document per organization (name, slug, dbName, adminEmail).
- **Tenant DBs**: Named `vorkspro_<slug>` (e.g. `vorkspro_acme`). Each has the full set of collections (users, projects, employees, etc.).

## Registration

**POST** `/api/user/register`

Body:

```json
{
  "orgName": "Acme Corp",
  "slug": "acme",
  "adminEmail": "admin@acme.com",
  "adminPassword": "your-secure-password",
  "firstName": "Admin",
  "lastName": "User"
}
```

- Creates the org in the registry and a new DB `vorkspro_acme`.
- Seeds that DB with Admin role + the admin user + Employee profile.
- `slug` is used in login and must be unique.

## Login

**POST** `/api/user/login`

- **With org:** `{ "orgSlug": "acme", "identifier": "admin@acme.com", "password": "..." }`  
  Uses the tenant DB for that org.
- **Without org:** `{ "identifier": "admin@vorkspro.com", "password": "..." }`  
  Uses the default DB (current single-tenant behaviour).

The JWT includes `dbName` and `orgSlug` when the user belongs to a tenant org.

## Using the tenant in controllers

After auth, `req.tenantConn` and `req.tenantDbName` are set for tenant users. To read/write that org’s data, use the tenant connection:

```js
import { getModel } from "../services/tenantContext.service.js";
import * as models from "../startup/models.js";

// In your handler:
const User = getModel(req, "User", models.User);
const Project = getModel(req, "Project", models.Project);
```

If `req.tenantConn` is set, `getModel` returns the model on the tenant connection; otherwise it returns the default model. Migrate controllers to use `getModel(req, "ModelName", models.ModelName)` so that tenant users only see their org’s data.

## Default DB

The app still connects to `VorksPro` (or `DEV_DB_NAME`) by default. That DB is used when no `orgSlug` is sent on login (e.g. the original single-tenant setup). New orgs created via registration get their own DBs and use `orgSlug` on login.
