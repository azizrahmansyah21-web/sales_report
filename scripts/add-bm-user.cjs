const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const defaultPasswordHash =
    "$2a$10$epYF.Gk9l7P6Wv5cZ.wKse21qA6TqGkJr9F9z5Kq9F9z5Kq9F9z5K";

  const bmUser = await prisma.user.upsert({
    where: { username: "branchmanager" },
    update: {
      name: "BRANCH MANAGER",
      nip: "010101A220",
      title: "Branch Manager",
      role: "ADMIN",
      email: "branchmanager@atujungbatu.com",
      phone: "081268000100",
      isActive: true,
    },
    create: {
      nip: "010101A220",
      name: "BRANCH MANAGER",
      username: "branchmanager",
      title: "Branch Manager",
      role: "ADMIN",
      email: "branchmanager@atujungbatu.com",
      phone: "081268000100",
      password: defaultPasswordHash,
      isActive: true,
    },
  });

  console.log(
    `✅ Sukses! Akun Branch Manager aktif: ${bmUser.name} (Username: ${bmUser.username}, NIP: ${bmUser.nip}) - Role: ${bmUser.role}`
  );
}

main()
  .catch((e) => {
    console.error("❌ Gagal mendaftarkan Branch Manager:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

