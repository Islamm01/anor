// lib/auth.ts
import { NextAuthOptions, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        // Attach role and id to session
        (session.user as any).id   = user.id;
        (session.user as any).role = (user as any).role ?? "CUSTOMER";
      }
      return session;
    },
  },
  pages: {
    signIn: "/api/auth/signin",
  },
  session: {
    strategy: "database",
  },
};

/** Returns true if the session user has ADMIN role */
export function isAdmin(session: Session | null): boolean {
  return (session?.user as any)?.role === "ADMIN";
}

/** Returns true if user can access the admin panel */
export function canAccessAdmin(session: Session | null): boolean {
  const role = (session?.user as any)?.role;
  return ["ADMIN", "MANAGER", "SUPPLIER", "COURIER"].includes(role ?? "");
}
