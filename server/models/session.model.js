import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const sessionSchema = new Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    refreshTokenHash: {
        type: String,
        required: true
    },
    device: String,
    ip: String,
    revoked: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 }
    }
},
    { timestamps: true }
);

sessionSchema.pre('save', async function () {
    if (!this.isModified("refreshTokenHash")) return;
    this.refreshTokenHash = await bcrypt.hash(this.refreshTokenHash, 10);
});

sessionSchema.methods.compareRefreshToken = function (token) {
    return bcrypt.compare(token, this.refreshTokenHash);
};

export const Session = mongoose.model("Session", sessionSchema);