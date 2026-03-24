import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const OTPSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User reference is required"],
    },
    otpHash: {
        type: String,
        required: [true, "OTP hash is required"],
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // This will automatically remove the document after the specified time (expiresAt) has passed
    },
},
    { timestamps: true }
);

export const VerifyOtp = mongoose.model("VerifyOtp", OTPSchema);