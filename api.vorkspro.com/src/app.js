import express from 'express';
import cors from 'cors';
import routes from "./startup/routes.js";
import { tokenChecker } from './middlewares/token.middleware.js';
import "./cron/reminder.cron.js";
import { createClient } from "redis";

export const client = createClient({
    url: "redis://127.0.0.1:6379"
});

await client.connect();
console.log("Redis Connected");


const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(tokenChecker);
(async () => {

})();

//? routes
routes(app);

// routes declaration

export { app };
