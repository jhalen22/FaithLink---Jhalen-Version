const mongoose = require("mongoose");

const streamSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // Original watch URL as entered by admin (e.g. https://www.youtube.com/watch?v=...)
    url: {
      type: String,
      required: true,
    },
    // Auto-derived embed URL stored so the frontend never has to transform it
    embedUrl: {
      type: String,
    },
    schedule: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "scheduled", "inactive"],
      default: "scheduled",
    },
    viewers: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Stream", streamSchema);
