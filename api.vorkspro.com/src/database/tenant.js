import mongoose from "mongoose";

const tenantConnections = new Map();

/**
 * Returns a connection to the tenant's database. Registers all models from the
 * default connection onto this tenant connection so the same schemas are used.
 * Call after default connection is established (e.g. from auth middleware or login).
 */
export function getTenantConnection(dbName) {
  if (!dbName || typeof dbName !== "string") return null;
  const key = dbName.trim();
  if (!key) return null;

  if (tenantConnections.has(key)) return tenantConnections.get(key);

  const mainConn = mongoose.connection;
  if (mainConn.readyState !== 1) return null;

  const tenantConn = mainConn.useDb(key);
  const modelNames = mainConn.modelNames();
  for (const name of modelNames) {
    try {
      const m = mainConn.model(name);
      if (m && m.schema) tenantConn.model(name, m.schema);
    } catch (_) {}
  }
  tenantConnections.set(key, tenantConn);
  return tenantConn;
}

export function clearTenantConnectionCache(dbName) {
  if (dbName) tenantConnections.delete(dbName.trim());
  else tenantConnections.clear();
}
