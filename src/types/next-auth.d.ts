import { Role } from "@prisma/client";
import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email?: string | null;
    username?: string | null;
    role: Role;
    title?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      username?: string | null;
      title?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    username?: string | null;
    title?: string | null;
  }
}
