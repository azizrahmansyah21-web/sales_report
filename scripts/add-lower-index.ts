/**
 * Skrip Optimasi Database: Pembuatan Functional Index LOWER(customer_name)
 * Agung Toyota UjungBatu (Cabang 220)
 *
 * Mengoptimalkan kueri deteksi prospek duplikat di PostgreSQL Neon:
 * Klausa: `customerName: { equals: name, mode: "insensitive" }`
 * dikompilasi menjadi `LOWER(customer_name) = LOWER($1)`.
 *
 * Index fungsional ini mengubah sequential scan (O(N)) menjadi bitmap index scan (O(log N)).
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Menjalankan Optimasi Index Database Neon ===");
  console.log("Menambahkan Functional Index: idx_plan_spk_customer_name_lower...");

  // 1. Eksekusi DDL pembuatan index fungsional
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_plan_spk_customer_name_lower 
    ON plan_spk (LOWER(customer_name));
  `);

  console.log("DDL selesai dieksekusi.");

  // 2. Verifikasi keberadaan index di PostgreSQL catalog pg_indexes
  const indexes = await prisma.$queryRaw<Array<{ indexname: string; indexdef: string }>>`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename = 'plan_spk'
      AND indexname = 'idx_plan_spk_customer_name_lower';
  `;

  if (indexes.length > 0) {
    console.log("Verifikasi Berhasil! Index aktif di database:");
    console.log(`- Nama: ${indexes[0].indexname}`);
    console.log(`- Definisi: ${indexes[0].indexdef}`);
  } else {
    console.warn("Peringatan: Index tidak ditemukan di pg_indexes setelah eksekusi DDL.");
  }
}

main()
  .catch((error) => {
    console.error("Gagal menerapkan functional index:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
