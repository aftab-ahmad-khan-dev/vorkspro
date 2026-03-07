/**
 * Desktop platform API routes.
 * Uses shared route tree; add desktop-specific routes or middleware here if needed.
 */
import { Router } from "express";
import sharedRoutes from "../../shared/routes/index.js";

const router = Router();
router.use("/", sharedRoutes);
export default router;
