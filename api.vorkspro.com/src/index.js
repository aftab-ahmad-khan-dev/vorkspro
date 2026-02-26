import initializeDatabase from './database/database.js';
import { app } from './app.js';
import initializeSocket from './startup/socket.js';
import logger from './services/logger.js';

const startServer = async () => {
    try {
        await initializeDatabase();
        const { server, io } = initializeSocket(app);
        app.set("notifyio", io);
        app.locals.io = io;

        const PORT = process.env.PORT || 3000;
        server.listen(PORT, () => {
            logger.banner(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        logger.error("MongoDB connection failed", "Server", err);
        process.exit(1);
    }
};

startServer();