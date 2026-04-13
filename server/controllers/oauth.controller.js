import { User } from "../models/user.model.js";
import { createSession } from "../services/auth.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
};

export const googleCallback = asyncHandler(async (req, res) => {
    // console.log(req.user);  // Passport sets this after successful authentication
    const picture = req.user.photos[0]?.value || null;
    // console.log(picture);
    const { id, displayName, emails } = req.user;  // from Passport

    if (!emails || emails.length === 0) {
        throw new ApiError(400, "No email from Google");
    }

    const email = emails[0].value.toLowerCase();
    const username = displayName.toLowerCase().replace(/\s+/g, '_');

    // Find or create user
    let user = await User.findOne({
        $or: [{ googleId: id }, { email }]
    });

    if (!user) {
        user = await User.create({
            googleId: id,
            provider: 'google',
            email,
            username: username + '_' + Date.now(),  
            fullName: displayName,
            password: 'oauth_user_no_password',  
            isVerified: true,
            imageUrl: picture || null,
        });
    } else if (!user.googleId) {
        user.googleId = id;
        user.provider = 'google';
        await user.save();
    }

    // Create JWT tokens (same as manual login)
    const { accessToken, refreshToken } = await createSession({ user, req });

    // Set cookies
    res
        .cookie("accessToken", accessToken, {
            ...cookieOptions,
            maxAge: parseInt(process.env.ACCESS_TOKEN_EXPIRY_MS),
        })
        .cookie("refreshToken", refreshToken, {
            ...cookieOptions,
            maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRY_MS),
        })
        // Redirect to frontend success page
        .redirect(`${process.env.FRONTEND_URL}/account/login?auth=success`);
});