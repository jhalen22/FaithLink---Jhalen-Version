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

    // Free-text notes from the parishioner (kept for backward compatibility)
    message: {
      type: String
    },

    // Contact details submitted with the booking
    contactNumber: {
      type: String
    },

    address: {
      type: String
    },

    // General requirements text (e.g. documents needed, special requests)
    requirements: {
      type: String
    },

    // Filenames of documents uploaded at booking time (stored in /uploads)
    uploadedDocuments: [
      {
        type: String
      }
    ],

    // Flat key-value bag for any extra service-level details
    serviceDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    // Structured data that varies per sacrament type (e.g. childName for Baptism)
    sacramentSpecificData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
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
    },

    // Priest-side fields — set when a priest confirms they are available
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

    // Tracks whether a Mass Intention has been celebrated (Mass Intentions only).
    // Regular sacrament bookings leave this at the default and never use it.
    intentionStatus: {
      type: String,
      enum: ["scheduled", "done"],
      default: "scheduled",
    },
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Booking", bookingSchema);
