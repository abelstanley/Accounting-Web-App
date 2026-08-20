import mongoose from "mongoose";

const journalLineSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
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
  },
  { _id: false }
);

const journalSchema = new mongoose.Schema(
  {
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

    lines: {
      type: [journalLineSchema],
      validate: {
        validator: function (value) {
          return value.length >= 2;
        },
        message: "A journal entry must have at least two lines.",
      },
    },

    status: {
      type: String,
      enum: ["Draft", "Posted"],
      default: "Draft",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isReversal: {
      type: Boolean,
      default: false,
    },

    reversedJournal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Journal",
      default: null,
    },
    reversedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Journal",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Journal = mongoose.model("Journal", journalSchema);

export default Journal; 