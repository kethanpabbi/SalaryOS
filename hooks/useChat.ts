'use client'
import { useState, useCallback, useEffect } from 'react'
import type { Message } from '@/types/salary'
import { useSalaryStore } from './useSalaryStore'

const STORAGE_KEY = 'salaryos-chat'

function loadMessages(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Message[]) : []
  } catch {
    return []
  }
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  const { salaryData, budgetItems } = useSalaryStore()

  // Hydrate from localStorage after mount
  useEffect(() => {
    setMessages(loadMessages())
  }, [])

  // Persist whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
      } catch {}
    }
  }, [messages])

  const sendMessage = useCallback(
    async (text: string) => {
      if (isStreaming) return
      setLastError(null)

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

        if (!res.ok) throw new Error(`Server error ${res.status}`)
        if (!res.body) throw new Error('No response body')

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let accumulated = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          for (const line of chunk.split('\n')) {
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
        const msg = err instanceof Error ? err.message : 'Unknown error'
        setLastError(msg)
        setMessages((prev) => {
          const next = [...prev]
          next[next.length - 1] = {
            ...next[next.length - 1],
            content: '',
            error: true,
          } as Message & { error: boolean }
          return next
        })
      } finally {
        setIsStreaming(false)
      }
    },
    [messages, isStreaming, salaryData, budgetItems]
  )

  const retryLast = useCallback(() => {
    // Find last user message and replay
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    if (!lastUser || isStreaming) return
    // Remove the failed assistant message
    const trimmed = messages.slice(0, messages.lastIndexOf(lastUser) + 1)
    setMessages(trimmed)
    setLastError(null)
    sendMessage(lastUser.content)
  }, [messages, isStreaming, sendMessage])

  const clearMessages = useCallback(() => {
    setMessages([])
    setLastError(null)
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }, [])

  return { messages, isStreaming, lastError, sendMessage, retryLast, clearMessages }
}
