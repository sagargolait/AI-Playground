"use client";

import { createContext, useContext, useReducer } from "react";
import type { Message } from "ai";
import { useRetry } from "@/hooks/useRetry";
import { logger } from "@/utils/logger";

interface ModelConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  stopSequences: string[];
}

interface ChatState {
  config: ModelConfig;
  messages: Message[];
}

type ChatAction =
  | { type: "UPDATE_CONFIG"; payload: Partial<ModelConfig> }
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "SET_MESSAGES"; payload: Message[] };

const initialState: ChatState = {
  config: {
    model: "gpt-4",
    temperature: 1,
    maxTokens: 2048,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    stopSequences: [],
  },
  messages: [],
};

const ChatContext = createContext<{
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
} | null>(null);

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "UPDATE_CONFIG":
      return {
        ...state,
        config: { ...state.config, ...action.payload },
      };
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case "SET_MESSAGES":
      return {
        ...state,
        messages: action.payload,
      };
    default:
      return state;
  }
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { retry, isRetrying } = useRetry({
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 5000,
  });

  const sendMessage = async (message: string) => {
    try {
      const response = await retry(
        () =>
          fetch("/api/chat", {
            method: "POST",
            body: JSON.stringify({ message }),
          }),
        "sendMessage"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      logger.info("Message sent successfully", {
        messageLength: message.length,
        timestamp: new Date().toISOString(),
      });

      return response.json();
    } catch (error) {
      logger.error("Failed to send message", {
        error: error instanceof Error ? error.message : "Unknown error",
        message,
      });
      throw error;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        sendMessage,
        isRetrying,
        // ... other values
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
