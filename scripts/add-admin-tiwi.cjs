const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const defaultPasswordHash =
    "$2a$10$epYF.Gk9l7P6Wv5cZ.wKse21qA6TqGkJr9F9z5Kq9F9z5Kq9F9z5K";

  const tiwiUser = await prisma.user.upsert({
    where: { username: "tiwi" },
    update: {
      name: "PERTIWI",
      nip: "154550A319",
      title: "Sales Administration",
      role: "ADMIN",
      email: "pertiwi@atujungbatu.com",
      phone: "081268000109",
      isActive: true,
    },
    create: {
      nip: "154550A319",
      name: "PERTIWI",
      username: "tiwi",
      title: "Sales Administration",
      role: "ADMIN",
      email: "pertiwi@atujungbatu.com",
      phone: "081268000109",
      password: defaultPasswordHash,
      isActive: true,
    },
  });

  console.log(
    `✅ Sukses! Akun Admin Tiwi aktif: ${tiwiUser.name} (Username: ${tiwiUser.username}, NIP: ${tiwiUser.nip}) - Role: ${tiwiUser.role}`
  );
}

main()
  .catch((e) => {
    console.error("❌ Gagal mendaftarkan Admin Tiwi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
