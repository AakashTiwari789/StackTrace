import mongoose, { Schema } from 'mongoose';

const ProblemSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Problem title is required"],
            unique: true,
            trim: true,
        },
        slug: {
            type: String,
            required: [true, "Problem slug is required"],
            unique: true,
            trim: true,
        },
        difficulty: {
            type: String,
            required: [true, "Problem difficulty is required"],
            enum: ["Easy", "Medium", "Hard"],
        },
        tags: [
            { type: String, }
        ],

        // content fields
        statement: {
            type: String,
            required: [true, "Problem statement is required"],
        },
        inputFormat: {
            type: String,
        },
        outputFormat: {
            type: String,
        },
        constraints: {
            type: String,
        },
        sampleTestCases: [
            {
                input: String,
                output: String,
                explanation: String,
            }
        ],
        
        // hidden test cases for evaluation
        testCases: [
            {
                input: String,
                output: String,
            }
        ],

        // limits
        timeLimit: {
            type: Number,
            default: 1000, // Default time limit in milliseconds
        },
        memoryLimit: {
            type: Number,
            default: 256, // Default memory limit in MB
        },

        // editorial content
        editorial: {
            content: String,
            isPremium: {
                type: Boolean,
                default: false,
            },
            videoUrl: String,
        },

        // meta
        isPublished: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Creator reference is required"],
        },
        order: {
            type: Number,
            unique: true,
        },

        // stats
        totalSubmissions: {
            type: Number,
            default: 0,
        },
        totalAccepted: {
            type: Number,
            default: 0,
        },
        acceptanceRate: {
            type: Number,
            default: 0,
        },
        isPremium: {
            type: Boolean,
            default: false,
        },
        languagesAllowed: [
            {
                type: String,
                enum: ["cpp", "java", "python", "javascript"],
            }
        ],
    },
    { timestamps: true }
);


export const Problem = mongoose.model('Problem', ProblemSchema);