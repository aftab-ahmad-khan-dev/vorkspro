import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { REGISTRY_DB_NAME } from "../constants.js";
import OrganizationSchema from "../models/organization.model.js";
import RegistrationDraftSchema from "../models/registrationDraft.model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function buildDbUri(dbName) {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) return null;
  if (uri.includes("?")) return uri.replace("?", `/${dbName}?`);
  return `${uri.replace(/\/$/, "")}/${dbName}`;
}

const registryUri = buildDbUri(REGISTRY_DB_NAME);
if (!registryUri) throw new Error("MONGODB_URI missing for registry");

const registryConn = mongoose.createConnection(registryUri, {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
});

registryConn.model("Organization", OrganizationSchema);
registryConn.model("RegistrationDraft", RegistrationDraftSchema);

export async function ensureRegistry() {
  if (registryConn.readyState !== 1) await registryConn.asPromise();
  return registryConn;
}

export function getRegistryConnection() {
  return registryConn;
}

export function getOrganizationModel() {
  return registryConn.model("Organization");
}

export function getRegistrationDraftModel() {
  return registryConn.model("RegistrationDraft");
}
