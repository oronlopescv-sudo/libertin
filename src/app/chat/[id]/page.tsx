'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const receiverId = params.id as string
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')

  // Mock: carrega mensagens a cada 3 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      // Em um app real, faria fetch de DB aqui
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const handleSend = () => {
    if (!input.trim()) return

    setMessages([...messages, {
      id: messages.length + 1,
      sender: 'me',
      content: input,
      timestamp: new Date().toLocaleTimeString()
    }])

    setInput('')

    // Mock: simula resposta após 2s
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        sender: 'them',
        content: 'Merci de ton message! 😊',
        timestamp: new Date().toLocaleTimeString()
      }])
    }, 2000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="gradient-primary text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">💬 Chat</h1>
        <button onClick={() => router.back()} className="text-white hover:opacity-80">← Retour</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p>Aucun message. Commencez la conversation!</p>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-4 py-2 rounded-lg max-w-xs ${
              msg.sender === 'me'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-300 text-gray-900'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t p-4 bg-white flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Écrire un message..."
          className="input-field flex-1"
        />
        <button onClick={handleSend} className="btn-primary px-6">
          Envoyer
        </button>
      </div>
    </div>
  )
}
