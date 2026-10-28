const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const defaultPasswordHash =
    "$2a$10$epYF.Gk9l7P6Wv5cZ.wKse21qA6TqGkJr9F9z5Kq9F9z5Kq9F9z5K";

  const indraUser = await prisma.user.upsert({
    where: { username: "indra" },
    update: {
      name: "INDRA",
      nip: "154090A319",
      title: "Asisten Branch Manager",
      role: "ADMIN",
      email: "indra@atujungbatu.com",
      phone: "081268000108",
      isActive: true,
    },
    create: {
      nip: "154090A319",
      name: "INDRA",
      username: "indra",
      title: "Asisten Branch Manager",
      role: "ADMIN",
      email: "indra@atujungbatu.com",
      phone: "081268000108",
      password: defaultPasswordHash,
      isActive: true,
    },
  });

  console.log(
    `✅ Sukses! Akun Asisten BM aktif: ${indraUser.name} (Username: ${indraUser.username}, NIP: ${indraUser.nip}) - Role: ${indraUser.role}`
  );
}

main()
  .catch((e) => {
    console.error("❌ Gagal mendaftarkan Asisten BM Indra:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
