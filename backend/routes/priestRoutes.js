const express = require("express");
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/priests
// Admin gets all priest accounts for Assign Priest dropdown
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const priests = await User.find({ role: "priest" })
      .select("_id fullName email role")
      .sort({ fullName: 1 });

    res.json({ priests });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch priests",
      error: error.message,
    });
  }
});

module.exports = router;