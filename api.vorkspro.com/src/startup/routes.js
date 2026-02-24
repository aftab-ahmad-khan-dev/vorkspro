import { getHealth, getHealthPage } from './health.js';
import portalRoutes from '../routes/index.js';

export default function (app) {
    app.use("/api", portalRoutes);
    // app.use("/ap", adminPanelRoute);

    // app.use("/ma", mobileAppRoute);
    // app.use("/vp", vendorPanelRoute);
    // app.use("/file", fileRoute);

    console.log("ENV Mode" ,process.env.MODE)
    app.get('/', getHealthPage);

    app.get('/health', getHealthPage);

}
