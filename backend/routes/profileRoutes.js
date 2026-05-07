const express = require("express");
const Booking = require("../models/Booking");
const Donation = require("../models/Donation");
const Event = require("../models/Event");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/stats", protect, async (req, res) => {
  try {
    const bookingCount = await Booking.countDocuments({
      parishioner: req.user.id,
    });

    const verifiedDonations = await Donation.find({
      parishioner: req.user.id,
      status: "verified",
    });

    const donationTotal = verifiedDonations.reduce(
      (sum, donation) => sum + donation.amount,
      0
    );

    const eventCount = await Event.countDocuments();

    res.status(200).json({
      bookings: bookingCount,
      donations: donationTotal,
      events: eventCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch profile stats",
      error: error.message,
    });
  }
});

module.exports = router;