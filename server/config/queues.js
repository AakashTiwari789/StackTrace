import dotenv from "dotenv";

dotenv.config();
import { Queue } from 'bullmq';
import { redisClient } from './redis.js';

export const submissionQueue = new Queue('submissions', {
    connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_PASS
    }
});