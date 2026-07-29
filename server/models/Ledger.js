import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    journal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Journal",
      required: true,
    },

    transactionDate: {
      type: Date,
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    debit: {
      type: Number,
      default: 0,
      min: 0,
    },

    credit: {
      type: Number,
      default: 0,
      min: 0,
    },

    balance: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Ledger = mongoose.model("Ledger", ledgerSchema);

export default Ledger;