const mongoose = require("mongoose");

const streamSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true },
    embedUrl: { type: String },
    status: {
      type: String,
      enum: ["live", "not-live"],
      default: "not-live",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Stream", streamSchema);
