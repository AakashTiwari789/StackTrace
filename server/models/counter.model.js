import mongoose, { Schema } from "mongoose";

const CounterSchema = new Schema(
    {
        name: String,
        value: Number
    },
    { timestamps: true }
);

export const Counter = mongoose.model("Counter", CounterSchema);