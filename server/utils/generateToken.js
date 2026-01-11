import jwt from "jsonwebtoken";

export const generateAccessToken = ({ userId, role, sessionId }) => {
    return jwt.sign(
        {
            userId,
            role,
            sessionId
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '10m'
        }
    )
};

export const generateRefreshToken = ({ sessionId }) => {
    return jwt.sign(
        {
            sessionId
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d'
        }
    );
};