const mongoose = require("mongoose");

const documentReviewSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "lacking"],
      default: "pending",
    },

    remarks: {
      type: String,
      default: "",
    },

    reviewedAt: {
      type: Date,
    },
  },
  { _id: true }
);

const bookingSchema = new mongoose.Schema(
  {
    parishioner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sacramentType: {
      type: String,
      required: true,
    },

    preferredDate: {
      type: Date,
      required: true,
    },

    preferredTime: {
      type: String,
      required: true,
    },

    message: {
      type: String,
    },

    contactNumber: {
      type: String,
    },

    address: {
      type: String,
    },

    requirements: {
      type: String,
    },

    uploadedDocuments: [
      {
        type: String,
      },
    ],

    documentReviews: [documentReviewSchema],

    serviceDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    sacramentSpecificData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    status: {
      type: String,
      enum: ["pending", "approved", "scheduled", "completed", "rejected"],
      default: "pending",
    },

    assignedSchedule: {
      type: Date,
    },

    completedAt: {
      type: Date,
    },

    adminRemarks: {
      type: String,
    },

    assignedPriest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    priestConfirmationStatus: {
      type: String,
      enum: ["pending", "confirmed"],
      default: "pending",
    },

    priestConfirmedAt: {
      type: Date,
    },

    intentionStatus: {
      type: String,
      enum: ["scheduled", "done"],
      default: "scheduled",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Booking", bookingSchema);