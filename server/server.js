import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import connectRedis from "./config/redis.js";

dotenv.config({
    path: "./.env"
});

const app = express();

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

const PORT = process.env.PORT || 3000;

// import routes
import healthCheckRoutes from "./routes/healthCheck.route.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";


// use routers
app.use("/api/v1/health", healthCheckRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);

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
            // connectRedis()
        ]);
        console.log("Connected to Redis successfully.");

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {

    }
};

initializeConnection();