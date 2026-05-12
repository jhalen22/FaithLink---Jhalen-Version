const mongoose = require("mongoose");

const StreamSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    url: {
      type: String,
      default: "",
    },

    embedUrl: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["scheduled", "countdown", "live", "ended"],
      default: "scheduled",
    },

    scheduledStartTime: {
      type: Date,
    },

    countdownMinutes: {
      type: Number,
      default: 5,
    },

    countdownStartedAt: {
      type: Date,
      default: null,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    endedAt: {
      type: Date,
      default: null,
    },

    roomName: {
      type: String,
    },

    viewerCount: {
      type: Number,
      default: 0,
    },

    totalViews: {
      type: Number,
      default: 0,
    },

    peakViewerCount: {
  type: Number,
  default: 0,
},

replayViews: {
  type: Number,
  default: 0,
},

streamDurationSeconds: {
  type: Number,
  default: 0,
},

    viewers: [
      {
        type: String,
      },
    ],

   replayVideoUrl: {
  type: String,
  default: "",
},

replayThumbnailUrl: {
  type: String,
  default: "",
},

    replayOriginalName: {
      type: String,
      default: "",
    },

    isReplayPublished: {
      type: Boolean,
      default: false,
    },

    replayUploadedAt: {
      type: Date,
      default: null,
    },

    replayTitle: {
    type: String,
    default: "",
    },

    replayDescription: {
    type: String,
    default: "",
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("Stream", StreamSchema);