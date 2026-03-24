import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        immutable: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
    },
    password: {
        type: String,
        required: true,
        minLength: [7, "Password must be at least 7 characters long"],
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    imageUrl: {
        type: String,
        default: null,
    },
},
    { timestamps: true }
);

// Hash password before saving if it was modified
userSchema.pre('save', async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return bcrypt.compare(password, this.password);
};


export const User = mongoose.model("User", userSchema);