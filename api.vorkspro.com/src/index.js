import initializeDatabase from './database/database.js';
import { app } from './app.js';
import initializeSocket from './startup/socket.js';
import nodemon from 'nodemon';

const startServer = async () => {
    try {
        await initializeDatabase();
        // const server = initializeSocket(app);
        const { server, io } = initializeSocket(app);
        app.set("notifyio", io);
        app.locals.io = io;

        const PORT = process.env.PORT || 3000;
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error('MongoDB connection failed:', err);
        process.exit(1);
    }
};

startServer();