import dotenv from "dotenv";
dotenv.config();
import { User } from "../models/user.model.js";
import { Session } from "../models/session.model.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { createSession } from "../services/auth.service.js";

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
};

export const registerUser = asyncHandler(async (req, res) => {
    let { username, email, password } = req.body;

    if (
        [username, email, password].some((field) => !field || field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    email = email?.toLowerCase();
    username = username?.toLowerCase();

    // Basic validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9_]+$/; // letters, numbers, underscore only

    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid email format");
    }

    if (!usernameRegex.test(username)) {
        throw new ApiError(400, "Username can only contain letters, numbers, and underscore (_)");
    }

    if (typeof password !== 'string' || password.length <= 6) {
        throw new ApiError(400, "Password must be longer than 6 characters");
    }

    if (username.length < 3 || username.length > 30) {
        throw new ApiError(400, "Username must be between 3 and 30 characters");
    }

    if (password.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters long");
    }

    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>-]/;
    if (specialCharRegex.test(username)) {
        throw new ApiError(400, "Username cannot contain special characters other than underscores");
    }

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
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .status(201)
        .json(new ApiResponse(201, {
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
            },
        }, "User registered successfully"
        ));
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
    // console.log("Verifying password for user:", user._id);

    const { accessToken, refreshToken } = await createSession({ user, req });
    // console.log("Access Token:", accessToken);
    // console.log("Refresh Token:", refreshToken); 

    res
        .cookie("accessToken", accessToken, {
            ...cookieOptions,
            maxAge: parseInt(process.env.ACCESS_TOKEN_EXPIRY_MS),
        })
        .cookie("refreshToken", refreshToken, {
            ...cookieOptions,
            maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRY_MS),
        })
        .status(200)
        .json(new ApiResponse(200,
            {
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                }
            },
            "Login successful"));
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

    res.status(200).json(new ApiResponse(200, {
        user: {
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
        },
    }, "User fetched successfully"
    ));
});