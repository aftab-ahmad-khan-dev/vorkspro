import { getHealth, getHealthPage } from "./health.js";
import logger from "../services/logger.js";

import webRoutes from "../platforms/web/routes.js";
import mobileRoutes from "../platforms/mobile/routes.js";
import desktopRoutes from "../platforms/desktop/routes.js";

export default function (app) {
  app.use("/api", webRoutes);
  app.use("/api/web", webRoutes);
  app.use("/api/mobile", mobileRoutes);
  app.use("/api/desktop", desktopRoutes);

  logger.banner(
    `Routes mounted: /api, /api/web, /api/mobile, /api/desktop (mode: ${process.env.MODE || "development"})`
  );
  app.get("/", getHealthPage);
  app.get("/health", getHealthPage);
}
