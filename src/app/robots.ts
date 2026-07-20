import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/decouvrir', '/groupes', '/chat/', '/profil', '/abonnements'],
      },
    ],
    sitemap: 'https://rencontres-premium.fr/sitemap.xml',
  }
}
