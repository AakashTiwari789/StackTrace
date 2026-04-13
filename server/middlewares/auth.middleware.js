import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { Session } from "../models/session.model.js";
import { refreshAccessToken } from "../services/auth.service.js";
import { redisClient } from "../config/redis.js";

export const authenticateUser = asyncHandler(async (req, res, next) => {
    let accessToken = req.cookies.accessToken;
    // console.log("Authenticating user with access accessToken:", accessToken);
    const sessionId = req.cookies.sessionId;


    if (!accessToken) {
        accessToken = await refreshAccessToken(req, res);
    }

    const isBlocked = await redisClient.exists(`accessToken:${accessToken}`);
    if (isBlocked) {
        return next(new ApiError(401, "Unauthorized: Token has been revoked"));
    }

    const session = await Session.findById(sessionId);
    if (!session) {
        return next(new ApiError(401, "Unauthorized: Invalid session"));
    }

    let payload;
    try {
        payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
            accessToken = await refreshAccessToken(req, res);
            payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        } else {
            throw err;
        }
    }

    req.user = payload;
    next();
});