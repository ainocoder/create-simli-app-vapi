import React, { use, useCallback, useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import { SimliClient } from "simli-client";
import VideoBox from "./Components/VideoBox";
import cn from "./utils/TailwindMergeAndClsx";
import IconSparkleLoader from "@/media/IconSparkleLoader";
import { send } from "process";

interface SimliVapiProps {
  simli_faceid: string;
  agentId: string; // ElevenLabs agent ID
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
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isAvatarVisible, setIsAvatarVisible] = useState(false);
  const [error, setError] = useState("");

  // Refs for media elements
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    vapi.on("message", (message) => {
      console.log("Vapi message:", message);
    });

    vapi.on("call-start", () => {
      console.log("Vapi call started");
      const dailyCall = vapi.getDailyCallObject();
      const participants = dailyCall?.participants();

      try {
        Object.values(participants).forEach((participant) => {
          const audioTrack = participant.tracks.audio.track;
          if (audioTrack) {
            // This is the audio output track for this participant
            console.log(
              `Audio track for ${participant.user_name}:`,
              audioTrack
            );
          }

          if(participant.user_name === "Vapi Speaker") {
            console.log("Vapi Speaker detected");
            simliClient.listenToMediastreamTrack(audioTrack as MediaStreamTrack);
          }
        });
      } catch (error: any) {
        console.error("Error getting audio track:", error);
      }

      setIsAvatarVisible(true);
    });

    vapi.on("call-end", () => {
      console.log("Vapi call ended");
      setIsAvatarVisible(false);
    });
  }, []);

  /**
   * Start Vapi interaction
   */
  const startVapiInteraction = async () => {
    try {
      await vapi.start(agentId);
      console.log("Vapi interaction started");
    } catch (error: any) {
      console.error("Error starting Vapi interaction:", error);
      setError(`Error starting Vapi interaction: ${error.message}`);
    }
  };

  /**
   * Initializes the Simli client with the provided configuration.
   */
  const initializeSimliClient = useCallback(() => {
    if (videoRef.current && audioRef.current) {
      const SimliConfig = {
        apiKey: process.env.NEXT_PUBLIC_SIMLI_API_KEY,
        faceID: simli_faceid,
        handleSilence: true,
        videoRef: videoRef,
        audioRef: audioRef,
      };

      simliClient.Initialize(SimliConfig as any);
      console.log("Simli Client initialized");
    }
  }, [simli_faceid]);

  /**
   * Handles the start of the interaction
   */
  const handleStart = useCallback(async () => {
    setIsLoading(true);
    setError("");
    onStart();

    try {
      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start Vapi interaction
      await startVapiInteraction();

      // Start Simli client
      await simliClient?.start();
    } catch (error: any) {
      console.error("Error starting interaction:", error);
      setError(`Error starting interaction: ${error.message}`);
      setIsLoading(false);
    }
  }, [agentId, onStart]);

  /**
   * Handles stopping the interaction
   */
  const handleStop = useCallback(() => {
    console.log("Stopping interaction...");
    setIsLoading(false);
    setError("");
    setIsAvatarVisible(false);

    // Clean up Simli client
    simliClient?.close();

    onClose();
    console.log("Interaction stopped");
  }, [onClose]);

  // Initialize Simli client on mount
  useEffect(() => {
    initializeSimliClient();

    if (simliClient) {
      simliClient?.on("connected", () => {
        console.log("SimliClient connected");
        const audioData = new Uint8Array(6000).fill(0);
        simliClient?.sendAudioData(audioData);
        console.log("Sent initial audio data");
      });

      simliClient?.on("disconnected", () => {
        console.log("SimliClient disconnected");
      });
    }
  }, [initializeSimliClient]);

  return (
    <>
      <div
        className={`transition-all duration-300 ${
          showDottedFace ? "h-0 overflow-hidden" : "h-auto"
        }`}
      >
        <VideoBox video={videoRef} audio={audioRef} />
      </div>
      <div className="flex flex-col items-center">
        {!isAvatarVisible ? (
          <button
            onClick={handleStart}
            disabled={isLoading}
            className={cn(
              "w-full h-[52px] mt-4 disabled:bg-[#343434] disabled:text-white disabled:hover:rounded-[100px] bg-simliblue text-white py-3 px-6 rounded-[100px] transition-all duration-300 hover:text-black hover:bg-white hover:rounded-sm",
              "flex justify-center items-center"
            )}
          >
            {isLoading ? (
              <IconSparkleLoader className="h-[20px] animate-loader" />
            ) : (
              <span className="font-abc-repro-mono font-bold w-[164px]">
                Test Interaction
              </span>
            )}
          </button>
        ) : (
          <>
            <div className="flex items-center gap-4 w-full">
              <button
                onClick={handleStop}
                className={cn(
                  "mt-4 group text-white flex-grow bg-red hover:rounded-sm hover:bg-white h-[52px] px-6 rounded-[100px] transition-all duration-300"
                )}
              >
                <span className="font-abc-repro-mono group-hover:text-black font-bold w-[164px] transition-all duration-300">
                  Stop Interaction
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default SimliVapi;
