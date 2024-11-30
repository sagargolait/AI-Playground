"use client";

import { useState } from "react";
import { useModelConfig } from "@/hooks/useModelConfig";
import { useStreamHook } from "@/hooks/useStream";
import LeftSidebar from "@/components/LeftSidebar";
import MainContent from "@/components/MainContent";
import RightSidebar from "@/components/RightSidebar";

export default function Playground() {
  const { isStreaming, handleStream } = useStreamHook();

  return (
    <div className="flex h-screen bg-[#1a1a1a] text-white">
      <LeftSidebar />
      <MainContent isStreaming={isStreaming} />
      <RightSidebar />
    </div>
  );
}
