import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaClient } from '@prisma/client';
import { logLoginActivity, logAudit } from '../../../../lib/audit';

const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      const email = user.email?.trim().toLowerCase();
      if (!email) return false;

      // STRICT CHECK: Only allow emails registered in our database
      const users = await prisma.user.findMany();
      const vendors = await prisma.vendor.findMany();

      const userMatch = users.find(u => u.email?.trim().toLowerCase() === email);
      const vendorMatch = vendors.find(v => v.email?.trim().toLowerCase() === email);

      if (!userMatch && !vendorMatch) {
        // Block login — email not in our system
        return false;
      }

      // Log the login activity
      void logLoginActivity({ identifier: email, success: true });
      void logAudit({ actorEmail: email, action: 'LOGIN', entityType: 'User', entityRef: email });

      return true;
    },

    async session({ session, token }) {
      if (session.user?.email) {
        const email = session.user.email.trim().toLowerCase();
        const users = await prisma.user.findMany();
        const vendors = await prisma.vendor.findMany();

        const userMatch = users.find(u => u.email?.trim().toLowerCase() === email);
        const vendorMatch = vendors.find(v => v.email?.trim().toLowerCase() === email);

        let role = 'client';
        if (userMatch) {
          role = userMatch.role?.toLowerCase() === 'admin' ? 'admin' : 'client';
        } else if (vendorMatch) {
          role = 'vendor';
        }

        // Attach role to session
        (session as any).role = role;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
});

export { handler as GET, handler as POST };
