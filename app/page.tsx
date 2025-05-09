"use client";
import React, { useEffect, useState } from "react";
import SimliVapi from "@/app/SimliVapi";
import DottedFace from "./Components/DottedFace";

interface avatarSettings {
  vapi_agentid: string;
  simli_faceid: string;
}

// Customize your avatar here
const avatar: avatarSettings = {
  vapi_agentid: "56b4bde4-a558-4d4e-a120-1cbbbc47e1ed",
  simli_faceid: "f7dd4055-033a-4e8d-96e9-867670aed039",
};

const getInitialParam = (key: string, fallback: string) => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    return params.get(key) || fallback;
  }
  return fallback;
};

const Demo: React.FC = () => {
  const [showDottedFace, setShowDottedFace] = useState(true);
  const [agentId, setAgentId] = useState(avatar.vapi_agentid);
  const [simliFaceId, setSimliFaceId] = useState(avatar.simli_faceid);
  const [autoPlay, setAutoPlay] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setAgentId(params.get('agentId') || avatar.vapi_agentid);
      setSimliFaceId(params.get('faceId') || avatar.simli_faceid);
      setAutoPlay(params.get('autoplay') === 'true');
      setIsReady(true);
    }
  }, []);

  if (!isReady) return null;

  const onStart = () => {
    setShowDottedFace(false);
  };

  const onClose = () => {
    setShowDottedFace(true);
  };

  return (
    <div className="bg-black min-h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6 bg-effect15White p-6 pb-[40px] rounded-xl w-full max-w-[1600px] max-h-[1600px]">
        <div>
          {showDottedFace && <DottedFace />}
          <SimliVapi
            agentId={agentId}
            simli_faceid={simliFaceId}
            onStart={onStart}
            onClose={onClose}
            showDottedFace={showDottedFace}
            autoPlay={autoPlay}
          />
        </div>
      </div>
    </div>
  );
};

export default Demo;
