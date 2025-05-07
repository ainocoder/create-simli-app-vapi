import React, { use, useCallback, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import { SimliClient } from "simli-client";
import VideoBox from "./Components/VideoBox";

interface SimliVapiProps {
  simli_faceid: string;
  agentId: string;
  onStart: () => void;
  onClose: () => void;
  showDottedFace: boolean;
}

const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY as string);
const simliClient = new SimliClient();

const SimliVapi: React.FC<SimliVapiProps> = ({
  simli_faceid,
  agentId,
  onStart,
  onClose,
  showDottedFace,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleStart = useCallback(async () => {
    setIsLoading(true);
    onStart();
    try {
      if (videoRef.current && audioRef.current) {
        simliClient.Initialize({
          apiKey: process.env.NEXT_PUBLIC_SIMLI_API_KEY,
          faceID: simli_faceid,
          handleSilence: false,
          videoRef: videoRef,
          audioRef: audioRef,
        } as any);
      }
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await simliClient?.start();
    } catch (error: any) {
      setIsLoading(false);
    }
  }, [agentId, onStart, simli_faceid]);

  return (
    <div className="flex flex-col items-center justify-center">
      <VideoBox video={videoRef} audio={audioRef} />
      <button
        onClick={handleStart}
        disabled={isLoading}
        className="w-full h-[52px] mt-4 bg-simliblue text-white py-3 px-6 rounded-[100px] flex justify-center items-center"
      >
        Test Interaction
      </button>
    </div>
  );
};

export default SimliVapi;
