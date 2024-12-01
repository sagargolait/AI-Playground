export type Role = "user" | "assistant" | "system";

export interface Message {
  id: string;
  content: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  error?: boolean;
  pending?: boolean;
}

export interface ChatConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface ChatResponse {
  id: string;
  content: string;
  role: Role;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ChatRequestBody {
  messages: Message[];
  config?: ChatConfig;
}

export interface ChatStreamResponse {
  id: string;
  role: Role;
  content: string;
  createdAt: string;
}

export type ChatEventCallback = (message: Message) => void | Promise<void>;

export interface ChatCallbacks {
  onStart?: () => void;
  onMessage?: ChatEventCallback;
  onFinish?: ChatEventCallback;
  onError?: (error: Error) => void;
}

export interface ChatStorageOperations {
  saveMessages: (messages: Message[]) => Promise<void>;
  loadMessages: () => Promise<Message[]>;
  clearMessages: () => Promise<void>;
  getMessage: (id: string) => Promise<Message | null>;
  updateMessage: (id: string, update: Partial<Message>) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
}

export interface ChatOptions {
  config?: ChatConfig;
  callbacks?: ChatCallbacks;
  initialMessages?: Message[];
  storageKey?: string;
}
