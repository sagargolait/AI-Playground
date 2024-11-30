'use client'

import { useCallback } from 'react'
import { useChatContext } from '@/contexts/chat-context'
import { useCompletion } from 'ai/react'

export function useChatStream() {
  const { state, dispatch } = useChatContext()
  
  const { complete } = useCompletion({
    api: '/api/chat',
    onFinish: (prompt, completion) => {
      dispatch({ 
        type: 'ADD_MESSAGE',
        payload: {
          id: Date.now().toString(),
          content: completion,
          role: 'assistant',
          timestamp: Date.now()
        }
      })
      dispatch({ type: 'SET_STREAMING', payload: false })
    },
    onError: (error) => {
      console.error('Stream error:', error)
      dispatch({ type: 'SET_STREAMING', payload: false })
    }
  })

  const sendMessage = useCallback(async (content: string) => {
    dispatch({ type: 'SET_STREAMING', payload: true })
    
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: Date.now().toString(),
        content,
        role: 'user',
        timestamp: Date.now()
      }
    })

    await complete(content)
  }, [complete, dispatch])

  return {
    sendMessage,
    isStreaming: state.isStreaming
  }
}

