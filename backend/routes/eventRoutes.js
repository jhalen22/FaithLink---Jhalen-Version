const express = require("express");
const router = express.Router();

const Event = require("../models/Event");
const User = require("../models/User");
const Notification = require("../models/Notification");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

// CREATE EVENT - admin only
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      time,
      location,
      image,
      status,
    } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      time,
      location,
      image,
      status,
      createdBy: req.user.id,
    });

    const users = await User.find({
      role: { $in: ["parishioner", "priest"] },
    });

    const notifications = users.map((user) => ({
      user: user._id,
      title: "New Parish Event",
      message: `New parish event posted: ${event.title}`,
      type: "event",
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create event",
      error: error.message,
    });
  }
});

// GET ALL EVENTS
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch events",
      error: error.message,
    });
  }
});

// GET SINGLE EVENT
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch event",
      error: error.message,
    });
  }
});

// UPDATE EVENT - admin only
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    res.json({
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update event",
      error: error.message,
    });
  }
});

// DELETE EVENT - admin only
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);

    if (!deletedEvent) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    res.json({
      message: "Event deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete event",
      error: error.message,
    });
  }
});

module.exports = router;