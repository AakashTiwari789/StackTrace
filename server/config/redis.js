import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

export const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

const connectRedis = async () => {
    try {
        // console.log("Connecting to Redis...");
        await redisClient.connect();
    } catch (error) {
        console.error(`Error occured while connecting to Redis: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

export default connectRedis;