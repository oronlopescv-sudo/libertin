import { PrismaClient } from '@prisma/client'
import { buildDatabaseUrl } from '@/lib/db-url'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const { url } = buildDatabaseUrl()

// O schema.prisma lê env("DATABASE_URL"). Se a configuração vier dos campos
// separados (DB_HOST, DB_USER, ...), é preciso preencher a variável antes de
// instanciar o cliente, senão o Prisma rebenta a dizer que ela não existe.
if (url && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = url
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    ...(url ? { datasources: { db: { url } } } : {}),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
