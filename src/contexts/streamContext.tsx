"use client";

import React, { createContext, useState, ReactNode } from "react";

interface StreamContextType {
  isStreaming: boolean;
  setIsStreaming: React.Dispatch<React.SetStateAction<boolean>>;
}

export const StreamContext = createContext<StreamContextType | undefined>(
  undefined
);

interface StreamProviderProps {
  children: ReactNode;
}

export function StreamProvider({ children }: StreamProviderProps) {
  const [isStreaming, setIsStreaming] = useState(false);

  return (
    <StreamContext.Provider value={{ isStreaming, setIsStreaming }}>
      {children}
    </StreamContext.Provider>
  );
}
