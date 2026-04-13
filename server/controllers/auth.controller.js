import dotenv from "dotenv";
dotenv.config();
import { User } from "../models/user.model.js";
import { Session } from "../models/session.model.js";
import { VerifyLink } from "../models/verifylink.model.js";
import { VerifyOtp } from "../models/otp.model.js";
import crypto from "crypto";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { createSession } from "../services/auth.service.js";
import { sendEmail } from "../services/mail.service.js";
import { generateOTP, otpHTML } from "../utils/otp.js";
import jwt from "jsonwebtoken";
import { redisClient } from "../config/redis.js";

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
        throw new ApiError(400, "Password must be 7 or more characters long");
    }

    if (username.length < 3 || username.length > 30) {
        throw new ApiError(400, "Username must be between 3 and 30 characters");
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
                isVerified: user.isVerified,
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
        .json(new ApiResponse(200, {
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
                isVerified: user.isVerified,
            }
        }, "Login successful"));
});

export const logoutUser = asyncHandler(async (req, res) => {

    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    const accessPayload = jwt.decode(accessToken, process.env.ACCESS_TOKEN_SECRET);
    // console.log("Decoded JWT accessPayload:", accessPayload);

    const refreshPayload = jwt.decode(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    // console.log("Decoded JWT refreshPayload:", refreshPayload);

    await redisClient.set(`accessToken:${accessToken}`, "revoked");
    await redisClient.expireAt(`accessToken:${accessToken}`, accessPayload.exp);

    await redisClient.set(`refreshToken:${refreshToken}`, "revoked");
    await redisClient.expireAt(`refreshToken:${refreshToken}`, refreshPayload.exp);


    const sessionId = req.user.sessionId;
    if (!sessionId) {
        throw new ApiError(400, "No active session found");
    }
    const session = await Session.findOne({ sessionId: sessionId });
    await Session.findOneAndUpdate({ sessionId }, { revoked: true });

    const ttl = Math.ceil(session.expiresAt.getTime() / 1000) - Math.ceil(Date.now() / 1000);
    await redisClient.set(
        `revokedSession:${req.user.userId}:${sessionId}`,
        "1",
        { EX: Math.max(ttl, 0) }  // TTL auto-expires old revocations
    );

    res
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .status(200)
        .json(new ApiResponse(200, {}, "Logout successful"));
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
            isVerified: user.isVerified,
        },
    }, "User fetched successfully"
    ));
});

export const sendVerificationLink = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const email = user.email;
    // console.log("Sending verification link to email:", email);

    const link = crypto.randomUUID();

    const existedLink = await VerifyLink.findOneAndUpdate({ email }, {
        link: link,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
    }, { new: true });

    if (!existedLink) {
        await VerifyLink.create({
            email,
            link: link,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
        });
    }

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${encodeURIComponent(link)}`;

    await sendEmail(
        email,
        "Verify your email – StackTrace",
        null,
        `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Email Verification</title>
        </head>
        <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
            <td align="center" style="padding:40px 16px;">
                <table width="100%" max-width="600px" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">
                
                <!-- Header -->
                <tr>
                    <td style="padding:24px; background:#0f172a; color:#ffffff; text-align:center;">
                    <h1 style="margin:0; font-size:22px;">StackTrace</h1>
                    </td>
                </tr>

                <!-- Body -->
                <tr>
                    <td style="padding:32px; color:#111827;">
                    <h2 style="margin-top:0;">Verify your email address</h2>
                    <p style="font-size:15px; line-height:1.6;">
                        Thanks for signing up for <strong>StackTrace</strong>.
                        Please confirm your email address by clicking the button below.
                    </p>

                    <div style="text-align:center; margin:32px 0;">
                        <a href="${verificationUrl}"
                        style="background:#2563eb; color:#ffffff; padding:14px 24px; text-decoration:none; border-radius:6px; font-size:16px; display:inline-block;">
                        Verify Email
                        </a>
                    </div>

                    <p style="font-size:14px; color:#374151;">
                        If you didn’t create an account, you can safely ignore this email.
                    </p>

                    <p style="font-size:13px; color:#6b7280; word-break:break-all;">
                        Or copy and paste this URL into your browser:<br/>
                        <a href="${verificationUrl}" style="color:#2563eb;">
                        ${verificationUrl}
                        </a>
                    </p>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="padding:16px; background:#f9fafb; color:#6b7280; font-size:12px; text-align:center;">
                    © ${new Date().getFullYear()} StackTrace. All rights reserved.
                    </td>
                </tr>

                </table>
            </td>
            </tr>
        </table>
        </body>
        </html>
        `
    );

    res.status(200).json(new ApiResponse(200, {}, "Verification link sent successfully"));
});

export const verifyEmailLink = asyncHandler(async (req, res) => {
    const { link } = req.params;
    // console.log("Verifying email link:", link);

    const verifyLinkRecord = await VerifyLink.findOne({ link: link });

    if (!verifyLinkRecord || verifyLinkRecord.expiresAt < new Date()) {
        throw new ApiError(400, "Invalid or expired verification link");
    }
    if (verifyLinkRecord.isVerified) {
        throw new ApiError(400, "Verification link has already been used");
    }

    const user = await User.findOne({ email: verifyLinkRecord.email });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.isVerified) {
        throw new ApiError(400, "User is already verified");
    }

    user.isVerified = true;
    await user.save();

    // Mark the link as verified
    verifyLinkRecord.isVerified = true;
    await verifyLinkRecord.save();

    res.status(200).json(new ApiResponse(200, {}, "Email verified successfully"));
});

export const sendVerificationOtp = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    } else if (user.isVerified) {
        throw new ApiError(400, "User is already verified");
    }
    const email = user.email;
    // console.log("Sending verification Otp to email:", email);

    const otp = generateOTP(); // generate 6 digit OTP
    const html = otpHTML(otp); // generate HTML content for the OTP email

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const existedOtp = await VerifyOtp.findOneAndUpdate({ userId }, {
        otpHash,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now,
        isVerified: false
    }, { new: true });

    if (!existedOtp) {
        await VerifyOtp.create({
            userId,
            otpHash,
            isVerified: false,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
        });
    }

    // console.log("Generated OTP:", otp);

    await sendEmail(
        email,
        "Your OTP for email verification – StackTrace",
        `Your OTP for verifying your email is: ${otp}`,
        html
    );

    res.status(200).json(new ApiResponse(200, {}, "Verification otp sent successfully"));
});


export const VerifyOTP = asyncHandler(async (req, res) => {
    const { otp } = req.body;
    // console.log("Verifying otp:", otp);
    const userId = req.user.userId;

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    const verifyOtpRecord = await VerifyOtp.findOne({ otpHash, userId });

    if (!verifyOtpRecord || verifyOtpRecord.expiresAt < new Date()) {
        throw new ApiError(400, "Invalid or expired verification otp");
    }
    if (verifyOtpRecord.isVerified) {
        throw new ApiError(400, "Verification otp has already been used");
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.isVerified) {
        throw new ApiError(400, "User is already verified");
    }

    user.isVerified = true;
    await user.save();

    // Mark the link as verified
    verifyOtpRecord.isVerified = true;
    await verifyOtpRecord.save();

    res.status(200).json(new ApiResponse(200, {
        user: {
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
            isVerified: user.isVerified,
        },
    }, "User verified successfully"));
});