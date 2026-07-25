'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MyProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  if (!user) return <div>Chargement...</div>

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-2xl">
        <button onClick={() => router.back()} className="mb-6 text-primary-500 hover:underline">← Retour</button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-primary-500 mb-6">Mon Profil</h1>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-600 font-medium mb-2">Email</label>
              <p className="text-lg">{user.email}</p>
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-2">Nom d'utilisateur</label>
              <p className="text-lg">{user.username}</p>
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-2">Genre</label>
              <p className="text-lg capitalize">{user.gender}</p>
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-2">Âge</label>
              <p className="text-lg">{user.age}</p>
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-2">Ville</label>
              <p className="text-lg">{user.city}</p>
            </div>
          </div>

          {user.gender === 'homme' && (
            <div className="mt-8 p-4 bg-blue-50 rounded">
              <p className="text-sm text-blue-700">Vous êtes un utilisateur homme. <a href="/" className="font-semibold hover:underline">Acheter un plan Premium</a> pour accès total!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
