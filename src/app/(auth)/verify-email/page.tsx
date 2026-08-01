'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-primary-950 dark:to-secondary-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-elevated p-8 text-center border border-slate-200 dark:border-slate-700">
        <div className="text-6xl mb-6">📬</div>
        <h1 className="text-2xl font-bold font-heading mb-4 text-primary-900 dark:text-primary-100">
          Vérifiez votre email
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-2 leading-relaxed">
          Nous avons envoyé un lien de confirmation à
        </p>
        {email && (
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-6">{email}</p>
        )}
        <p className="text-sm text-slate-500 mb-8">
          Cliquez sur le lien dans l&apos;email pour activer votre compte. Pensez à vérifier vos
          spams.
        </p>
        <Link
          href="/login"
          className="inline-block px-8 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold rounded-xl hover:shadow-lg transition-shadow"
        >
          Aller à la connexion
        </Link>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  )
}
