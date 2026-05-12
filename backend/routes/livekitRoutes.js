const express = require("express");
const { AccessToken } = require("livekit-server-sdk");

const router = express.Router();

router.post("/token", async (req, res) => {
  try {
    const { roomName, participantName, role = "viewer" } = req.body;

    if (!roomName || !participantName) {
      return res.status(400).json({
        message: "Room name and participant name are required",
      });
    }

    const canPublish = role === "host";

    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: participantName,
      }
    );

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    res.json({
      token,
      url: process.env.LIVEKIT_URL,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create LiveKit token",
    });
  }
});

module.exports = router;