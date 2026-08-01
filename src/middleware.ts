import { withAuth } from 'next-auth/middleware'

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export default withAuth({
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ req, token }) {
      if (!token) return false

      // Zone d'administration : liste blanche ADMIN_EMAILS obligatoire.
      if (req.nextUrl.pathname.startsWith('/admin')) {
        const admins = adminEmails()
        const email = typeof token.email === 'string' ? token.email.toLowerCase() : ''
        return admins.length > 0 && admins.includes(email)
      }

      return true
    },
  },
})

export const config = {
  matcher: [
    '/admin/:path*',
    '/decouvrir/:path*',
    '/groupes/:path*',
    '/groupe/:path*',
    '/chat/:path*',
    '/profil/:path*',
    '/abonnements/:path*',
    '/membre/:path*',
  ],
}
