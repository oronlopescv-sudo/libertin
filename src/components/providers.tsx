'use client'

import React from 'react'

import { ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'

interface ProvidersProps {
  children: ReactNode
}

export const Providers = React.memo(({ children }: ProvidersProps) => {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
})

Providers.displayName = 'Providers'
