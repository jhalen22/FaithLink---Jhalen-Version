const express = require("express");
const Stream = require("../models/Stream");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const replayDir = path.join(__dirname, "../uploads/replays");

if (!fs.existsSync(replayDir)) {
  fs.mkdirSync(replayDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, replayDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
  if (
    file.mimetype.startsWith("video/") ||
    file.mimetype.startsWith("image/")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only video and image files are allowed."));
  }
},
});

function toEmbedUrl(url = "") {
  if (!url) return "";

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

function makeRoomName(title = "faithlink-live") {
  const safeTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 35);

  return `${safeTitle || "faithlink-live"}-${Date.now()}`;
}

// GET /api/livestream — return the latest stream
router.get("/", async (req, res) => {
  try {
    const stream = await Stream.findOne().sort({ createdAt: -1 });
    res.json({ stream: stream || null });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stream", error: error.message });
  }
});

// POST /api/livestream — create stream schedule/admin setup
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const {
      title,
      url = "",
      status = "scheduled",
      scheduledStartTime = null,
      countdownMinutes = 5,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Stream title is required" });
    }

    const existingActive = await Stream.findOne({
      status: { $in: ["scheduled", "countdown", "live", "not-live"] },
    });

    if (existingActive) {
      return res.status(400).json({
        message: "A stream already exists. End or delete the existing stream first.",
      });
    }

    const normalizedStatus = status === "not-live" ? "scheduled" : status;

    const stream = await Stream.create({
      title,
      url,
      embedUrl: toEmbedUrl(url),
      status: normalizedStatus,
      scheduledStartTime: scheduledStartTime || null,
      countdownMinutes: Number(countdownMinutes) || 5,
      roomName: makeRoomName(title),
      createdBy: req.user.id,
    });

    res.status(201).json({ message: "Stream created successfully", stream });
  } catch (error) {
    res.status(500).json({ message: "Failed to create stream", error: error.message });
  }
});

