import dotenv from "dotenv";
dotenv.config();

import { Queue, QueueEvents } from 'bullmq';
import { redisClient } from './redis.js';

const connection = {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    password: process.env.REDIS_PASS
}

export const submissionQueue = new Queue('submissionQueue', { connection });
export const submissionQueueEvents = new QueueEvents('submissionQueue', { connection });