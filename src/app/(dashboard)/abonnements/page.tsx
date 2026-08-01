import { Suspense } from 'react'
import AbonnementsContent from './content'

// Evita pré-renderização estática desta página (usa useSearchParams)
export const dynamic = 'force-dynamic'

export default function AbonnementsPage(): void {
  return (
    <Suspense fallback={<AbonnementsLoading />}>
      <AbonnementsContent />
    </Suspense>
  )
}

function AbonnementsLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-500" />
        <p className="text-slate-500">Chargement des abonnements...</p>
      </div>
    </div>
  )
}
