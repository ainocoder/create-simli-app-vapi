import React, { use, useCallback, useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import { SimliClient } from "simli-client";
import VideoBox from "./Components/VideoBox";

interface SimliVapiProps {
  simli_faceid: string;
  agentId: string; // ElevenLabs agent ID
  vapiKey: string;
  simliKey: string;
  onStart: () => void;
  onClose: () => void;
  showDottedFace: boolean;
  autoPlay?: boolean;
}

const SimliVapi: React.FC<SimliVapiProps> = ({
  simli_faceid,
  agentId,
  vapiKey,
  simliKey,
  onStart,
  onClose,
  showDottedFace,
  autoPlay,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAvatarVisible, setIsAvatarVisible] = useState(false);
  const [error, setError] = useState("");
  const doRunOnce = useRef(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const vapi = React.useMemo(() => new Vapi(vapiKey), [vapiKey]);
  const simliClient = React.useMemo(() => new SimliClient(), []);

  const handleStart = useCallback(async () => {
    setIsLoading(true);
    setError("");
    onStart();
    try {
      initializeSimliClient();
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await simliClient?.start();
      eventListenerSimli();
    } catch (error: any) {
      setError(`Error starting interaction: ${error.message}`);
      setIsLoading(false);
    }
  }, [agentId, onStart, simliKey, simli_faceid, simliClient]);

  const handleStop = useCallback(() => {
    setIsLoading(false);
    setError("");
    setIsAvatarVisible(false);
    simliClient?.close();
    onClose();
  }, [onClose, simliClient]);

  const initializeSimliClient = useCallback(() => {
    if (videoRef.current && audioRef.current) {
      const SimliConfig = {
        apiKey: simliKey,
        faceID: simli_faceid,
        handleSilence: false,
        videoRef: videoRef,
        audioRef: audioRef,
      };
      simliClient.Initialize(SimliConfig as any);
    }
  }, [simli_faceid, simliKey, simliClient]);

  const startVapiInteraction = async () => {
    try {
      await vapi.start(agentId);
      eventListenerVapi();
    } catch (error: any) {
      setError(`Error starting Vapi interaction: ${error.message}`);
    }
  };

  const muteVapiInternalAudio = () => {
    const audioElements = document.getElementsByTagName("audio");
    for (let i = 0; i < audioElements.length; i++) {
      if (audioElements[i].id !== "simli_audio") {
        audioElements[i].muted = true;
      }
    }
  };

  const getAudioElementAndSendToSimli = () => {
    if (simliClient) {
      muteVapiInternalAudio();
      try {
        const dailyCall = vapi.getDailyCallObject();
        const participants = dailyCall?.participants();
        if (participants) {
          Object.values(participants).forEach((participant: any) => {
            const audioTrack = participant.tracks.audio.track;
            if (participant.user_name === "Vapi Speaker") {
              simliClient.listenToMediastreamTrack(audioTrack as MediaStreamTrack);
            }
          });
        }
      } catch (error: any) {}
    } else {
      setTimeout(getAudioElementAndSendToSimli, 10);
    }
  };

  const eventListenerVapi = useCallback(() => {
    vapi.on("message", (message: any) => {
      if (
        message.type === "speech-update" &&
        message.status === "started" &&
        message.role === "user"
      ) {
        simliClient.ClearBuffer();
      }
    });
    vapi.on("call-start", () => {
      setIsAvatarVisible(true);
      getAudioElementAndSendToSimli();
    });
    vapi.on("call-end", () => {
      setIsAvatarVisible(false);
    });
  }, [vapi, simliClient]);

  const eventListenerSimli = useCallback(() => {
    if (simliClient) {
      simliClient?.on("connected", () => {
        const audioData = new Uint8Array(6000).fill(0);
        simliClient?.sendAudioData(audioData);
        startVapiInteraction();
      });
      simliClient?.on("disconnected", () => {
        vapi.stop();
      });
    }
  }, [simliClient, vapi]);

  useEffect(() => {
    if (autoPlay) {
      handleStart();
    }
  }, [autoPlay]);

  // 프레임만 가득 차게, 하단 중앙에 종료 버튼만
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div style={{ width: "100%", height: "100%" }}>
        <VideoBox video={videoRef} audio={audioRef} />
      </div>
      <button
        onClick={handleStop}
        style={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "#FF3B30",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          cursor: "pointer",
        }}
        aria-label="End Conversation"
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="15" width="16" height="2" rx="1" fill="white" />
        </svg>
      </button>
    </div>
  );
};

export default SimliVapi;
