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
import { getClientIp } from "../utils/getClientIp.js";

export const createSession = async ({ user, req }) => {
    try {
        const sessionId = crypto.randomUUID();

        const parser = new UAParser(req.headers["user-agent"]);
        const ua = parser.getResult();
        const clientHints = {
            platform: req.headers['sec-ch-ua-platform'] || null,
            mobile: req.headers['sec-ch-ua-mobile'] || null,
            model: req.headers['sec-ch-ua-model'] || null,
        };

        const device = {
            browser: ua.browser.name || "Unknown",
            browserVersion: ua.browser.version || "Unknown",
            os: ua.os.name || "Unknown",
            osVersion: ua.os.version || "Unknown",
            device: ua.device.type || "desktop", // mobile/tablet/desktop
            deviceModel: ua.device.model || clientHints.model || "Unknown",
            // Add hint-based detection
            platform: clientHints.platform?.replace(/"/g, '') || ua.os.name,
            isMobile: clientHints.mobile === '?1' || ua.device.type === 'mobile',
        };

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
            device: JSON.stringify(device),
            ip: getClientIp(req),
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

        if (!token) {
            throw new ApiError(401, "Refresh token missing");
        }

        let payload;
        try {
            payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new ApiError(401, "Refresh token expired");
            } else {
                throw new ApiError(401, "Invalid refresh token");
            }
        };

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

        const user = await User.findById(session.userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = generateAccessToken({ userId: session.userId, role: user.role, sessionId: session.sessionId });

        // Set the new access token as a cookie
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });

        return accessToken;
    } catch (error) {
        throw new ApiError(401, error.message);
    }
};