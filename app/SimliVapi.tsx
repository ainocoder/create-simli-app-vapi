"use client";
import React, { useEffect, useState } from "react";
import SimliVapi from "@/app/SimliVapi";

interface avatarSettings {
  vapi_agentid: string;
  simli_faceid: string;
  vapi_apikey?: string;
  simli_apikey?: string;
}

const avatar: avatarSettings = {
  vapi_agentid: "26638b9a-a7d0-48c5-9ce8-aba9bb2c1371",
  simli_faceid: "1b8a957b-39cf-4b40-8e84-de676134b892",
  vapi_apikey: "",
  simli_apikey: "",
};

const Demo: React.FC = () => {
  const [agentId, setAgentId] = useState(avatar.vapi_agentid);
  const [simliFaceId, setSimliFaceId] = useState(avatar.simli_faceid);
  const [vapiKey, setVapiKey] = useState(avatar.vapi_apikey || "");
  const [simliKey, setSimliKey] = useState(avatar.simli_apikey || "");
  const [autoPlay, setAutoPlay] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setAgentId(params.get('agentId') || avatar.vapi_agentid);
    setSimliFaceId(params.get('faceId') || avatar.simli_faceid);
    setVapiKey(params.get('vapiKey') || avatar.vapi_apikey || "");
    setSimliKey(params.get('simliKey') || avatar.simli_apikey || "");
    setAutoPlay(params.get('autoplay') === 'true');
  }, []);

  const onStart = () => {};
  const onClose = () => {};

  return (
    <div className="bg-black min-h-screen">
      <SimliVapi
        agentId={agentId}
        simli_faceid={simliFaceId}
        vapiKey={vapiKey}
        simliKey={simliKey}
        onStart={onStart}
        onClose={onClose}
        showDottedFace={false}
        autoPlay={autoPlay}
      />
    </div>
  );
};

export default Demo;
