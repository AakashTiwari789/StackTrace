import dotenv from "dotenv";
dotenv.config();
import { User } from "../models/user.model.js";
import { Session } from "../models/session.model.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { createSession } from "../services/auth.service.js";

export const registerUser = asyncHandler(async (req, res) => {
    let { username, email, password } = req.body;

    if (
        [username, email, password].some((field) => !field || field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    email = email?.toLowerCase();
    username = username?.toLowerCase();

    const existingUser = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (existingUser) {
        throw new ApiError(409, "User with given email or username already exists");
    }

    const user = await User.create({ username, email, password, fullName: username });

    const { accessToken, refreshToken } = await createSession({ user, req });

    if (!accessToken || !refreshToken) {
        throw new ApiError(500, "Error creating session tokens");
    }

    res
        .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
        .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
        .status(201)
        .json(new ApiResponse(201, "User registered successfully", {
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
            },
        }));
});

export const loginUser = asyncHandler(async (req, res) => {
    let { email, username, password } = req.body;

    email = email?.toLowerCase();
    username = username?.toLowerCase();

    // check by email or username
    const user = await User.findOne({
        $or: [{ email }, { username }],
    })

    if (!user) {
        throw new ApiError(401, "Invalid credentials");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await createSession({ user, req });

    res
        .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
        .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
        .status(200)
        .json(new ApiResponse(200, "Login successful", {
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
            },
        }));
});

export const logoutUser = asyncHandler(async (req, res) => {
    const sessionId = req.user.sessionId;
    if (!sessionId) {
        throw new ApiError(400, "No active session found");
    }
    await Session.findOneAndUpdate({ sessionId }, { revoked: true });
    res
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .status(200)
        .json(new ApiResponse(200, "Logout successful"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    const userId = req.user.userId;

    const user = await User.findById(userId).select("-password");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res.status(200).json(new ApiResponse(200, "Current user fetched successfully", {
        user: {
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
        },
    }));
});