const express = require("express");
const fs = require("fs");
const multer = require("multer");
const Booking = require("../models/Booking");
const Notification = require("../models/Notification");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Ensure the uploads directory exists before multer tries to write to it
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`);
  },
});
const upload = multer({ storage });

// Wraps upload.array so that multer errors return JSON instead of being passed
// to Express's default error handler (which would silently bypass the route handler).
function runUpload(req, res, next) {
  upload.array("documents", 10)(req, res, (err) => {
    if (err) {
      console.error("[POST /api/bookings] Multer error:", err);
      return res.status(400).json({ message: "File upload failed", error: err.message });
    }
    next();
  });
}

// CREATE BOOKING - parishioner/logged-in user
router.post("/", protect, runUpload, async (req, res) => {
  console.log("[POST /api/bookings] Route reached");
  console.log("[POST /api/bookings] req.body:", req.body);
  console.log("[POST /api/bookings] req.files:", req.files);

  try {
    const {
      sacramentType,
      preferredDate,
      preferredTime,
      message,
      contactNumber,
      address,
      requirements,
      serviceDetails,
      sacramentSpecificData,
    } = req.body;

    if (!sacramentType || !preferredDate || !preferredTime) {
      return res.status(400).json({
        message: "Sacrament type, preferred date, and preferred time are required",
      });
    }

    // Filenames of any uploaded documents
    const uploadedDocuments = req.files ? req.files.map((f) => f.filename) : [];

    // Both object fields arrive as JSON strings when sent via FormData
    let parsedServiceDetails = {};
    let parsedSacramentSpecificData = {};

    if (serviceDetails) {
      try {
        parsedServiceDetails =
          typeof serviceDetails === "string" ? JSON.parse(serviceDetails) : serviceDetails;
      } catch (parseErr) {
        console.warn("[POST /api/bookings] Could not parse serviceDetails:", parseErr.message);
      }
    }

    if (sacramentSpecificData) {
      try {
        parsedSacramentSpecificData =
          typeof sacramentSpecificData === "string"
            ? JSON.parse(sacramentSpecificData)
            : sacramentSpecificData;
      } catch (parseErr) {
        console.warn("[POST /api/bookings] Could not parse sacramentSpecificData:", parseErr.message);
      }
    }

    const booking = await Booking.create({
      parishioner: req.user.id,
      sacramentType,
      preferredDate,
      preferredTime,
      message,
      contactNumber,
      address,
      requirements,
      uploadedDocuments,
      serviceDetails: parsedServiceDetails,
      sacramentSpecificData: parsedSacramentSpecificData,
    });

    console.log("[POST /api/bookings] Booking created:", booking._id);

    res.status(201).json({
      message: "Booking request submitted successfully",
      booking,
    });
  } catch (error) {
    console.error("[POST /api/bookings] Booking creation error:", error);
    res.status(500).json({
      message: "Failed to create booking",
      error: error.message,
    });
  }
});

// GET USER'S OWN BOOKINGS
router.get("/my-bookings", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ parishioner: req.user.id });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
});

// GET ALL BOOKINGS - admin only
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const bookings = await Booking.find(filter).populate(
      "parishioner",
      "fullName email role"
    );

    res.json({ message: "Bookings retrieved successfully", bookings });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving bookings" });
  }
});

// APPROVE BOOKING
router.put("/:id/approve", protect, adminOnly, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = "approved";
    await booking.save();

    await Notification.create({
      user: booking.parishioner,
      title: "Booking Approved",
      message: `Your ${booking.sacramentType} booking has been approved.`,
      type: "booking",
    });

    res.json({ message: "Booking approved", booking });
  } catch (error) {
    res.status(500).json({ message: "Error approving booking" });
  }
});

// REJECT BOOKING
router.put("/:id/reject", protect, adminOnly, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = "rejected";
    await booking.save();

    await Notification.create({
      user: booking.parishioner,
      title: "Booking Rejected",
      message: `Your ${booking.sacramentType} booking has been rejected.`,
      type: "booking",
    });

    res.json({ message: "Booking rejected", booking });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting booking" });
  }
});

// UPDATE BOOKING STATUS - admin only (also sets assignedSchedule and adminRemarks)
router.put("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status, assignedSchedule, adminRemarks } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, assignedSchedule, adminRemarks },
      { new: true }
    ).populate("parishioner", "fullName email role");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ message: "Booking status updated successfully", booking });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update booking status",
      error: error.message,
    });
  }
});

// BOOKING DASHBOARD COUNTS - admin only
router.get("/dashboard/counts", protect, adminOnly, async (req, res) => {
  try {
    const total = await Booking.countDocuments();
    const pending = await Booking.countDocuments({ status: "pending" });
    const approved = await Booking.countDocuments({ status: "approved" });
    const rejected = await Booking.countDocuments({ status: "rejected" });

    res.status(200).json({
      message: "Booking dashboard counts retrieved successfully",
      counts: { total, pending, approved, rejected },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve dashboard counts",
      error: error.message,
    });
  }
});

// GET /api/bookings/priest/approved — priest only
// Returns all approved bookings so the priest can review and confirm availability.
// Uses an inline role check instead of a separate priestOnly middleware.
router.get("/priest/approved", protect, async (req, res) => {
  try {
    if (req.user.role !== "priest") {
      return res.status(403).json({ message: "Access denied. Priests only." });
    }

    const bookings = await Booking.find({ status: "approved" })
      .populate("parishioner", "fullName email")
      .sort({ preferredDate: 1 });

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch approved bookings",
      error: error.message,
    });
  }
});

// PUT /api/bookings/:id/priest-confirm — priest only
// Records that the priest has confirmed availability for this booking.
router.put("/:id/priest-confirm", protect, async (req, res) => {
  try {
    if (req.user.role !== "priest") {
      return res.status(403).json({ message: "Access denied. Priests only." });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.assignedPriest = req.user.id;
    booking.priestConfirmationStatus = "confirmed";
    booking.priestConfirmedAt = new Date();
    await booking.save();

    res.json({ message: "Availability confirmed successfully", booking });
  } catch (error) {
    res.status(500).json({
      message: "Failed to confirm availability",
      error: error.message,
    });
  }
});

module.exports = router;
