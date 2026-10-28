const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const plainPassword = process.env.SUPERADMIN_PASSWORD || "superadmin220";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const superadminUser = await prisma.user.upsert({
    where: { username: "superadmin" },
    update: {
      name: "AZIZ RAHMANSYAH",
      nip: "999999A220",
      title: "Lead Architect & Superadmin",
      role: "SUPERADMIN",
      email: "aziz@planspk.com",
      phone: "081268000999",
      password: hashedPassword,
      isActive: true,
    },
    create: {
      nip: "999999A220",
      name: "AZIZ RAHMANSYAH",
      username: "superadmin",
      title: "Lead Architect & Superadmin",
      role: "SUPERADMIN",
      email: "aziz@planspk.com",
      phone: "081268000999",
      password: hashedPassword,
      isActive: true,
    },
  });

  console.log("=================================================");
  console.log("✅ SUKSES! Akun Superadmin Cabang 220 Terdaftar:");
  console.log(`   Nama     : ${superadminUser.name}`);
  console.log(`   NIP      : ${superadminUser.nip}`);
  console.log(`   Username : ${superadminUser.username}`);
  console.log(`   Role     : ${superadminUser.role}`);
  console.log(`   Password : ${plainPassword}`);
  console.log("=================================================");
}

main()
  .catch((e) => {
    console.error("❌ Gagal mendaftarkan akun Superadmin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

