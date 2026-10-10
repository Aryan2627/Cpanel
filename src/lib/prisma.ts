import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const prismaClientSingleton = () => {
  let url = process.env.DATABASE_URL || '';
  
  // Basic query params for connection reliability
  if (url && url.includes('supabase.com') && !url.includes('pgbouncer=true') && !url.startsWith('prisma://')) {
    url += (url.includes('?') ? '&' : '?') + 'pgbouncer=true&connection_limit=1';
  }
  
  // Return standard client or Accelerate extended client based on URL protocol
  if (url.startsWith('prisma://')) {
    return new PrismaClient({ datasources: { db: { url } } }).$extends(withAccelerate()) as unknown as PrismaClient;
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
