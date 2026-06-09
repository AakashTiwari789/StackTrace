import mongoose, { Schema } from "mongoose";

const userStatsSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
        },
        solvedCount: {
            Easy: {
                type: Number,
                default: 0,
            },
            Medium: {
                type: Number,
                default: 0,
            },
            Hard: {
                type: Number,
                default: 0,
            },
        },
    },
    { timestamps: true }
);

export const UserStats = mongoose.model("UserStats", userStatsSchema);