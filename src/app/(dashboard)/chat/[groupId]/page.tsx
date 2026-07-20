'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface ChatMessage {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    username: string
    gender: string
    isVerified: boolean
  }
}

const genderEmojis: Record<string, string> = {
  homme: '👨',
  femme: '👩',
  couple: '👫',
}

export default function ChatPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const router = useRouter()
  const { data: session } = useSession()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [groupName, setGroupName] = useState('')
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [accessDenied, setAccessDenied] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const lastMessageDate = useRef<string | null>(null)

  const isPremium =
    session?.user?.subscriptionEnd && new Date(session.user.subscriptionEnd) > new Date()
  const hasAccess =
    isPremium ||
    session?.user?.gender === 'femme' ||
    session?.user?.gender === 'couple'

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Chargement initial de l'historique
  const loadHistory = useCallback(async () => {
    const res = await fetch(`/api/groups/${groupId}/messages`)
    if (res.status === 403) {
      setAccessDenied(true)
      return
    }
    if (res.ok) {
      const data = await res.json()
      setGroupName(data.groupName)
      setMessages(data.messages)
      if (data.messages.length > 0) {
        lastMessageDate.current = data.messages[data.messages.length - 1].createdAt
      }
      setTimeout(scrollToBottom, 100)
    }
  }, [groupId])

  // Polling incrémental toutes les 3 secondes
  const pollNewMessages = useCallback(async () => {
    if (!lastMessageDate.current) return
    const res = await fetch(
      `/api/groups/${groupId}/messages?after=${encodeURIComponent(lastMessageDate.current)}`
    )
    if (res.ok) {
      const data = await res.json()
      if (data.messages.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id))
          const newOnes = data.messages.filter((m: ChatMessage) => !existingIds.has(m.id))
          return [...prev, ...newOnes]
        })
        lastMessageDate.current = data.messages[data.messages.length - 1].createdAt
        setTimeout(scrollToBottom, 100)
      }
    }
  }, [groupId])

  useEffect(() => {
    loadHistory()
    const interval = setInterval(pollNewMessages, 3000)
    return () => clearInterval(interval)
  }, [loadHistory, pollNewMessages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    setSending(true)
    setError('')
    try {
      const res = await fetch(`/api/groups/${groupId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.premiumRequired) {
          router.push('/abonnements')
          return
        }
        setError(data.error ?? "Erreur lors de l'envoi")
        return
      }

      setMessages((prev) => [...prev, data.message])
      lastMessageDate.current = data.message.createdAt
      setInput('')
      setTimeout(scrollToBottom, 100)
    } finally {
      setSending(false)
    }
  }

  if (accessDenied) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🔒</div>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Vous ne faites pas partie de ce groupe.
          </p>
          <Link
            href="/groupes"
            className="px-6 py-3 bg-primary-600 text-white font-bold rounded-xl inline-block"
          >
            Retour aux groupes
          </Link>
        </div>
      </div>
    )
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2.5rem)] md:h-screen">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <Link href="/groupes" className="text-slate-500 hover:text-primary-600 text-xl">
          ←
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold font-heading text-slate-900 dark:text-slate-100 truncate">
            {groupName || 'Chargement...'}
          </h1>
          <p className="text-xs text-green-600">● Conversation active</p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-slate-50 dark:bg-slate-950">
        {messages.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-sm">Aucun message. Lancez la conversation !</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMine = msg.user.id === session?.user?.id
          return (
            <div key={msg.id} className={`flex gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
              {!isMine && (
                <div className="w-8 h-8 rounded-full bg-secondary-300 dark:bg-secondary-700 flex items-center justify-center text-sm shrink-0">
                  {genderEmojis[msg.user.gender] ?? '👤'}
                </div>
              )}
              <div className={`max-w-[75%] md:max-w-md`}>
                {!isMine && (
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                    {msg.user.username}
                    {msg.user.isVerified && <span>✅</span>}
                  </p>
                )}
                <div
                  className={`px-4 py-2.5 rounded-2xl ${
                    isMine
                      ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-br-md'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-md shadow-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                </div>
                <p className={`text-[10px] text-slate-400 mt-1 ${isMine ? 'text-right' : ''}`}>
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Zone d'envoi */}
      <div className="px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        {error && <p className="text-danger text-xs mb-2">{error}</p>}
        {!hasAccess ? (
          <Link
            href="/abonnements"
            className="block text-center py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold rounded-xl"
          >
            🔓 Passez Premium pour participer à la conversation
          </Link>
        ) : (
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrivez votre message..."
              maxLength={2000}
              className="flex-1"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="px-5 py-2 bg-primary-600 text-white font-bold rounded-lg disabled:opacity-40 hover:bg-primary-700 transition-colors"
            >
              {sending ? '...' : 'Envoyer'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
