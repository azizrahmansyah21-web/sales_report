import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const defaultPasswordHash =
    "$2a$10$epYF.Gk9l7P6Wv5cZ.wKse21qA6TqGkJr9F9z5Kq9F9z5Kq9F9z5K";

  const bmUser = await prisma.user.upsert({
    where: { username: "branchmanager" },
    update: {
      name: "BRANCH MANAGER",
      title: "Branch Manager",
      role: Role.ADMIN,
      email: "branchmanager@atujungbatu.com",
      phone: "081268000100",
      isActive: true,
    },
    create: {
      nip: "010101A220",
      name: "BRANCH MANAGER",
      username: "branchmanager",
      title: "Branch Manager",
      role: Role.ADMIN,
      email: "branchmanager@atujungbatu.com",
      phone: "081268000100",
      password: defaultPasswordHash,
      isActive: true,
    },
  });

  console.log(`Branch Manager user upserted: ${bmUser.name} (${bmUser.username}) - Role: ${bmUser.role}`);
}

main()
  .catch((e) => {
    console.error("Failed to upsert Branch Manager user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
