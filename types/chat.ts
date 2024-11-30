export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: number
  tokens?: number
  codeBlocks?: CodeBlock[]
}

export interface CodeBlock {
  id: string
  language: string
  code: string
}

export interface ChatMetrics {
  tokensPerSecond: number
  totalTokens: number
  estimatedCompletionTime: number
}

export interface ModelConfig {
  model: string
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  stopSequences: string[]
}

