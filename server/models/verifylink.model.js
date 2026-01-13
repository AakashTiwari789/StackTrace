import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const verifyLinkSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    link: {
        type: String,
        required: true,
        unique: true
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 }
    },
},
    { timestamps: true }
);

export const VerifyLink = mongoose.model("VerifyLink", verifyLinkSchema);