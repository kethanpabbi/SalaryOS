'use client'
import { useState, useCallback } from 'react'
import type { Message } from '@/types/salary'
import { useSalaryStore } from './useSalaryStore'

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const { salaryData, budgetItems } = useSalaryStore()

  const sendMessage = useCallback(
    async (text: string) => {
      if (isStreaming) return

      const userMsg: Message = { role: 'user', content: text, timestamp: Date.now() }
      const updatedMessages = [...messages, userMsg]
      setMessages(updatedMessages)
      setIsStreaming(true)

      const assistantMsg: Message = { role: 'assistant', content: '', timestamp: Date.now() }
      setMessages([...updatedMessages, assistantMsg])

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
            salary: salaryData,
            budget: budgetItems,
          }),
        })

        if (!res.body) throw new Error('No response body')
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let accumulated = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              accumulated += parsed.text
              setMessages((prev) => {
                const next = [...prev]
                next[next.length - 1] = { ...next[next.length - 1], content: accumulated }
                return next
              })
            } catch {}
          }
        }
      } catch (err) {
        setMessages((prev) => {
          const next = [...prev]
          next[next.length - 1] = {
            ...next[next.length - 1],
            content: 'Sorry, something went wrong. Please try again.',
          }
          return next
        })
      } finally {
        setIsStreaming(false)
      }
    },
    [messages, isStreaming, salaryData, budgetItems]
  )

  const clearMessages = useCallback(() => setMessages([]), [])

  return { messages, isStreaming, sendMessage, clearMessages }
}
