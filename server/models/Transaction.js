import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    transactionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    journal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Journal",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Completed", "Reversed"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;