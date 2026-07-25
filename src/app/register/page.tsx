'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    gender: '',
    age: '',
    city: '',
    password: '',
    passwordConfirm: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.email.includes('@')) {
      setError('Email inválido')
      return
    }
    if (formData.password.length < 8) {
      setError('Mot de passe minimum 8 caractères')
      return
    }
    if (formData.password !== formData.passwordConfirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    // Mock: simula registo bem-sucedido
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      email: formData.email,
      username: formData.username,
      gender: formData.gender,
      age: formData.age,
      city: formData.city
    }))

    router.push('/discover')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-primary-500 mb-8">S'inscrire</h1>

        {error && <div className="alert alert-error mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-2">Email</label>
            <input
              type="email"
              className="input-field"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Nom d'utilisateur</label>
            <input
              type="text"
              className="input-field"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Genre</label>
            <select
              className="input-field"
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
              required
            >
              <option value="">Sélectionner...</option>
              <option value="femme">Femme</option>
              <option value="couple">Couple</option>
              <option value="homme">Homme</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-2">Âge</label>
            <input
              type="number"
              className="input-field"
              min="18"
              max="120"
              value={formData.age}
              onChange={(e) => setFormData({...formData, age: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Ville</label>
            <input
              type="text"
              className="input-field"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Mot de passe</label>
            <input
              type="password"
              className="input-field"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Confirmer mot de passe</label>
            <input
              type="password"
              className="input-field"
              value={formData.passwordConfirm}
              onChange={(e) => setFormData({...formData, passwordConfirm: e.target.value})}
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full mt-6">S'inscrire</button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          Vous avez déjà un compte? <a href="/login" className="text-primary-500 font-semibold hover:underline">Se connecter</a>
        </p>
      </div>
    </div>
  )
}
