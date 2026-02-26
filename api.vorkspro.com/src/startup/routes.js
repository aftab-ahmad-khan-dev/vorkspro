import { getHealth, getHealthPage } from './health.js';
import portalRoutes from '../routes/index.js';
import logger from '../services/logger.js';

export default function (app) {
    app.use("/api", portalRoutes);

    logger.banner(`Routes mounted (mode: ${process.env.MODE || "development"})`);
    app.get('/', getHealthPage);

    app.get('/health', getHealthPage);

}
