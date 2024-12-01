import { useState, useCallback, useEffect } from "react";
import { Message, useChat } from "ai/react";
import { logger } from "@/utils/logger";
import { useModelConfig } from "./useModelConfig";
import { openDB, DBSchema } from "idb";

interface ChatRequestOptions {
  model?: string;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  usage?: Usage;
}

interface Usage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

interface ChatCallbacks {
  onResponse?: (response: Response) => void;
  onFinish?: (message: Message, options: ChatRequestOptions) => void;
  onError?: (error: Error) => void;
  onSetMessages?: (messages: Message[]) => void;
}

interface ChatManagerProps {
  config?: ChatRequestOptions;
  callbacks?: ChatCallbacks;
  reload?: () => void;
  setMessages?: (messages: Message[]) => void;
}

// Add interface for DB schema
interface ChatDB extends DBSchema {
  messages: {
    key: string;
    value: {
      messages: Message[];
      modelConfig: ChatRequestOptions;
      timestamp: number;
    };
  };
}

export function useChatManager(props?: ChatManagerProps) {
  const [isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { config } = useModelConfig();

  // Modify useChat initialization to use potentially cached config
  const [cachedConfig, setCachedConfig] = useState<ChatRequestOptions | null>(
    null
  );

  const {
    messages: chatMessages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    isLoading: isChatLoading,
    stop,
    reload,
  } = useChat({
    api: "/api/chat",
    initialMessages: [],
    body: {
      config: {
        model: cachedConfig?.model || config.model || "gemini-pro",
        temperature:
          Number(cachedConfig?.temperature ?? config.temperature) || 0.7,
        topP: Number(cachedConfig?.topP ?? config.topP) || 1,
        frequencyPenalty:
          Number(cachedConfig?.frequencyPenalty ?? config.frequencyPenalty) ||
          0,
        presencePenalty:
          Number(cachedConfig?.presencePenalty ?? config.presencePenalty) || 0,
      },
    },
    onError: async (error) => {
      logger.error("Chat error occurred", { error });
      const errorMessage = error.message;

      setMessages([
        ...chatMessages,
        {
          id: "error",
          role: "assistant",
          content: errorMessage.concat(
            "\n check if Penalty is enabled for this model or not try setting penalty to 0"
          ),
        },
      ]);
      setError(errorMessage);
    },
    ...props?.callbacks,
  });

  // Initialize DB connection
  const dbPromise = useCallback(async () => {
    return openDB<ChatDB>("chat-history", 1, {
      upgrade(db) {
        db.createObjectStore("messages");
      },
    });
  }, []);

  // Modify the load cached messages effect to also load config
  useEffect(() => {
    const loadCachedMessages = async () => {
      try {
        const db = await dbPromise();
        const cached = await db.get("messages", "history");
        if (cached?.messages) {
          setMessages(cached.messages);
        }
        if (cached?.modelConfig) {
          setCachedConfig(cached.modelConfig);
        }
      } catch (error) {
        logger.error("Failed to load cached messages", { error });
      }
    };
    loadCachedMessages();
  }, []);

  // Modify the cache messages effect to preserve existing config when caching
  useEffect(() => {
    const cacheMessages = async () => {
      try {
        const db = await dbPromise();
        const existing = await db.get("messages", "history");
        await db.put(
          "messages",
          {
            messages: chatMessages,
            modelConfig: config || existing?.modelConfig || {},
            timestamp: Date.now(),
          },
          "history"
        );
      } catch (error) {
        logger.error("Failed to cache messages", { error });
      }
    };
    if (chatMessages.length > 0) {
      cacheMessages();
    }
  }, [chatMessages, config]);

  const handleMessageSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      try {
        setError(null);
        if (error != null) {
          setMessages(chatMessages.slice(0, -1)); // remove last message
        }
        await handleSubmit(e);
      } catch (error) {
        logger.error("Failed to send message", { error });
        setError("Failed to send message");
      }
    },
    [handleSubmit]
  );

  // Retry failed message
  const retryMessage = useCallback(
    async (messageId: string) => {
      try {
        setError(null);
        const messageToRetry = chatMessages.find((msg) => msg.id === messageId);
        if (!messageToRetry) return;

        // Remove the failed message and its response
        const filteredMessages = chatMessages.filter(
          (msg) => msg.id !== messageId
        );
        setMessages(filteredMessages);
        await handleSubmit(new Event("submit"));
      } catch (error) {
        logger.error("Failed to retry message", { error, messageId });
        setError("Failed to retry message");
      }
    },
    [chatMessages, handleSubmit, setMessages]
  );

  return {
    messages: chatMessages,
    input,
    handleInputChange,
    handleSubmit: handleMessageSubmit,
    isLoading: isLoading || isChatLoading,
    error,
    retryMessage,
    stop,
    reload,
    setMessages,
  };
}
