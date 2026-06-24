'use client'
import { useEffect, useRef, useState } from 'react'
import { Send, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useChat } from '@/hooks/useChat'
import ChatMessage from './ChatMessage'

const STARTERS = [
  'Is this a good offer for my experience level?',
  'How much should I put into ESPP?',
  'What is my effective tax rate?',
  'How long until I can afford a home loan?',
  'Should I take the car EMI or invest instead?',
]

export default function ChatBot() {
  const { messages, isStreaming, sendMessage } = useChat()
  const [input, setInput] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    const text = input.trim()
    if (!text || isStreaming) return
    setInput('')
    sendMessage(text)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Desktop: sticky panel */}
      <div className="hidden lg:flex flex-col h-full">
        <ChatPanel
          messages={messages}
          isStreaming={isStreaming}
          input={input}
          setInput={setInput}
          handleSend={handleSend}
          handleKey={handleKey}
          bottomRef={bottomRef}
          onStarter={sendMessage}
        />
      </div>

      {/* Mobile: bottom sheet */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 bg-card border-t border-border"
          aria-label="Toggle chat"
        >
          <span className="flex items-center gap-2 font-medium text-sm">
            <MessageCircle size={16} /> Ask SalaryOS
          </span>
          {mobileOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
        {mobileOpen && (
          <div className="h-96 bg-card border-t border-border flex flex-col">
            <ChatPanel
              messages={messages}
              isStreaming={isStreaming}
              input={input}
              setInput={setInput}
              handleSend={handleSend}
              handleKey={handleKey}
              bottomRef={bottomRef}
              onStarter={sendMessage}
            />
          </div>
        )}
      </div>
    </>
  )
}

function ChatPanel({
  messages,
  isStreaming,
  input,
  setInput,
  handleSend,
  handleKey,
  bottomRef,
  onStarter,
}: {
  messages: ReturnType<typeof useChat>['messages']
  isStreaming: boolean
  input: string
  setInput: (v: string) => void
  handleSend: () => void
  handleKey: (e: React.KeyboardEvent) => void
  bottomRef: React.RefObject<HTMLDivElement | null>
  onStarter: (text: string) => void
}) {
  return (
    <Card className="flex flex-col h-full rounded-none lg:rounded-xl border-0 lg:border">
      <CardHeader className="pb-2 border-b border-border">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageCircle size={18} /> SalaryOS Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center gap-3">
            <p className="text-sm text-muted-foreground text-center">Ask me anything about your compensation</p>
            <div className="space-y-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => onStarter(s)}
                  className="w-full text-left text-sm px-3 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1">
            {messages.map((m, i) => (
              <ChatMessage key={i} message={m} />
            ))}
            {isStreaming && (
              <div className="flex justify-start mb-3">
                <div className="bg-muted border border-border rounded-2xl rounded-bl-sm px-4 py-2">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </CardContent>
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            aria-label="Ask SalaryOS"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about your offer, taxes, savings..."
            className="flex-1 text-sm px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled={isStreaming}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            aria-label="Send message"
            className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </Card>
  )
}
