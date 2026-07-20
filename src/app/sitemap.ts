import { MetadataRoute } from 'next'
import { villes } from '@/lib/villes'

const BASE = 'https://rencontres-premium.fr'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/rencontre-libertine`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/pratiques`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/register`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/cgv`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/privacite`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/mentions-legales`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const villePages: MetadataRoute.Sitemap = villes.map((v) => ({
    url: `${BASE}/rencontre-libertine/${v.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticPages, ...villePages]
}
