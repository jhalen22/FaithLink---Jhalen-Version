const express = require("express");
const Stream = require("../models/Stream");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Converts common YouTube watch/short URLs to embed URLs.
// Returns the original string unchanged for non-YouTube or already-embed URLs.
function toEmbedUrl(url) {
  try {
    const u = new URL(url);
    // https://www.youtube.com/watch?v=VIDEO_ID
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }
    // https://youtu.be/VIDEO_ID
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    // https://www.youtube.com/live/VIDEO_ID
    if (u.hostname.includes("youtube.com") && u.pathname.startsWith("/live/")) {
      return `https://www.youtube.com/embed/${u.pathname.replace("/live/", "")}`;
    }
    return url;
  } catch {
    return url;
  }
}

// GET /api/streams — public, all streams newest first
router.get("/", async (req, res) => {
  try {
    const streams = await Stream.find().sort({ createdAt: -1 });
    res.json({ streams });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch streams", error: error.message });
  }
});

// GET /api/streams/active — public
// IMPORTANT: this route must be defined before /:id so Express matches "active"
// as a literal path segment, not an ObjectId.
router.get("/active", async (req, res) => {
  try {
    const stream = await Stream.findOne({ status: "active" }).sort({ createdAt: -1 });
    if (!stream) {
      return res.status(404).json({ message: "No active livestream at this time." });
    }
    res.json({ stream });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch active stream", error: error.message });
  }
});

// POST /api/streams — admin only
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { title, description, url, schedule, status } = req.body;

    if (!title || !url) {
      return res.status(400).json({ message: "Title and URL are required" });
    }

    // Only one stream may be active at a time
    if (status === "active") {
      await Stream.updateMany({ status: "active" }, { status: "inactive" });
    }

    const stream = await Stream.create({
      title,
      description,
      url,
      embedUrl: toEmbedUrl(url),
      schedule,
      status: status || "scheduled",
      createdBy: req.user.id,
    });

    res.status(201).json({ message: "Stream created successfully", stream });
  } catch (error) {
    res.status(500).json({ message: "Failed to create stream", error: error.message });
  }
});

// PUT /api/streams/:id — admin only, update stream details
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { title, description, url, schedule, status } = req.body;

    if (status === "active") {
      await Stream.updateMany(
        { status: "active", _id: { $ne: req.params.id } },
        { status: "inactive" }
      );
    }

    const updates = { title, description, schedule, status };
    if (url) {
      updates.url = url;
      updates.embedUrl = toEmbedUrl(url);
    }

    const stream = await Stream.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!stream) return res.status(404).json({ message: "Stream not found" });

    res.json({ message: "Stream updated", stream });
  } catch (error) {
    res.status(500).json({ message: "Failed to update stream", error: error.message });
  }
});

// PUT /api/streams/:id/status — admin only
// Setting a stream to "active" automatically sets all other active streams to "inactive".
router.put("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "Status is required" });

    if (status === "active") {
      await Stream.updateMany({ status: "active" }, { status: "inactive" });
    }

    const stream = await Stream.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!stream) return res.status(404).json({ message: "Stream not found" });

    res.json({ message: "Stream status updated", stream });
  } catch (error) {
    res.status(500).json({ message: "Failed to update stream status", error: error.message });
  }
});

// DELETE /api/streams/:id — admin only
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const stream = await Stream.findByIdAndDelete(req.params.id);
    if (!stream) return res.status(404).json({ message: "Stream not found" });
    res.json({ message: "Stream deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete stream", error: error.message });
  }
});

module.exports = router;
