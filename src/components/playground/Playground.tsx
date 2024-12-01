"use client";

import LeftSidebar from "@/components/LeftSidebar";
import MainContent from "@/components/MainContent";
import RightSidebar from "@/components/RightSidebar";

export default function Playground() {
  return (
    <div className="flex h-screen bg-[#1a1a1a] text-white">
      <LeftSidebar />
      <MainContent />
      <RightSidebar />
    </div>
  );
}
