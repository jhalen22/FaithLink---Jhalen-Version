const express = require("express");
const Stream = require("../models/Stream");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

function toEmbedUrl(url) {
  try {
    const u = new URL(url);

    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }

    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }

    if (u.hostname.includes("youtube.com") && u.pathname.startsWith("/live/")) {
      return `https://www.youtube.com/embed/${u.pathname.replace("/live/", "")}`;
    }

    return url;
  } catch {
    return url;
  }
}

// GET /api/livestream — return the single stream (or null)
router.get("/", async (req, res) => {
  try {
    const stream = await Stream.findOne().sort({ createdAt: -1 });
    res.json({ stream: stream || null });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stream", error: error.message });
  }
});

// POST /api/livestream — create stream (admin only, one at a time)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { title, url, status } = req.body;

    if (!title || !url) {
      return res.status(400).json({ message: "Title and URL are required" });
    }

    const existing = await Stream.findOne();
    if (existing) {
      return res.status(400).json({ message: "A livestream already exists. Delete or update the existing one." });
    }

    const stream = await Stream.create({
      title,
      url,
      embedUrl: toEmbedUrl(url),
      status: status || "not-live",
      createdBy: req.user.id,
    });

    res.status(201).json({ message: "Stream created successfully", stream });
  } catch (error) {
    res.status(500).json({ message: "Failed to create stream", error: error.message });
  }
});

// PUT /api/livestream/:id — update stream (admin only)
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { title, url, status } = req.body;

    const updates = { title, status };

    if (url) {
      updates.url = url;
      updates.embedUrl = toEmbedUrl(url);
    }

    const stream = await Stream.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!stream) {
      return res.status(404).json({ message: "Stream not found" });
    }

    res.json({ message: "Stream updated", stream });
  } catch (error) {
    res.status(500).json({ message: "Failed to update stream", error: error.message });
  }
});

// DELETE /api/livestream/:id — delete stream (admin only)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const stream = await Stream.findByIdAndDelete(req.params.id);

    if (!stream) {
      return res.status(404).json({ message: "Stream not found" });
    }

    res.json({ message: "Stream deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete stream", error: error.message });
  }
});

module.exports = router;
