import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

// Edge-compatible configuration: used by middleware without Node.js dependencies.
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username ?? null;
        token.title = user.title ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.username = token.username as string | null;
        session.user.title = token.title as string | null;
      }
      return session;
    },
  },
  providers: [],
};
