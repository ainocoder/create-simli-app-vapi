import React, { use, useCallback, useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import { SimliClient } from "simli-client";
import VideoBox from "./Components/VideoBox";
import cn from "./utils/TailwindMergeAndClsx";
import IconSparkleLoader from "@/media/IconSparkleLoader";

interface SimliVapiProps {
  simli_faceid: string;
  agentId: string; // ElevenLabs agent ID
  onStart: () => void;
  onClose: () => void;
  showDottedFace: boolean;
  autoPlay?: boolean;
}

const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY as string);
const simliClient = new SimliClient();

const SimliVapi: React.FC<SimliVapiProps> = ({
  simli_faceid,
  agentId,
  onStart,
  onClose,
  showDottedFace,
  autoPlay,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAvatarVisible, setIsAvatarVisible] = useState(false);
  const [error, setError] = useState("");
  const [isEnded, setIsEnded] = useState(false);
  const doRunOnce = useRef(false);
  const autoEndTimer = useRef<NodeJS.Timeout | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleStopRef = useRef<() => void>(() => {});

  const handleStop = useCallback(() => {
    console.log("handleStop 호출됨");
    setIsLoading(false);
    setError("");
    setIsAvatarVisible(false);
    simliClient?.close();
    onClose();
    setIsEnded(true);
    if (autoEndTimer.current) {
      clearTimeout(autoEndTimer.current);
      autoEndTimer.current = null;
    }
  }, [onClose]);

  useEffect(() => {
    handleStopRef.current = handleStop;
  }, [handleStop]);

  const initializeSimliClient = useCallback(() => {
    if (videoRef.current && audioRef.current) {
      const SimliConfig = {
        apiKey: process.env.NEXT_PUBLIC_SIMLI_API_KEY,
        faceID: simli_faceid,
        handleSilence: false,
        videoRef: videoRef,
        audioRef: audioRef,
      };
      simliClient.Initialize(SimliConfig as any);
    }
  }, [simli_faceid]);

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
  }, []);

  const handleStart = useCallback(async () => {
    setIsLoading(true);
    setError("");
    onStart();
    if (autoEndTimer.current) clearTimeout(autoEndTimer.current);
    console.log("타이머 시작: 1분 뒤 자동 종료 예정");
    autoEndTimer.current = setTimeout(() => {
      console.log("타이머 만료: 자동 종료 실행");
      handleStopRef.current();
    }, 70000);
    try {
      initializeSimliClient();
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await simliClient?.start();
      eventListenerSimli();
    } catch (error: any) {
      setError(`Error starting interaction: ${error.message}`);
      setIsLoading(false);
    }
  }, [agentId, onStart, initializeSimliClient, eventListenerSimli]);

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
            if (audioTrack) {
              // This is the audio output track for this participant
              console.log(`Audio track for ${participant.user_name}:`, audioTrack);
            }
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
  }, []);

  useEffect(() => {
    if (autoPlay && !doRunOnce.current) {
      doRunOnce.current = true;
      handleStart();
    }
  }, [autoPlay, handleStart]);

  console.log('SimliVapi agentId:', agentId);

  return (
    <>
      {/* 로딩중 메시지: 아바타가 나타나기 전까지 상단 중앙에 표시 */}
      {!isAvatarVisible && !isEnded && (
        <div className="absolute top-8 left-0 right-0 flex justify-center z-20">
          <span className="text-white text-xl font-bold bg-black bg-opacity-70 px-6 py-2 rounded-lg shadow-lg">로딩중...</span>
        </div>
      )}
      <div
        className={`transition-all duration-300 ${
          showDottedFace ? "h-0 overflow-hidden" : "h-auto"
        }`}
      >
        <VideoBox video={videoRef} audio={audioRef} />
      </div>
      <div className="flex flex-col items-center">
        {isEnded ? (
          <div className="w-full h-[52px] mt-4 flex justify-center items-center">
            <span className="font-abc-repro-mono font-bold w-[164px] text-white text-center">
              체험이 종료되었어요^^
            </span>
          </div>
        ) : !isAvatarVisible && !autoPlay ? (
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
          <div className="flex items-center gap-4 w-full">
            <button
              onClick={handleStop}
              className={cn(
                "mt-4 group text-white flex-grow bg-red hover:rounded-sm hover:bg-white h-[52px] px-6 rounded-[100px] transition-all duration-300"
              )}
            >
              <span className="font-abc-repro-mono group-hover:text-black font-bold w-[164px] transition-all duration-300">
                종료하기
              </span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default SimliVapi;
