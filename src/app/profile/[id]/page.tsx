'use client'

import { useParams, useRouter } from 'next/navigation'

const mockProfile = {
  1: { name: 'Sophie', age: 26, city: 'Paris', gender: 'femme', bio: 'Femme célibataire adorable 😊', avatar: '👩' },
  2: { name: 'Ella', age: 28, city: 'Lyon', gender: 'femme', bio: 'Aime les sorties en couple', avatar: '👱‍♀️' },
  3: { name: 'Luc&Sarah', age: 32, city: 'Toulouse', gender: 'couple', bio: 'Couple en quête d\'aventures', avatar: '👫' },
  4: { name: 'Marc', age: 35, city: 'Bordeaux', gender: 'homme', bio: 'Homme simple et sincère', avatar: '👨' },
}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  
  const profile = (mockProfile as any)[id]

  if (!profile) {
    return <div className="container py-12 text-center">Profil non trouvé</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-2xl">
        <button onClick={() => router.back()} className="mb-6 text-primary-500 hover:underline">← Retour</button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="text-8xl text-center py-20 bg-gradient-to-b from-primary-100 to-primary-50">
            {profile.avatar}
          </div>

          <div className="p-8">
            <h1 className="text-3xl font-bold text-primary-500 mb-2">
              {profile.name}, {profile.age}
            </h1>
            <p className="text-gray-600 mb-6">📍 {profile.city}</p>

            {profile.bio && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-2">À propos</h3>
                <p className="text-gray-700">{profile.bio}</p>
              </div>
            )}

            <button
              onClick={() => router.push(`/chat/${id}`)}
              className="btn-primary w-full"
            >
              💬 Envoyer un message
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
