'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Mock data
const mockUsers = [
  { email: 'alice@test.fr', password: 'Test1234!', username: 'Alice', gender: 'femme' },
  { email: 'couple@test.fr', password: 'Test1234!', username: 'LeCouple', gender: 'couple' },
  { email: 'free@test.fr', password: 'Test1234!', username: 'Marco', gender: 'homme' }
]

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const user = mockUsers.find(u => u.email === email && u.password === password)
    if (!user) {
      setError('Email ou mot de passe incorrect')
      return
    }

    localStorage.setItem('user', JSON.stringify({
      email: user.email,
      username: user.username,
      gender: user.gender
    }))

    router.push('/discover')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-primary-500 mb-8">Se Connecter</h1>

        {error && <div className="alert alert-error mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-2">Email</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alice@test.fr"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Mot de passe</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Test1234!"
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full mt-6">Se Connecter</button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded text-sm text-blue-700">
          <p className="font-semibold mb-2">Comptes test:</p>
          <p>alice@test.fr / Test1234! (Femme)</p>
          <p>couple@test.fr / Test1234! (Couple)</p>
          <p>free@test.fr / Test1234! (Homme)</p>
        </div>

        <p className="text-center mt-4 text-gray-600">
          Pas encore inscrit? <a href="/register" className="text-primary-500 font-semibold hover:underline">S'inscrire</a>
        </p>
      </div>
    </div>
  )
}
