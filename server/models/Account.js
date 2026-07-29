import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    accountCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    accountName: {
      type: String,
      required: true,
      trim: true,
    },

    accountType: {
      type: String,
      required: true,
      enum: [
        "Asset",
        "Liability",
        "Equity",
        "Revenue",
        "Expense",
      ],
    },

    description: {
      type: String,
      default: "No description provided",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Account = mongoose.model("Account", accountSchema);

export default Account;