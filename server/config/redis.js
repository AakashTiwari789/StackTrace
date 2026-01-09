import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const client = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-10866.c114.us-east-1-4.ec2.cloud.redislabs.com',
        port: 10866
    }
});

const connectRedis = async () => {
    try {
        // console.log("Connecting to Redis...");
        await client.connect();
    } catch (error) {
        console.log(`Error occured while connecting to Redis: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

export default connectRedis;