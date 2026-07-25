import { PrismaClient } from '@prisma/client'
import { buildDatabaseUrl } from '@/lib/db-url'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const { url } = buildDatabaseUrl()

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    // Permite configurar por campos separados (DB_HOST, DB_USER, ...)
    // sem obrigar a codificar a password no URL.
    ...(url ? { datasources: { db: { url } } } : {}),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
