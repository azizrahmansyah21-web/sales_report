import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const defaultPasswordHash =
    "$2a$10$epYF.Gk9l7P6Wv5cZ.wKse21qA6TqGkJr9F9z5Kq9F9z5Kq9F9z5K";

  const tiwiUser = await prisma.user.upsert({
    where: { username: "tiwi" },
    update: {
      name: "PERTIWI",
      title: "Sales Administration",
      role: Role.ADMIN,
      email: "pertiwi@atujungbatu.com",
      phone: "081268000109",
      isActive: true,
    },
    create: {
      nip: "154550A319",
      name: "PERTIWI",
      username: "tiwi",
      title: "Sales Administration",
      role: Role.ADMIN,
      email: "pertiwi@atujungbatu.com",
      phone: "081268000109",
      password: defaultPasswordHash,
      isActive: true,
    },
  });

  console.log(
    `✅ Admin Tiwi user upserted: ${tiwiUser.name} (${tiwiUser.username}) - Role: ${tiwiUser.role} - NIP: ${tiwiUser.nip}`
  );
}

main()
  .catch((e) => {
    console.error("❌ Failed to upsert Admin Tiwi user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
