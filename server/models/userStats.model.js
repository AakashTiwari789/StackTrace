import mongoose, { Schema } from "mongoose";

const userStatsSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
        },
        solvedCount: {
            easy: {
                type: Number,
                default: 0,
            },
            medium: {
                type: Number,
                default: 0,
            },
            hard: {
                type: Number,
                default: 0,
            },
        },
    },
    { timestamps: true }
);

export const UserStats = mongoose.model("UserStats", userStatsSchema);