import mongoose, { Schema } from "mongoose";

const ProblemNoteSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
        },
        problemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Problem",
            required: [true, "Problem reference is required"],
        },
        content: {
            type: String,
            required: [true, "Note content is required"],
        },
    },
    { timestamps: true }
);

ProblemNoteSchema.index({ userId: 1, problemId: 1 }, { unique: true }); // one note per user per problem

export const ProblemNote = mongoose.model("ProblemNote", ProblemNoteSchema);