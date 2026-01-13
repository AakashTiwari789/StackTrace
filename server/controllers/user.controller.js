import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Session } from "../models/session.model.js";

export const getUserById = asyncHandler(async (req, res) => {
    const userId = req.params.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res.status(200).json(new ApiResponse(200, { user }, "User fetched successfully"));
});

export const getUserByUsername = asyncHandler(async (req, res) => {
    console.log("Fetching user by username:", req.params.username);
    const username = req.params.username.toLowerCase();

    const user = await User.findOne({ username }).select("-password");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res.status(200).json(new ApiResponse(200, { user }, "User fetched successfully"));
});

export const getAllSessionOfUser = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const currentSessionId = req.user.sessionId;
    // console.log("Fetching sessions for user:", userId);
    // console.log("User: ", req.user.sessionId);

    const sessions = await Session.find({ userId }).select("-refreshTokenHash -userId -_id -__v");

    res.status(200).json(new ApiResponse(200, { sessions, currentSessionId }, "Sessions fetched successfully"));
});

export const logoutUserFromAllDevices = asyncHandler(async (req, res) => {
    const userId = req.user.userId;

    await Session.updateMany({ userId, revoked: false }, { revoked: true });

    res.status(200).json(new ApiResponse(200, "Logged out from all devices successfully"));
});

export const logoutUserFromDevice = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { sessionId } = req.body;
    console.log("Logging out from session:", sessionId);

    const session = await Session.findOne({ sessionId, userId });

    if (!session) {
        throw new ApiError(404, "Session not found");
    }

    await Session.findOneAndUpdate({ sessionId, userId }, { revoked: true });

    res.status(200).json(new ApiResponse(200, "Logged out from the device successfully"));
});