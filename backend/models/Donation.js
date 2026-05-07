const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    parishioner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
    },
    referenceCode: {
      type: String,
      required: true,
    },
    receiptImage: {
      type: String,
    },
    message: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema);