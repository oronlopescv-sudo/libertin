import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/login',
  },
})

export const config = {
  matcher: [
    '/decouvrir/:path*',
    '/groupes/:path*',
    '/groupe/:path*',
    '/chat/:path*',
    '/profil/:path*',
    '/abonnements/:path*',
    '/membre/:path*',
  ],
}
