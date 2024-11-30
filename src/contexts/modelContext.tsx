"use client";

import React, { createContext, useState, ReactNode } from "react";

interface ModelConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  structuredOutput: boolean;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

interface ModelContextType {
  config: ModelConfig;
  setConfig: React.Dispatch<React.SetStateAction<ModelConfig>>;
}

export const ModelContext = createContext<ModelContextType | undefined>(
  undefined
);

interface ModelProviderProps {
  children: ReactNode;
}

export function ModelProvider({ children }: ModelProviderProps) {
  const [config, setConfig] = useState<ModelConfig>({
    model: "gemini-pro",
    temperature: 0.7,
    maxTokens: 1000000,
    structuredOutput: false,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    usage: undefined,
  });

  return (
    <ModelContext.Provider value={{ config, setConfig }}>
      {children}
    </ModelContext.Provider>
  );
}
