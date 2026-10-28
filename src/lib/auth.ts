import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { loginSchema } from "@/lib/validations/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "NIP / Kredensial", type: "text" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { identifier } = parsed.data;
        const cleanId = identifier.trim();
        const normalized = cleanId.toLowerCase();

        // Shortcut Superadmin (Bang Aziz — Developer & Control Center Owner): "superadmin", "aziz", "bangaziz"
        if (
          normalized === "superadmin" ||
          normalized === "aziz" ||
          normalized === "bangaziz" ||
          normalized === "developer"
        ) {
          let superUser = await prisma.user.findFirst({
            where: {
              OR: [
                { role: "SUPERADMIN" },
                { username: "superadmin" },
                { username: "aziz" },
                { name: { contains: "Aziz", mode: "insensitive" } },
              ],
            },
          });
          if (!superUser) {
            superUser = await prisma.user.upsert({
              where: { username: "superadmin" },
              update: { role: "SUPERADMIN", isActive: true },
              create: {
                nip: "999999A220",
                name: "AZIZ RAHMANSYAH",
                username: "superadmin",
                title: "Lead Architect & Superadmin",
                role: "SUPERADMIN",
                email: "aziz@planspk.com",
                phone: "081268000999",
                password: "dev-authenticated",
                isActive: true,
              },
            });
          }
          if (superUser) {
            return {
              id: superUser.id,
              name: superUser.name,
              email: superUser.email,
              username: superUser.username,
              role: superUser.role,
              title: superUser.title,
            };
          }
        }

        // Shortcut Branch Manager (Pimpinan Tertinggi Cabang 220): "branchmanager", "brm", "bm"
        if (
          normalized === "branchmanager" ||
          normalized === "brm" ||
          normalized === "bm" ||
          normalized === "branch manager"
        ) {
          const bmUser = await prisma.user.findFirst({
            where: {
              OR: [
                { username: "branchmanager" },
                { username: "brm" },
                { title: { contains: "Branch Manager", mode: "insensitive" } },
              ],
              isActive: true,
            },
          });
          if (bmUser) {
            return {
              id: bmUser.id,
              name: bmUser.name,
              email: bmUser.email,
              username: bmUser.username,
              role: bmUser.role,
              title: bmUser.title,
            };
          }
        }

        // Shortcut Admin Tiwi (Sales Administration): "tiwi", "admin.tiwi", "admin tiwi"
        if (
          normalized === "tiwi" ||
          normalized === "admin.tiwi" ||
          normalized === "admin tiwi"
        ) {
          const tiwiUser = await prisma.user.findFirst({
            where: {
              OR: [
                { username: "tiwi" },
                { username: "admin.tiwi" },
                { name: { contains: "tiwi", mode: "insensitive" } },
              ],
              role: "ADMIN",
              isActive: true,
            },
          });
          if (tiwiUser) {
            return {
              id: tiwiUser.id,
              name: tiwiUser.name,
              email: tiwiUser.email,
              username: tiwiUser.username,
              role: tiwiUser.role,
              title: tiwiUser.title,
            };
          }
        }

        // Shortcut Asisten BM: "indra", "asistenbm", "asisten bm"
        if (
          normalized === "indra" ||
          normalized === "asistenbm" ||
          normalized === "asisten bm" ||
          normalized === "asisten branch manager"
        ) {
          const indraUser = await prisma.user.findFirst({
            where: {
              OR: [
                { username: "indra" },
                { nip: "154090A319" },
                { name: { contains: "indra", mode: "insensitive" } },
              ],
              role: "ADMIN",
              isActive: true,
            },
          });
          if (indraUser) {
            return {
              id: indraUser.id,
              name: indraUser.name,
              email: indraUser.email,
              username: indraUser.username,
              role: indraUser.role,
              title: indraUser.title,
            };
          }
        }

        // 1. Khusus Bapak Administration Head: login cepat dengan "ADH"
        if (normalized === "adh" || normalized === "admin head") {
          const adhUser = await prisma.user.findFirst({
            where: {
              OR: [
                { username: "adh" },
                { nip: "050507A403" },
                { title: { contains: "Administration Head", mode: "insensitive" } },
              ],
              isActive: true,
            },
          });
          if (adhUser) {
            return {
              id: adhUser.id,
              name: adhUser.name,
              email: adhUser.email,
              username: adhUser.username,
              role: adhUser.role,
              title: adhUser.title,
            };
          }
        }

        // 2. Shortcut Supervisor: "spv" atau "spv1"
        if (normalized === "spv" || normalized === "spv1") {
          const spvUser = await prisma.user.findFirst({
            where: {
              OR: [
                { username: "spv" },
                { username: "spv1" },
                { nip: "101257A311" },
              ],
              isActive: true,
            },
          });
          if (spvUser) {
            return {
              id: spvUser.id,
              name: spvUser.name,
              email: spvUser.email,
              username: spvUser.username,
              role: spvUser.role,
              title: spvUser.title,
            };
          }
        }

        // 3. Pencarian NIP / Username / Email umum (Passwordless)
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { nip: { equals: cleanId, mode: "insensitive" } },
              { username: { equals: normalized, mode: "insensitive" } },
              { email: { equals: normalized, mode: "insensitive" } },
            ],
            isActive: true,
          },
        });

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
          title: user.title,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 24 * 60 * 60, // 60 hari remember session
    updateAge: 24 * 60 * 60,   // Rolling refresh tiap 24 jam
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
});
