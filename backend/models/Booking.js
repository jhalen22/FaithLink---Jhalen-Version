const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    parishioner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    sacramentType: {
      type: String,
      required: true
    },

    preferredDate: {
      type: Date,
      required: true
    },

    preferredTime: {
      type: String,
      required: true
    },

    message: {
      type: String
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },

    assignedSchedule: {
      type: Date
    },

    adminRemarks: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Booking", bookingSchema);