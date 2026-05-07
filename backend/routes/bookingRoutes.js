const express = require("express");
const Booking = require("../models/Booking")
const Notification = require("../models/Notification");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE BOOKING - parishioner/logged-in user
router.post("/", protect, async (req, res) => {
  try {
    const { sacramentType, preferredDate, preferredTime, message } = req.body;

    if (!sacramentType || !preferredDate || !preferredTime) {
      return res.status(400).json({
        message: "Sacrament type, preferred date, and preferred time are required"
      });
    }

    const booking = await Booking.create({
      parishioner: req.user.id,
      sacramentType,
      preferredDate,
      preferredTime,
      message
    });

    res.status(201).json({
      message: "Booking request submitted successfully",
      booking
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create booking",
      error: error.message
    });
  }
});

router.get("/my-bookings", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({
      parishioner: req.user.id,
    });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching bookings",
    });
  }
});

// GET ALL BOOKINGS - admin only
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;

    let filter = {};
    if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter).populate("parishioner");

    res.json({
      message: "Bookings retrieved successfully",
      bookings
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving bookings" });
  }
});

// APPROVE BOOKING
router.put("/:id/approve", protect, adminOnly, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    booking.status = "approved";
    await booking.save();

    await Notification.create({
      user: booking.parishioner,
      title: "Booking Approved",
      message: `Your ${booking.sacramentType} booking has been approved.`,
      type: "booking",
    });

    res.json({
      message: "Booking approved",
      booking,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error approving booking",
    });
  }
});


// REJECT BOOKING
router.put("/:id/reject", protect, adminOnly, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    booking.status = "rejected";
    await booking.save();

    await Notification.create({
      user: booking.parishioner,
      title: "Booking Rejected",
      message: `Your ${booking.sacramentType} booking has been rejected.`,
      type: "booking",
    });

    res.json({
      message: "Booking rejected",
      booking,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error rejecting booking",
    });
  }
});

// UPDATE BOOKING STATUS - admin only
router.put("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status, assignedSchedule, adminRemarks } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status is required"
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status,
        assignedSchedule,
        adminRemarks
      },
      { new: true }
    ).populate("parishioner", "fullName email role");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    res.status(200).json({
      message: "Booking status updated successfully",
      booking
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update booking status",
      error: error.message
    });
  }
});

// BOOKING DASHBOARD COUNTS - ADMIN ONLY
router.get("/dashboard/counts", protect, adminOnly, async (req, res) => {
  try {
    const total = await Booking.countDocuments();
    const pending = await Booking.countDocuments({ status: "pending" });
    const approved = await Booking.countDocuments({ status: "approved" });
    const rejected = await Booking.countDocuments({ status: "rejected" });

    res.status(200).json({
      message: "Booking dashboard counts retrieved successfully",
      counts: {
        total,
        pending,
        approved,
        rejected
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve dashboard counts",
      error: error.message
    });
  }
});

module.exports = router;