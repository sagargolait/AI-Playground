import { StreamContext } from "@/contexts/streamContext";
import { useContext } from "react";

export function useStreamHook() {
  const context = useContext(StreamContext);
  if (context === undefined) {
    throw new Error("useStreamHook must be used within a StreamProvider");
  }

  const { isStreaming, setIsStreaming } = context;

  const handleStream = async (prompt: string) => {
    setIsStreaming(true);
    const result = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    });
    const data = await result.json();

    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsStreaming(false);
  };

  return {
    isStreaming,
    handleStream,
  };
}
