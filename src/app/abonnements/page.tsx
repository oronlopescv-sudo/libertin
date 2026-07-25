import { Suspense } from 'react'
import AbonnementsContent from './content'

export default function AbonnementsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<LoadingFallback />}>
        <AbonnementsContent />
      </Suspense>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="container py-12 text-center">
      <div className="inline-flex items-center gap-2">
        <div className="animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full"></div>
        <p className="text-gray-600">Chargement des plans...</p>
      </div>
    </div>
  )
}
