const express = require("express");
const Stream = require("../models/Stream");
const User = require("../models/User");
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

router.get("/", async (req, res) => {
  try {
    const streams = await Stream.find().sort({ createdAt: -1 });
    res.json({ streams });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch streams", error: error.message });
  }
});

router.get("/active", async (req, res) => {
  try {
    const stream = await Stream.findOne({ status: "active" }).sort({
      createdAt: -1,
    });

    if (!stream) {
      return res.status(404).json({ message: "No active livestream at this time." });
    }

    res.json({ stream });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch active stream", error: error.message });
  }
});

router.put("/:id/view", async (req, res) => {
  try {
    const stream = await Stream.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewers: 1 } },
      { new: true }
    );

    if (!stream) {
      return res.status(404).json({ message: "Stream not found" });
    }

    res.json({
      viewers: stream.viewers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update viewer count",
      error: error.message,
    });
  }
});

router.put("/:id/like", protect, async (req, res) => {
  try {
    const stream = await Stream.findById(req.params.id);

    if (!stream) {
      return res.status(404).json({ message: "Stream not found" });
    }

    const userId = req.user.id;

    const alreadyLiked = stream.likedBy.some(
      (id) => id.toString() === userId
    );

    if (alreadyLiked) {
      stream.likedBy = stream.likedBy.filter(
        (id) => id.toString() !== userId
      );
    } else {
      stream.likedBy.push(userId);
    }

    await stream.save();

    res.json({
      liked: !alreadyLiked,
      likeCount: stream.likedBy.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update like", error: error.message });
  }
});

router.post("/:id/comments", protect, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment is required" });
    }

    const stream = await Stream.findById(req.params.id);

    if (!stream) {
      return res.status(404).json({ message: "Stream not found" });
    }

    const user = await User.findById(req.user.id).select("fullName");

    stream.comments.push({
      user: req.user.id,
      name: user?.fullName || "Parishioner",
      text,
    });

    await stream.save();

    res.status(201).json({
      comments: stream.comments,
      commentCount: stream.comments.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to add comment", error: error.message });
  }
});

router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { title, description, url, schedule, status } = req.body;

    if (!title || !url) {
      return res.status(400).json({ message: "Title and URL are required" });
    }

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

    const stream = await Stream.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    if (!stream) {
      return res.status(404).json({ message: "Stream not found" });
    }

    res.json({ message: "Stream updated", stream });
  } catch (error) {
    res.status(500).json({ message: "Failed to update stream", error: error.message });
  }
});

router.put("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    if (status === "active") {
      await Stream.updateMany({ status: "active" }, { status: "inactive" });
    }

    const stream = await Stream.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!stream) {
      return res.status(404).json({ message: "Stream not found" });
    }

    res.json({ message: "Stream status updated", stream });
  } catch (error) {
    res.status(500).json({ message: "Failed to update stream status", error: error.message });
  }
});

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