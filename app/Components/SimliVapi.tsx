"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import { SimliClient } from "simli-client";
import VideoBox from "./VideoBox";

interface SimliVapiProps {
  agentId: string;
  simli_faceid: string;
  onStart: () => void;
  onClose: () => void;
  showDottedFace: boolean;
  autoPlay?: boolean;
}

const SimliVapi: React.FC<SimliVapiProps> = ({
  agentId,
  simli_faceid,
  onStart,
  onClose,
  showDottedFace,
  autoPlay,
}) => {
  const vapi = React.useMemo(() => new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY as string), []);
  const simliClient = React.useMemo(() => new SimliClient(), []);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // ... 기존 SimliVapi 컴포넌트의 나머지 코드 ...

  return (
    <div>
      <VideoBox video={videoRef} audio={audioRef} />
      {/* 기타 필요한 UI 요소들 */}
    </div>
  );
};

export default SimliVapi;
