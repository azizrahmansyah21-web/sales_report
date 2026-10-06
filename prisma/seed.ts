import { PrismaClient, Role, ProspectStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  const defaultPassword = await bcrypt.hash("password123", 10);

  // 1. Seed Admin User
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      name: "Head of Administration",
      username: "admin",
      email: "admin@company.com",
      password: defaultPassword,
      role: Role.ADMIN,
    },
  });
  console.log(`👤 Admin created: ${admin.username} (${admin.name})`);

  // 2. Seed Sales Users
  const sales1 = await prisma.user.upsert({
    where: { username: "sales1" },
    update: {},
    create: {
      name: "Budi Santoso",
      username: "sales1",
      email: "budi@company.com",
      password: defaultPassword,
      role: Role.SALES,
    },
  });
  console.log(`👤 Sales created: ${sales1.username} (${sales1.name})`);

  const sales2 = await prisma.user.upsert({
    where: { username: "sales2" },
    update: {},
    create: {
      name: "Siti Rahma",
      username: "sales2",
      email: "siti@company.com",
      password: defaultPassword,
      role: Role.SALES,
    },
  });
  console.log(`👤 Sales created: ${sales2.username} (${sales2.name})`);

  // 3. Sample prospects for verifying duplicate phone detection and status timeline
  const sampleProspects = [
    {
      userId: sales1.id,
      customerName: "PT Maju Bersama (Pak Anton)",
      customerPhone: "081234567890",
      unitName: "Truk Canter FE 74 HD",
      status: ProspectStatus.FOLLOW_UP,
      notes: "Customer butuh 3 unit untuk ekspansi logistik.",
    },
    {
      userId: sales2.id,
      customerName: "Anton Wijaya (PT Maju Bersama)",
      customerPhone: "081234567890", // Nomor sama untuk tes deteksi duplikasi
      unitName: "Fighter FM 65 FSL",
      status: ProspectStatus.NEW,
      notes: "Menghubungi kantor pusat menanyakan tipe berat.",
    },
    {
      userId: sales1.id,
      customerName: "Ibu Desi Ratnasari",
      customerPhone: "081987654321",
      unitName: "L300 Pick Up",
      status: ProspectStatus.DEAL,
      notes: "Sudah bayar DP, pengiriman minggu depan.",
    },
  ];

  for (const prospect of sampleProspects) {
    await prisma.prospect.create({
      data: prospect,
    });
  }

  console.log(`📋 Created ${sampleProspects.length} sample prospects.`);
  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
