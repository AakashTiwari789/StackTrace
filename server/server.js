import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import connectRedis from "./config/redis.js";
import passport from "passport";
import { setupPassport } from "./config/passport.js";
import { createServer } from 'http';
import { initSocket } from "./config/socket.js";
import { submissionQueueEvents } from "./config/queues.js";

dotenv.config({
    path: "./.env"
});

const app = express();

const httpServer = createServer(app);
const io = initSocket(httpServer);

submissionQueueEvents.on('completed', ({ returnvalue }) => {
    if (!returnvalue?.submissionId) return;
    // console.log(`Submission job completed (${returnvalue.submissionId}):`, returnvalue);
    io.to(`submission:${returnvalue.submissionId}`).emit('submissionResult', returnvalue);
});

submissionQueueEvents.on('failed', ({ jobId, failedReason }) => {
    console.error(`Submission job failed (${jobId}):`, failedReason);
});

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map(origin => origin.trim())
    .filter(origin => origin.length > 0);

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Trust proxy to get real IP (enable if behind Nginx, CloudFlare, etc.)
app.set('trust proxy', true);
app.use((req, res, next) => {
    res.setHeader('Accept-CH', 'Sec-CH-UA-Platform, Sec-CH-UA-Mobile, Sec-CH-UA-Model');
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/public', express.static('public'));
app.use(cookieParser());
app.use(passport.initialize());

setupPassport();

const PORT = process.env.PORT || 3000;

// import routes
import healthCheckRoutes from "./routes/healthCheck.route.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import problemRoutes from "./routes/problem.route.js";
import submitRoutes from "./routes/submit.route.js";

// use routers
app.use("/api/v1/health", healthCheckRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/problem", problemRoutes);
app.use("/api/v1/submit", submitRoutes);

// Global error handler middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";
    const success = err.success !== undefined ? err.success : false;
    const errors = err.errors || [];
    const data = err.data || null;

    res.status(statusCode).json({
        success,
        statusCode,
        message,
        errors,
        data
    });
});

const initializeConnection = async () => {
    try {
        await Promise.all([
            connectDB(),
            connectRedis()
        ]);
        console.log("Connected to Redis successfully.");

        httpServer.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Connection Error:", error);
        process.exit(1);
    }
};

initializeConnection();