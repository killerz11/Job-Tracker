import express from "express";
import cors from "cors";

const app = express();

app.use(express.json());

const allowedOrigins = [
    "http://localhost:3000",     
    "http://localhost:5173",
    "https://humorous-solace-production.up.railway.app",
    "https://job-tracker-gules-eta.vercel.app", // Vercel frontend
];

app.use(cors({
    origin: (origin, callback) => {
        if(!origin){
            return callback(null, true);
        }

        if (origin.startsWith("chrome-extension://")) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
}));

export default app;
