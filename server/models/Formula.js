import mongoose from "mongoose";

const formulaSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        expression: {
            type: String,
            required: true,
            trim: true,
        },

        variables: {
            type: [String],
            default: [],
        },

        description: {
            type: String,
            trim: true,
            default: "",
        },

        category: {
            type: String,
            trim: true,
            default: "General",
        },

        active: {
            type: Boolean,
            default: true,
        },

        version: {
            type: Number,
            required: true,
            default: 1,
            min: 1,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Formula = mongoose.model("Formula", formulaSchema);

export default Formula;