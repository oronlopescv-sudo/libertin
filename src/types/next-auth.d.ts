import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      subscriptionTier: string
      subscriptionEnd: string | null
      isVerified: boolean
      gender: string
    }
  }
  interface User {
    id: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    subscriptionTier?: string
    subscriptionEnd?: string | null
    isVerified?: boolean
    gender?: string
  }
}