// PUT /api/livestream/:id — update stream details
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const {
      title,
      url,
      status,
      scheduledStartTime,
      countdownMinutes,
    } = req.body;

    const updates = {};

    if (title !== undefined) updates.title = title;
    if (status !== undefined) updates.status = status === "not-live" ? "scheduled" : status;
    if (scheduledStartTime !== undefined) updates.scheduledStartTime = scheduledStartTime || null;
    if (countdownMinutes !== undefined) updates.countdownMinutes = Number(countdownMinutes) || 5;

    if (url !== undefined) {
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

// PATCH /api/livestream/:id/countdown — start countdown before livestream
router.patch("/:id/countdown", protect, adminOnly, async (req, res) => {
  try {
    const { countdownMinutes = 5 } = req.body;

    const stream = await Stream.findByIdAndUpdate(
      req.params.id,
      {
        status: "countdown",
        countdownMinutes: Number(countdownMinutes) || 5,
        countdownStartedAt: new Date(),
        startedAt: null,
        endedAt: null,
      },
      { new: true }
    );

    if (!stream) {
      return res.status(404).json({ message: "Stream not found" });
    }

    res.json({ message: "Countdown started", stream });
  } catch (error) {
    res.status(500).json({ message: "Failed to start countdown", error: error.message });
  }
});

/// PATCH /api/livestream/:id/start — stream now
router.patch("/:id/start", protect, adminOnly, async (req, res) => {
  try {
    const stream = await Stream.findById(req.params.id);

    if (!stream) {
      return res.status(404).json({ message: "Stream not found" });
    }

    stream.status = "live";
    stream.viewerCount = 0;
    stream.startedAt = new Date();
    stream.endedAt = null;
    stream.roomName = stream.roomName || makeRoomName(stream.title);

    await stream.save();

    res.json({ message: "Stream is now live", stream });
  } catch (error) {
    res.status(500).json({
      message: "Failed to start stream",
      error: error.message,
    });
  }
});

// PATCH /api/livestream/:id/end — end livestream
router.patch("/:id/end", protect, adminOnly, async (req, res) => {
  try {
    const existingStream = await Stream.findById(req.params.id);

if (!existingStream) {
  return res.status(404).json({ message: "Stream not found" });
}

const endedAt = new Date();
let durationSeconds = 0;

if (existingStream.startedAt) {
  durationSeconds = Math.max(
    Math.floor((endedAt - new Date(existingStream.startedAt)) / 1000),
    0
  );
}

existingStream.status = "ended";
existingStream.endedAt = endedAt;
existingStream.viewerCount = 0;
existingStream.streamDurationSeconds = durationSeconds;

await existingStream.save();

const stream = existingStream;

    if (!stream) {
      return res.status(404).json({ message: "Stream not found" });
    }

    res.json({ message: "Stream ended", stream });
  } catch (error) {
    res.status(500).json({ message: "Failed to end stream", error: error.message });
  }
});

// DELETE /api/livestream/:id — delete stream
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

// INCREMENT VIEWER COUNT
router.put("/:id/view", async (req, res) => {
  try {
    const stream = await Stream.findById(req.params.id);

    if (!stream) {
      return res.status(404).json({
        success: false,
        message: "Stream not found",
      });
    }

    sstream.viewerCount += 1;
stream.totalViews += 1;

if (stream.viewerCount > (stream.peakViewerCount || 0)) {
  stream.peakViewerCount = stream.viewerCount;
}

    await stream.save();

    res.json({
      success: true,
      data: stream,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET livestream history
router.get("/history/all", async (req, res) => {
  try {
    const streams = await Stream.find({
      status: "ended",
    }).sort({ endedAt: -1, createdAt: -1 });

    res.json({ streams });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch livestream history",
      error: error.message,
    });
  }
});

// UPLOAD edited replay video
router.patch(
  "/:id/replay",
  protect,
  adminOnly,
  upload.single("video"),
  async (req, res) => {
    try {
      const stream = await Stream.findById(req.params.id);
      const { replayTitle, replayDescription } = req.body;

      if (!stream) {
        return res.status(404).json({ message: "Stream not found" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No video uploaded" });
      }

      stream.replayVideoUrl = `/uploads/replays/${req.file.filename}`;
      stream.replayOriginalName = req.file.originalname;
      stream.replayTitle = replayTitle || stream.title;
        stream.replayDescription = replayDescription || "";
      stream.isReplayPublished = true;
      stream.replayUploadedAt = new Date();
      

      await stream.save();

      res.json({
        message: "Replay video uploaded successfully",
        stream,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to upload replay video",
        error: error.message,
      });
    }
  }
);

// DOWNLOAD replay video
router.get("/:id/replay/download", protect, adminOnly, async (req, res) => {
  try {
    const stream = await Stream.findById(req.params.id);

    if (!stream || !stream.replayVideoUrl) {
      return res.status(404).json({ message: "Replay video not found" });
    }

    const filePath = path.join(__dirname, "..", stream.replayVideoUrl);

    res.download(filePath, stream.replayOriginalName || "livestream-replay.mp4");
  } catch (error) {
    res.status(500).json({
      message: "Failed to download replay video",
      error: error.message,
    });
  }
});

router.get("/replays", async (req, res) => {
  try {
    const replays = await Stream.find({
      replayVideoUrl: { $ne: "" },
      isReplayPublished: true,
    }).sort({ replayUploadedAt: -1 });

    res.json(replays);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch replays",
    });
  }
});

router.post(
  "/replay/upload",
  protect,
  adminOnly,
  upload.single("video"),
  async (req, res) => {
    try {
      const { replayTitle, replayDescription } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "No video uploaded" });
      }

      const stream = await Stream.create({
        title: replayTitle || "Uploaded Replay",
        status: "ended",
        scheduledStartTime: new Date(),
        endedAt: new Date(),
        countdownMinutes: 0,
        roomName: makeRoomName(replayTitle || "uploaded-replay"),
        replayVideoUrl: `/uploads/replays/${req.file.filename}`,
        replayOriginalName: req.file.originalname,
        replayTitle: replayTitle || "Uploaded Replay",
        replayDescription: replayDescription || "",
        isReplayPublished: true,
        replayUploadedAt: new Date(),
        createdBy: req.user.id,
      });

      res.status(201).json({
        message: "Replay uploaded successfully",
        stream,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to upload replay",
        error: error.message,
      });
    }
  }
);

router.put(
  "/replay/:id",
  protect,
  adminOnly,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const stream = await Stream.findById(req.params.id);

      if (!stream) {
        return res.status(404).json({
          message: "Replay not found",
        });
      }

      // OPTIONAL VIDEO UPDATE
      if (
        req.files &&
        req.files.video &&
        req.files.video.length > 0
      ) {
        stream.replayVideoUrl =
          `/uploads/replays/${req.files.video[0].filename}`;

        stream.replayOriginalName =
          req.files.video[0].originalname;
      }

      // OPTIONAL THUMBNAIL UPDATE
      if (
        req.files &&
        req.files.thumbnail &&
        req.files.thumbnail.length > 0
      ) {
        stream.replayThumbnailUrl =
  `/uploads/replays/${req.files.thumbnail[0].filename}`;
      }

      await stream.save();

      res.json({
        message: "Replay updated successfully",
        stream,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to update replay",
        error: error.message,
      });
    }
  }
);

// DELETE replay from a stream
router.delete("/:id/replay", protect, adminOnly, async (req, res) => {
  try {
    const stream = await Stream.findById(req.params.id);

    if (!stream) {
      return res.status(404).json({ message: "Stream not found" });
    }

    stream.replayVideoUrl = "";
    stream.replayOriginalName = "";
    stream.replayThumbnailUrl = "";
    stream.replayTitle = "";
    stream.replayDescription = "";
    stream.isReplayPublished = false;
    stream.replayUploadedAt = null;
    stream.replayViews = 0;

    await stream.save();

    res.json({
      message: "Replay deleted successfully",
      stream,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete replay",
      error: error.message,
    });
  }
});

// INCREMENT REPLAY VIEWS
router.put("/:id/replay/view", async (req, res) => {
  try {
    const stream = await Stream.findById(req.params.id);

    if (!stream) {
      return res.status(404).json({
        success: false,
        message: "Stream not found",
      });
    }

    stream.replayViews = (stream.replayViews || 0) + 1;
    await stream.save();

    res.json({
      success: true,
      replayViews: stream.replayViews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
