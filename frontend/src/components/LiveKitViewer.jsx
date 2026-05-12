import { useEffect, useState } from "react";
import axios from "axios";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useTracks,
  VideoTrack,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";

const API = "http://localhost:5000/api/livekit/token";

function ViewerStage() {
  const tracks = useTracks([Track.Source.Camera], {
    onlySubscribed: true,
  });

  if (!tracks.length) {
    return (
      <div
        style={{
          height: "100%",
          minHeight: 240,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111827",
          color: "#fff",
          textAlign: "center",
          padding: 20,
        }}
      >
        Waiting for the admin livestream...
      </div>
    );
  }

  return (
    <>
      <RoomAudioRenderer />
      <VideoTrack
        trackRef={tracks[0]}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          background: "#000",
        }}
      />
    </>
  );
}

export default function LiveKitViewer({ roomName, participantName = "Parishioner" }) {
  const [tokenData, setTokenData] = useState(null);

  useEffect(() => {
    if (!roomName) return;

    axios
      .post(API, {
        roomName,
        participantName,
        role: "viewer",
      })
      .then((res) => setTokenData(res.data))
      .catch((err) => console.error(err));
  }, [roomName, participantName]);

  if (!tokenData) {
    return <p>Connecting to livestream...</p>;
  }

  return (
    <LiveKitRoom
      token={tokenData.token}
      serverUrl={tokenData.url}
      connect={true}
      video={false}
      audio={false}
      style={{ height: "100%", width: "100%" }}
    >
      <ViewerStage />
    </LiveKitRoom>
  );
}