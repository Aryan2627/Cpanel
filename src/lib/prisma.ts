import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  // Configure connection pooling for Vercel Serverless
  let url = process.env.DATABASE_URL || '';
  if (url && url.includes('supabase.com') && !url.includes('pgbouncer=true')) {
    url += (url.includes('?') ? '&' : '?') + 'pgbouncer=true&connection_limit=1';
  }
  return new PrismaClient({
    datasources: { db: { url } },
  })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma