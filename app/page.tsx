"use client";
import React, { useState } from "react";
import SimliVapi from "@/app/SimliVapi";

const avatar = {
  vapi_agentid: "26638b9a-a7d0-48c5-9ce8-aba9bb2c1371",
  simli_faceid: "1b8a957b-39cf-4b40-8e84-de676134b892",
};

const Demo: React.FC = () => {
  const [showDottedFace, setShowDottedFace] = useState(true);

  const onStart = () => setShowDottedFace(false);
  const onClose = () => setShowDottedFace(true);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <SimliVapi
        agentId={avatar.vapi_agentid}
        simli_faceid={avatar.simli_faceid}
        onStart={onStart}
        onClose={onClose}
        showDottedFace={showDottedFace}
      />
    </div>
  );
};

export default Demo;
