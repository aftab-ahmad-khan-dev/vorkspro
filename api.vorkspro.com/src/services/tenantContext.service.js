/**
 * Use the tenant connection when present (req.tenantConn), otherwise fall back to default models.
 * Import default models from startup/models and pass req + model name to get the right one.
 *
 * Example (in a controller):
 *   import * as models from "../startup/models.js";
 *   import { getModel } from "../services/tenantContext.service.js";
 *   const User = getModel(req, "User", models.User);
 *   const users = await User.find();
 */
export function getModel(req, modelName, defaultModel) {
  if (req.tenantConn) {
    try {
      return req.tenantConn.model(modelName);
    } catch (_) {
      return defaultModel;
    }
  }
  return defaultModel;
}
