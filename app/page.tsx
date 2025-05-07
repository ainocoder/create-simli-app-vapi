"use client";
import React, { useEffect, useState } from "react";
import SimliVapi from "./Components/SimliVapi";
import DottedFace from "./Components/DottedFace";
import SimliHeaderLogo from "./Components/Logo";
import Navbar from "./Components/Navbar";
import Image from "next/image";
import GitHubLogo from "@/media/github-mark-white.svg";

interface avatarSettings {
  vapi_agentid: string;
  simli_faceid: string;
  vapi_apikey?: string;
  simli_apikey?: string;
}

// Customize your avatar here
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
    <div className="bg-black min-h-screen flex flex-col items-center font-abc-repro font-normal text-sm text-white p-8">
      <SimliHeaderLogo />
      <Navbar />

      <div className="absolute top-[32px] right-[32px]">
        <span
          onClick={() => {
            window.open("create-simli-app-vapi-production.up.railway.app");
          }}
          className="font-bold cursor-pointer mb-8 text-xl leading-8"
        >
          <Image className="w-[20px] inline mr-2" src={GitHubLogo} alt="" />
          create-simli-app (Vapi)
        </span>
      </div>
      <div className="flex flex-col items-center gap-6 bg-effect15White p-6 pb-[40px] rounded-xl w-full">
        <div>
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
      </div>

      <div className="max-w-[350px] font-thin flex flex-col items-center ">
        <span className="font-bold mb-[8px] leading-5 ">
          {" "}
          Create Simli App is a starter repo for creating visual avatars with
          Simli{" "}
        </span>
        <ul className="list-decimal list-inside max-w-[350px] ml-[6px] mt-2">
          <li className="mb-1">
            Fill in your Vapi and Simli API keys in .env file.
          </li>
          <li className="mb-1">
            Test out the interaction and have a talk with the Vapi-powered,
            Simli-visualized avatar.
          </li>
          <li className="mb-1">
            You can replace the avatar's face and agent with your own. Do this
            by editing <code>app/page.tsx</code>.
          </li>
        </ul>
        <span className=" mt-[16px]">
          You can now deploy this app to Vercel, or incorporate it as part of
          your existing project.
        </span>
      </div>
    </div>
  );
};

export default Demo;
