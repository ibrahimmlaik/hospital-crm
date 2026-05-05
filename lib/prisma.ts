import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

// Always cache on globalThis — this prevents creating a new client on every
// serverless function invocation in production (Netlify, Vercel, etc.)
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

globalForPrisma.prisma = prisma
