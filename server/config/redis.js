import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

export const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-18290.c14.us-east-1-3.ec2.cloud.redislabs.com',
        port: 18290
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