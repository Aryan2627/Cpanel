import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  let url = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || '';
  
  // Basic query params for connection reliability
  if (url && (url.includes('supabase.com') || url.includes('neon.tech')) && !url.includes('pgbouncer=true') && !url.startsWith('prisma://')) {
    url += (url.includes('?') ? '&' : '?') + 'pgbouncer=true&connection_limit=1';
  }
  
  return url ? new PrismaClient({ datasources: { db: { url } } }) : new PrismaClient();
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
