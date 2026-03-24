import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { Session } from "../models/session.model.js";
import { refreshAccessToken } from "../services/auth.service.js";

export const authenticateUser = asyncHandler(async (req, res, next) => {
    let accessToken = req.cookies.accessToken;
    // console.log("Authenticating user with access accessToken:", accessToken);

    if (!accessToken) {
        accessToken = await refreshAccessToken(req, res);
    }

    const payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.user = payload;
    next();
});