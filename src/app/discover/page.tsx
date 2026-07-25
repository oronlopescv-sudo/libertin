'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// Mock profiles
const mockProfiles = [
  { id: 1, name: 'Sophie', age: 26, city: 'Paris', gender: 'femme', avatar: '👩' },
  { id: 2, name: 'Ella', age: 28, city: 'Lyon', gender: 'femme', avatar: '👱‍♀️' },
  { id: 3, name: 'Nathalie', age: 30, city: 'Marseille', gender: 'femme', avatar: '👸' },
  { id: 4, name: 'Luc&Sarah', age: 32, city: 'Toulouse', gender: 'couple', avatar: '👫' },
  { id: 5, name: 'Emma&Tom', age: 29, city: 'Nice', gender: 'couple', avatar: '💑' },
  { id: 6, name: 'Marc', age: 35, city: 'Bordeaux', gender: 'homme', avatar: '👨' },
  { id: 7, name: 'Pierre', age: 40, city: 'Lille', gender: 'homme', avatar: '🧔' },
  { id: 8, name: 'Victor', age: 27, city: 'Strasbourg', gender: 'homme', avatar: '👨‍🦱' },
]

export default function DiscoverPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profiles, setProfiles] = useState(mockProfiles)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  useEffect(() => {
    if (!user) return

    if (filter === 'all') {
      setProfiles(mockProfiles)
    } else {
      setProfiles(mockProfiles.filter(p => p.gender === filter))
    }
  }, [filter, user])

  if (!user) return <div>Chargement...</div>

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Découvrir les Profils</h1>
          <div className="flex gap-2">
            <button onClick={() => router.push('/profile')} className="btn-small bg-white border border-gray-300 rounded px-4 py-2">Mon Profil</button>
            <button onClick={() => {
              localStorage.removeItem('user')
              router.push('/')
            }} className="btn-small bg-white border border-gray-300 rounded px-4 py-2">Déconnexion</button>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {['all', 'femme', 'couple', 'homme'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full font-medium transition ${
                filter === f
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-primary-500'
              }`}
            >
              {f === 'all' ? 'Tous' : f === 'femme' ? '👩 Femmes' : f === 'couple' ? '💑 Couples' : '👨 Hommes'}
            </button>
          ))}
        </div>

        {/* Grid de perfis */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {profiles.map(profile => (
            <button
              key={profile.id}
              onClick={() => router.push(`/profile/${profile.id}`)}
              className="card p-4 hover:shadow-lg transition text-left"
            >
              <div className="text-6xl text-center mb-2">{profile.avatar}</div>
              <h3 className="font-bold text-primary-500">{profile.name}, {profile.age}</h3>
              <p className="text-sm text-gray-600">{profile.city}</p>
            </button>
          ))}
        </div>

        {profiles.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Aucun profil trouvé</p>
          </div>
        )}
      </div>
    </div>
  )
}
