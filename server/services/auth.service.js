import dotenv from "dotenv";
dotenv.config();
import crypto from "crypto";
import { Session } from "../models/session.model.js";
import {
    generateAccessToken,
    generateRefreshToken,
} from "../utils/generateToken.js";
import ApiError from "../utils/ApiError.js";
import { UAParser } from "ua-parser-js";
import jwt from "jsonwebtoken";

export const createSession = async ({ user, req }) => {
    try {
        const sessionId = crypto.randomUUID();

        const parser = new UAParser(req.headers["user-agent"]);
        const ua = parser.getResult();

        const device = `${ua.browser.name || "Unknown"} on ${ua.os.name || "Unknown"}`;

        const refreshToken = generateRefreshToken({ sessionId });
        const accessToken = generateAccessToken({
            userId: user._id,
            role: user.role,
            sessionId,
        });

        await Session.create({
            sessionId,
            userId: user._id,
            refreshTokenHash: refreshToken,
            device,
            ip: req.ip,
            expiresAt: new Date(Date.now() + parseInt(process.env.REFRESH_TOKEN_EXPIRY_MS)),
        });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, `Error creating session: ${error.message}`);
    }
};

export const refreshAccessToken = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        // console.log("Refreshing access token with refresh token:", token);
    
        if (!token) {
            throw new ApiError(401, "Refresh token missing");
        }
    
        const payload = jwt.verify(token, process.env.refreshToken_SECRET);
        const session = await Session.findOne({ sessionId: payload.sessionId });
    
        if (!session || session.revoked) {
            throw new ApiError(401, "Invalid session");
        }
    
        const match = await session.compareRefreshToken(token);
    
        if (!match) {
            session.revoked = true;
            await session.save();
            throw new ApiError(401, "Invalid refresh token");
        }
    
        const accessToken = generateAccessToken({ userId: session.userId, role: session.role, sessionId: session.sessionId });
    
        return accessToken;
    } catch (error) {
        throw new ApiError(401, error.message);
    }
};