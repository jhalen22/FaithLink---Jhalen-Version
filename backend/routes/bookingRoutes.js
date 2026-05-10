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

    // Mass Intention schedule validation — enforced server-side so it cannot be
    // bypassed by manipulating the frontend.
    if (sacramentType === "Mass Intentions") {
      const WEEKDAY_TIMES = ["06:00", "18:00"];
      const SUNDAY_TIMES  = ["06:00", "08:00", "09:30", "16:30", "18:00"];

      // Parse the date as local midnight so the day-of-week is always correct
      // regardless of the server's UTC offset.
      const [yr, mo, dy] = preferredDate.split("T")[0].split("-").map(Number);
      const submittedDate = new Date(yr, mo - 1, dy);

      // Reject past dates.
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (submittedDate < today) {
        return res.status(400).json({
          message: "The preferred date for a Mass Intention cannot be in the past.",
        });
      }

      const dayOfWeek = submittedDate.getDay(); // 0 = Sunday
      const allowedTimes = dayOfWeek === 0 ? SUNDAY_TIMES : WEEKDAY_TIMES;

      if (!allowedTimes.includes(preferredTime)) {
        return res.status(400).json({
          message: `Invalid preferred time for Mass Intention. ${
            dayOfWeek === 0 ? "Sunday" : "Weekday/Saturday"
          } masses are held at: ${allowedTimes.map((t) => {
            const [h, m] = t.split(":");
            const hr = parseInt(h, 10);
            return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
          }).join(", ")}.`,
        });
      }
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
      // Mass Intentions are automatically approved — no admin review needed.
      status: sacramentType === "Mass Intentions" ? "approved" : "pending",
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

// PATCH /api/bookings/mass-intentions/mark-done-group — admin only
// Marks every Mass Intention for a given date+time as done and notifies parishioners.
// Must be defined before the parameterised /:id route so Express does not treat
// "mass-intentions" as a booking ID.
router.patch("/mass-intentions/mark-done-group", protect, adminOnly, async (req, res) => {
  try {
    const { preferredDate, preferredTime } = req.body;

    if (!preferredDate || !preferredTime) {
      return res.status(400).json({ message: "preferredDate and preferredTime are required" });
    }

    // Build a UTC day window so the date query is timezone-safe
    const start = new Date(preferredDate);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(preferredDate);
    end.setUTCHours(23, 59, 59, 999);

    // Fetch only intentions not yet done so we know whom to notify
    const affected = await Booking.find({
      sacramentType: "Mass Intentions",
      preferredDate: { $gte: start, $lte: end },
      preferredTime,
      intentionStatus: { $ne: "done" },
    }).populate("parishioner", "_id fullName email");

    if (affected.length === 0) {
      return res.json({ message: "No pending intentions to update", count: 0 });
    }

    // Mark all intentions in this slot as done (including any already-done ones so count is consistent)
    await Booking.updateMany(
      {
        sacramentType: "Mass Intentions",
        preferredDate: { $gte: start, $lte: end },
        preferredTime,
      },
      { intentionStatus: "done" }
    );

    // Build human-readable date/time strings for the notification message
    const dateDisplay = start.toLocaleDateString("en-PH", {
      month: "long", day: "numeric", year: "numeric",
    });
    const [h, m] = preferredTime.split(":");
    const hr = parseInt(h, 10);
    const timeDisplay = `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;

    // Create one notification per affected parishioner, linking back to the booking
    // so the parishioner history page can match the badge to the exact card.
    await Promise.all(
      affected.map((b) => {
        const intentionFor = b.sacramentSpecificData?.intentionFor || "your intention";
        return Notification.create({
          user: b.parishioner._id,
          title: "Mass Intention Completed",
          message: `Your Mass Intention for ${intentionFor} on ${dateDisplay} at ${timeDisplay} has been completed. Thank you for your prayer.`,
          type: "mass-intention",
          relatedBooking: b._id,
        });
      })
    );

    res.json({ message: "Mass intentions marked as done", count: affected.length });
  } catch (error) {
    console.error("[PATCH /mass-intentions/mark-done-group] Error:", error);
    res.status(500).json({ message: "Failed to mark intentions as done", error: error.message });
  }
});

// PATCH /api/bookings/:id/mark-done — admin only
// Marks a single Mass Intention as done and notifies the parishioner.
router.patch("/:id/mark-done", protect, adminOnly, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("parishioner", "_id fullName email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.sacramentType !== "Mass Intentions") {
      return res.status(400).json({ message: "This route is only for Mass Intentions" });
    }

    booking.intentionStatus = "done";
    await booking.save();

    const dateDisplay = new Date(booking.preferredDate).toLocaleDateString("en-PH", {
      month: "long", day: "numeric", year: "numeric",
    });
    const [h, m] = booking.preferredTime.split(":");
    const hr = parseInt(h, 10);
    const timeDisplay = `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
    const intentionFor = booking.sacramentSpecificData?.intentionFor || "your intention";

    await Notification.create({
      user: booking.parishioner._id,
      title: "Mass Intention Completed",
      message: `Your Mass Intention for ${intentionFor} on ${dateDisplay} at ${timeDisplay} has been completed. Thank you for your prayer.`,
      type: "mass-intention",
      relatedBooking: booking._id,
    });

    res.json({ message: "Intention marked as done", booking });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark intention as done", error: error.message });
  }
});

module.exports = router;
