import mongoose, { Schema } from "mongoose";

const SubmissionSchema = new Schema(
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
        contestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contest",
            default: null, // Optional reference to a contest
        },

        language: {
            type: String,
            required: [true, "Programming language is required"],
        },
        code: {
            type: String,
            required: [true, "Code content is required"],
        },
        status: {
            type: String,
            enum: [
                'Pending',
                'Accepted',
                'Wrong Answer',
                'Time Limit Exceeded',
                'Compilation Error',
                'Runtime Error (SIGSEGV)',
                'Runtime Error (SIGXFSZ)',
                'Runtime Error (SIGFPE)',
                'Runtime Error (SIGABRT)',
                'Runtime Error (NZEC)',
                'Runtime Error (Other)',
                'Internal Error',
                'Exec Format Error',
            ],
            default: 'Pending',
        },
        verdict: {
            passedCount: {
                type: Number,
                default: 0,
            },
            totalCount: {
                type: Number,
                default: 0,
            },
            runtime: Number, // in milliseconds
            memory: Number, // in KB
            error: String, // Compilation or runtime error messages
            failedCase: {
                input: String,
                expectedOutput: String,
                actualOutput: String,
            }
        },
        submissionTime: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

SubmissionSchema.index({ userId: 1, problemId: 1 }); // To quickly find a user's submission for a specific problem
SubmissionSchema.index({ userId: 1, status: 1 }); // To quickly find all submissions of a user with a specific status (e.g., accepted)
SubmissionSchema.index({ problemId: 1, status: 1 }); // To quickly find all submissions for a problem with a specific status (e.g., accepted)
SubmissionSchema.index({ submittedAt: -1 }); // To quickly find recent submissions, especially for admin dashboards or recent activity feeds

export const Submission = mongoose.model("Submission", SubmissionSchema);