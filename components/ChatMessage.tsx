'use client'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Copy, Check, AlertCircle, RefreshCw } from 'lucide-react'
import type { Message } from '@/types/salary'

const FOLLOW_UPS: Record<string, string[]> = {
  tax: ['What if I switch to old regime?', 'How can I reduce my tax further?'],
  espp: ['When is the best time to sell ESPP shares?', 'How is ESPP taxed in India?'],
  loan: ['How much EMI can I afford?', 'What is the ideal down payment?'],
  salary: ['Is this offer competitive?', 'What should I negotiate?'],
}

function getSuggestions(content: string): string[] {
  const lower = content.toLowerCase()
  if (lower.includes('tax') || lower.includes('regime')) return FOLLOW_UPS.tax
  if (lower.includes('espp') || lower.includes('stock')) return FOLLOW_UPS.espp
  if (lower.includes('loan') || lower.includes('emi') || lower.includes('home')) return FOLLOW_UPS.loan
  return FOLLOW_UPS.salary
}

export default function ChatMessage({
  message,
  isLast,
  isStreaming,
  onFollowUp,
  onRetry,
}: {
  message: Message
  isLast: boolean
  isStreaming: boolean
  onFollowUp: (text: string) => void
  onRetry: () => void
}) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const showSuggestions = !isUser && isLast && !isStreaming && !message.error && message.content.length > 0

  function copy() {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  if (message.error) {
    return (
      <div className="flex justify-start mb-3">
        <div className="max-w-[85%] px-4 py-2 rounded-2xl rounded-bl-sm bg-destructive/10 border border-destructive/30 text-sm">
          <div className="flex items-center gap-2 text-destructive mb-1">
            <AlertCircle size={14} />
            <span className="font-medium">Something went wrong</span>
          </div>
          <button
            onClick={onRetry}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 group`}>
      <div className="max-w-[85%] flex flex-col gap-1">
        <div
          className={`px-4 py-2 rounded-2xl text-sm relative ${
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-muted border border-border rounded-bl-sm'
          }`}
        >
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-1 last:mb-0 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="list-disc ml-4 mb-1 space-y-0.5">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal ml-4 mb-1 space-y-0.5">{children}</ol>,
                li: ({ children }) => <li>{children}</li>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                code: ({ children }) => (
                  <code className="px-1 py-0.5 bg-background/60 rounded text-xs font-mono">{children}</code>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}

          {/* Copy button */}
          {!isUser && message.content && (
            <button
              onClick={copy}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-background/50"
              aria-label="Copy message"
            >
              {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="text-muted-foreground" />}
            </button>
          )}
        </div>

        {/* Follow-up suggestions */}
        {showSuggestions && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {getSuggestions(message.content).map((s) => (
              <button
                key={s}
                onClick={() => onFollowUp(s)}
                className="text-xs px-2.5 py-1 rounded-full border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
