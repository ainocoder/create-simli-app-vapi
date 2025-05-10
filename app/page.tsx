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
  vapi_agentid: "26638b9a-a7d0-48c5-9ce8-aba9bb2c1371",
  simli_faceid: "1b8a957b-39cf-4b40-8e84-de676134b892",
};

const Demo: React.FC = () => {
  const [showDottedFace, setShowDottedFace] = useState(true);
  const [agentId, setAgentId] = useState(avatar.vapi_agentid);
  const [simliFaceId, setSimliFaceId] = useState(avatar.simli_faceid);
  const [autoPlay, setAutoPlay] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setAgentId(params.get('agentId') || avatar.vapi_agentid);
    setSimliFaceId(params.get('faceId') || avatar.simli_faceid);
    setAutoPlay(params.get('autoplay') === 'true');
  }, []);

  const onStart = () => {
    setShowDottedFace(false);
  };

  const onClose = () => {
    setShowDottedFace(true);
  };

  return (
    <div className="bg-black min-h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6 bg-effect15White p-6 pb-[40px] rounded-xl w-full max-w-[800px]">
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
