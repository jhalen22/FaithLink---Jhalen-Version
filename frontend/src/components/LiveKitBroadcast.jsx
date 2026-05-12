import { useEffect, useState } from "react";
import axios from "axios";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";

const API = "http://localhost:5000/api/livekit/token";

export default function LiveKitBroadcast({ roomName, participantName = "Admin" }) {
  const [tokenData, setTokenData] = useState(null);

  useEffect(() => {
    if (!roomName) return;

    axios
      .post(API, {
        roomName,
        participantName,
        role: "host",
      })
      .then((res) => setTokenData(res.data))
      .catch((err) => console.error(err));
  }, [roomName, participantName]);

  if (!tokenData) {
    return <p style={{ color: "#fff" }}>Connecting to livestream room...</p>;
  }

  return (
    <LiveKitRoom
      token={tokenData.token}
      serverUrl={tokenData.url}
      connect={true}
      video={true}
      audio={true}
      style={{ height: "100%", width: "100%" }}
    >
      <VideoConference />
    </LiveKitRoom>
  );
}