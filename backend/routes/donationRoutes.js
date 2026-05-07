const express = require("express");
const multer = require("multer");
const Donation = require("../models/Donation");
const Notification = require("../models/Notification");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`);
  },
});

const upload = multer({ storage });

// CREATE DONATION - parishioner
router.post("/", protect, upload.single("receipt"), async (req, res) => {
  try {
    const { amount, purpose, method, referenceCode, message } = req.body;

    if (!amount || !purpose || !method || !referenceCode) {
      return res.status(400).json({
        message: "Amount, purpose, payment method, and reference code are required",
      });
    }

    const donation = await Donation.create({
      parishioner: req.user.id,
      amount,
      purpose,
      method,
      referenceCode,
      message,
      receiptImage: req.file ? req.file.filename : "",
      status: "pending",
    });

    res.status(201).json({
      message: "Donation submitted successfully. Waiting for admin verification.",
      donation,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to submit donation",
      error: error.message,
    });
  }
});

// GET MY DONATIONS - parishioner
router.get("/my-donations", protect, async (req, res) => {
  try {
    const donations = await Donation.find({
      parishioner: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch donations",
      error: error.message,
    });
  }
});

// GET ALL DONATIONS - admin
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate("parishioner", "fullName email role")
      .sort({ createdAt: -1 });

    res.json({
      message: "Donations retrieved successfully",
      donations,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch donations",
      error: error.message,
    });
  }
});

// VERIFY DONATION - admin only
router.put("/:id/verify", protect, adminOnly, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        message: "Donation not found",
      });
    }

    donation.status = "verified";
    await donation.save();

    await Notification.create({
      user: donation.parishioner,
      title: "Donation Verified",
      message: `Your ₱${donation.amount} donation has been verified. Thank you for your support.`,
      type: "donation",
    });

    res.status(200).json({
      message: "Donation verified successfully",
      donation,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to verify donation",
      error: error.message,
    });
  }
});

// REJECT DONATION - admin only
router.put("/:id/reject", protect, adminOnly, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        message: "Donation not found",
      });
    }

    donation.status = "rejected";
    await donation.save();

    await Notification.create({
      user: donation.parishioner,
      title: "Donation Rejected",
      message: `Your ₱${donation.amount} donation was rejected. Please check your receipt or reference code.`,
      type: "donation",
    });

    res.status(200).json({
      message: "Donation rejected successfully",
      donation,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reject donation",
      error: error.message,
    });
  }
});

module.exports = router;