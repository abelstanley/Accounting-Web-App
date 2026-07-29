import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      required: true,
      trim: true,
    },

    entity: {
      type: String,
      required: true,
      trim: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    details: {
      type: String,
      default: "",
      trim: true,
    },

    ipAddress: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog; 