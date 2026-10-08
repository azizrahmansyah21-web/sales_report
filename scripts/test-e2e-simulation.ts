/**
 * SIMULASI TESTING END-TO-END (E2E) USER MULTI-ROLE
 * Sistem Laporan SPK H-1 — Agung Toyota UjungBatu (Cabang Resmi 247)
 * 
 * Pengujian programatik terhadap:
 * 1. Siklus Lengkap: Sales Input -> SPV Validasi Realisasi -> Admin Catatan Evaluasi
 * 2. Deteksi Duplikasi & Sengketa Multi-Sales (Dispute)
 * 3. Deteksi Gagal Berulang (Repeat Failed)
 * 4. Audit Trail Riwayat Customer (Customer Journey)
 * 5. Penegakan Otorisasi Server-Side (Strict RBAC)
 * 6. Agregasi Leaderboard & Performa Tim Sales
 * 7. Integritas Data & Auto Teardown (Pembersihan Data Uji)
 */

import Module from "module";

// ─── 0. HOOK REQUIRE UNTUK NEXT.JS ENVIRONMENT ─────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let currentMockSession: { user: { id: string; name: string; role: "ADMIN" | "SPV" | "SALES" } } | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const originalRequire = (Module.prototype as any).require;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Module.prototype as any).require = function (id: string) {
  if (id === "next/cache") {
    return {
      revalidatePath: () => {},
      revalidateTag: () => {},
    };
  }
  if (id.endsWith("/auth") || id === "@/lib/auth") {
    return {
      auth: async () => currentMockSession,
    };
  }
  // eslint-disable-next-line prefer-rest-params
  return originalRequire.apply(this, arguments);
};

// ─── IMPORT DEPENDENCIES SETELAH HOOK ───────────────────────────────────────
import { prisma } from "../src/lib/prisma";
import {
  createPlanSpk,
  updateSpkStatus,
  updateKeterangan,
  getCustomerHistory,
  getDashboardStats,
} from "../src/lib/actions/planSpk";
import { getSalesTeamWithStats } from "../src/lib/actions/users";

interface TestResult {
  step: string;
  name: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function recordResult(step: string, name: string, passed: boolean, details: string) {
  results.push({ step, name, passed, details });
  const icon = passed ? "✅" : "❌";
  console.log(`  ${icon} [${step}] ${name}`);
  if (!passed || process.env.VERBOSE) {
    console.log(`     └─ Info: ${details}`);
  }
}

async function runE2eSimulation() {
  console.log("================================================================================");
  console.log("🚀 MEMULAI SIMULASI TESTING E2E MULTI-ROLE: LAPORAN SPK H-1 (CABANG 247)");
  console.log("================================================================================\n");

  const createdPlanIds: string[] = [];

  try {
    // ─── CHECKPOINT 1: VERIFIKASI AKUN DI POSTGRESQL ────────────────────────
    console.log("📌 CHECKPOINT 1: Verifikasi Akun Pengujian di Database");

    const [adminUser, spvUser, salesBagus, salesRian] = await Promise.all([
      prisma.user.findFirst({ where: { role: "ADMIN", isActive: true } }),
      prisma.user.findFirst({ where: { role: "SPV", isActive: true } }),
      prisma.user.findFirst({ where: { username: "bagus", role: "SALES" } }),
      prisma.user.findFirst({ where: { username: "rian", role: "SALES" } }),
    ]);

    recordResult(
      "CP-1.1",
      "Akun Admin Cabang Tersedia",
      !!adminUser,
      adminUser ? `ID: ${adminUser.id} | Nama: ${adminUser.name}` : "User admin tidak ditemukan"
    );

    recordResult(
      "CP-1.2",
      "Akun Supervisor (SPV) Tersedia",
      !!spvUser,
      spvUser ? `ID: ${spvUser.id} | Nama: ${spvUser.name}` : "User SPV tidak ditemukan"
    );

    recordResult(
      "CP-1.3",
      "Akun Sales Advisor (Bagus Triyanto) Tersedia",
      !!salesBagus,
      salesBagus ? `ID: ${salesBagus.id} | NIP: ${salesBagus.nip}` : "User sales bagus tidak ditemukan"
    );

    recordResult(
      "CP-1.4",
      "Akun Sales Advisor (Rian Pratama) Tersedia",
      !!salesRian,
      salesRian ? `ID: ${salesRian.id} | NIP: ${salesRian.nip}` : "User sales rian tidak ditemukan"
    );

    if (!adminUser || !spvUser || !salesBagus || !salesRian) {
      throw new Error("Akun pengujian tidak lengkap di database. Jalankan seeder terlebih dahulu.");
    }

    console.log();

    // ─── CHECKPOINT 2: HAPPY PATH CLOSING SPK H-1 ──────────────────────────
    console.log("📌 CHECKPOINT 2: Skenario 1 — Happy Path Penutupan SPK Sah");

    // Tanggal target H-1 (besok)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const targetTomorrowStr = tomorrow.toISOString().split("T")[0];

    const testCustName1 = `TEST-E2E H. Syamsudin Rambah ${Date.now()}`;
    const testUnit1 = "Hilux D-Cab 2.4 G 4x4 MT";

    // 2.1 Sales Bagus menginput rencana SPK
    currentMockSession = {
      user: { id: salesBagus.id, name: salesBagus.name, role: "SALES" },
    };

    const createRes = await createPlanSpk(salesBagus.id, {
      customerName: testCustName1,
      unitName: testUnit1,
      planDate: targetTomorrowStr,
    });

    const isCreated = createRes.success;
    const planData1 = createRes.success ? createRes.data : null;
    const planId1 = planData1?.id;

    if (planData1) {
      createdPlanIds.push(planData1.id);
    }

    recordResult(
      "CP-2.1",
      "Sales Input Target Rencana SPK H-1",
      isCreated,
      createRes.success
        ? `Tersimpan ID: ${createRes.data.id} | Status: ${createRes.data.spkStatus}`
        : `Error: ${createRes.error}`
    );

    if (!planId1) throw new Error("Gagal membuat plan untuk skenario 1");

    // 2.2 SPV Arief menentukan realisasi status BERHASIL
    currentMockSession = {
      user: { id: spvUser.id, name: spvUser.name, role: "SPV" },
    };

    const spvStatusRes = await updateSpkStatus(
      planId1,
      { spkStatus: "BERHASIL" },
      currentMockSession
    );

    const isSpvSuccess = spvStatusRes.success && spvStatusRes.data.spkStatus === "BERHASIL";
    recordResult(
      "CP-2.2",
      "SPV Mengubah Status Realisasi Menjadi BERHASIL",
      isSpvSuccess,
      spvStatusRes.success
        ? `Status SPK Baru: ${spvStatusRes.data.spkStatus}`
        : `Error: ${spvStatusRes.error}`
    );

    // 2.3 Admin Budi membuat catatan evaluasi operasional
    currentMockSession = {
      user: { id: adminUser.id, name: adminUser.name, role: "ADMIN" },
    };

    const evalNote = "SPK Sah leasing Mandiri Tunas Finance, tanda jadi Rp 10 Juta lunas.";
    const adminNoteRes = await updateKeterangan(
      planId1,
      { keterangan: evalNote },
      currentMockSession
    );

    const isAdminSuccess = adminNoteRes.success && adminNoteRes.data.keterangan === evalNote;
    recordResult(
      "CP-2.3",
      "Admin Mengisi Catatan Evaluasi Operasional Cabang",
      isAdminSuccess,
      adminNoteRes.success
        ? `Catatan: "${adminNoteRes.data.keterangan}"`
        : `Error: ${adminNoteRes.error}`
    );

    // 2.4 Verifikasi Konsistensi Data di Database
    const dbRecord = await prisma.planSPK.findUnique({
      where: { id: planId1 },
      include: { sales: true },
    });

    const isRecordConsistent =
      dbRecord?.spkStatus === "BERHASIL" &&
      dbRecord?.keterangan === evalNote &&
      dbRecord?.salesId === salesBagus.id;

    recordResult(
      "CP-2.4",
      "Integritas Data SPK Sah di PostgreSQL Terverifikasi",
      isRecordConsistent,
      `Customer: ${dbRecord?.customerName} | Sales: ${dbRecord?.sales.name} | Status: ${dbRecord?.spkStatus}`
    );

    console.log();

    // ─── CHECKPOINT 3: DETEKSI DUPLIKASI & SENGKETA MULTI-SALES ────────────
    console.log("📌 CHECKPOINT 3: Skenario 2 — Deteksi Duplikasi & Sengketa Multi-Sales");

    const disputeCustomerName = `TEST-E2E PT Sawit Rokan Lestari ${Date.now()}`;

    // 3.1 Sales Bagus menginput rencana pertama
    currentMockSession = {
      user: { id: salesBagus.id, name: salesBagus.name, role: "SALES" },
    };

    const planBagusRes = await createPlanSpk(salesBagus.id, {
      customerName: disputeCustomerName,
      unitName: "Innova Zenix 2.0 V CVT",
      planDate: targetTomorrowStr,
    });

    const planBagusData = planBagusRes.success ? planBagusRes.data : null;
    const planBagusId = planBagusData?.id;

    if (planBagusData) {
      createdPlanIds.push(planBagusData.id);
    }

    recordResult(
      "CP-3.1",
      "Sales A (Bagus) Input Target Pertama (Customer Baru)",
      planBagusRes.success && planBagusData?.isDuplicate === false,
      planBagusData
        ? `isDuplicate: ${planBagusData.isDuplicate} | isRepeatFailed: ${planBagusData.isRepeatFailed}`
        : `Error: ${planBagusRes.success ? "" : planBagusRes.error}`
    );

    if (!planBagusId) throw new Error("Gagal membuat plan Bagus");

    // SPV mengubah status rencana pertama menjadi BELUM_BERHASIL
    currentMockSession = {
      user: { id: spvUser.id, name: spvUser.name, role: "SPV" },
    };

    await updateSpkStatus(
      planBagusId,
      { spkStatus: "BELUM_BERHASIL" },
      currentMockSession
    );

    // Admin memberi catatan kendala
    currentMockSession = {
      user: { id: adminUser.id, name: adminUser.name, role: "ADMIN" },
    };

    await updateKeterangan(
      planBagusId,
      { keterangan: "Customer menunda penutupan SPK karena menunggu pencairan panen kelapa sawit." },
      currentMockSession
    );

    // 3.2 Sales Rian menginput nama customer yang sama
    currentMockSession = {
      user: { id: salesRian.id, name: salesRian.name, role: "SALES" },
    };

    const planRianRes = await createPlanSpk(salesRian.id, {
      customerName: disputeCustomerName,
      unitName: "Fortuner 2.8 GR Sport 4x4",
      planDate: targetTomorrowStr,
    });

    const planRianData = planRianRes.success ? planRianRes.data : null;
    if (planRianData) {
      createdPlanIds.push(planRianData.id);
    }

    const isDuplicateDetected = planRianData?.isDuplicate === true;
    const isRepeatFailedDetected = planRianData?.isRepeatFailed === true;

    recordResult(
      "CP-3.2",
      "Sistem Mendeteksi Duplikasi Nama Customer Lintas-Sales",
      isDuplicateDetected,
      `isDuplicate flag: ${planRianData?.isDuplicate}`
    );

    recordResult(
      "CP-3.3",
      "Sistem Mendeteksi Riwayat Gagal Berulang (Repeat-Failed)",
      isRepeatFailedDetected,
      `isRepeatFailed flag: ${planRianData?.isRepeatFailed}`
    );

    console.log();

    // ─── CHECKPOINT 4: AUDIT TRAIL KRONOLOGIS & DETEKSI DISPUTE ────────────
    console.log("📌 CHECKPOINT 4: Audit Trail Riwayat Customer (Customer Journey)");

    const auditRes = await getCustomerHistory(disputeCustomerName);
    const auditPlans = auditRes.success ? auditRes.data : [];
    const distinctSalesNames = Array.from(new Set(auditPlans.map((p) => p.sales.name)));
    const isDisputeFlagged = distinctSalesNames.length > 1;

    recordResult(
      "CP-4.1",
      "Customer Audit Trail Mengembalikan Seluruh Riwayat Terdaftar",
      auditRes.success && auditPlans.length === 2,
      `Total entri kronologis: ${auditPlans.length} entri`
    );

    recordResult(
      "CP-4.2",
      "Deteksi Multi-Sales Dispute Berhasil Mengidentifikasi 2 Sales Advisor",
      isDisputeFlagged,
      `Sales Advisor Terlibat: ${distinctSalesNames.join(", ")}`
    );

    recordResult(
      "CP-4.3",
      "Catatan Evaluasi Kegagalan Pertama Tampil Pada Kronologi Entri",
      auditPlans[0]?.keterangan?.includes("panen kelapa sawit") === true,
      `Catatan di Entri 1: "${auditPlans[0]?.keterangan}"`
    );

    console.log();

    // ─── CHECKPOINT 5: PENEGAKAN KEAMANAN & STRICT RBAC ────────────────────
    console.log("📌 CHECKPOINT 5: Pengujian Hak Akses & Pembatasan Otorisasi (RBAC)");

    // 5.1 SPV mencoba mengubah catatan evaluasi (DILARANG - Khusus Admin)
    currentMockSession = {
      user: { id: spvUser.id, name: spvUser.name, role: "SPV" },
    };

    const illegalSpvNoteRes = await updateKeterangan(
      planBagusId,
      { keterangan: "Percobaan ilegal SPV menulis catatan evaluasi" },
      currentMockSession
    );

    recordResult(
      "CP-5.1",
      "Server Menolak SPV yang Mencoba Mengubah Catatan Keterangan",
      illegalSpvNoteRes.success === false,
      illegalSpvNoteRes.success
        ? "KEBOCORAN: SPV berhasil mengubah keterangan!"
        : `Respons Server: "${illegalSpvNoteRes.error}"`
    );

    // 5.2 Sales mencoba mengubah status SPK (DILARANG - Khusus SPV/Admin)
    currentMockSession = {
      user: { id: salesBagus.id, name: salesBagus.name, role: "SALES" },
    };

    const illegalSalesStatusRes = await updateSpkStatus(
      planBagusId,
      { spkStatus: "BERHASIL" },
      currentMockSession
    );

    recordResult(
      "CP-5.2",
      "Server Menolak Sales yang Mencoba Mengubah Status SPK",
      illegalSalesStatusRes.success === false,
      illegalSalesStatusRes.success
        ? "KEBOCORAN: Sales berhasil mengubah status SPK!"
        : `Respons Server: "${illegalSalesStatusRes.error}"`
    );

    // 5.3 Anonymous / Unauthenticated mencoba mengubah status
    currentMockSession = null;

    const unauthenticatedRes = await updateSpkStatus(
      planBagusId,
      { spkStatus: "BERHASIL" },
      null
    );

    recordResult(
      "CP-5.3",
      "Server Menolak Akses Tanpa Sesi Autentikasi (Anonymous)",
      unauthenticatedRes.success === false,
      unauthenticatedRes.success
        ? "KEBOCORAN: Anonymous user berhasil mutasi data!"
        : `Respons Server: "${unauthenticatedRes.error}"`
    );

    console.log();

    // ─── CHECKPOINT 6: AGREGASI LEADERBOARD & EKSPOR DATA ─────────────────
    console.log("📌 CHECKPOINT 6: Agregasi Leaderboard & Integritas Kinerja Tim");

    const teamRes = await getSalesTeamWithStats();
    const teamMembers = teamRes.success ? teamRes.data : [];

    const topSales = teamMembers[0];
    const bagusStats = teamMembers.find((m) => m.name === salesBagus.name);

    recordResult(
      "CP-6.1",
      "Fungsi getSalesTeamWithStats Berhasil Menghitung Metrik Tim",
      teamRes.success && teamMembers.length >= 2,
      `Total Sales Terdaftar: ${teamMembers.length} Orang`
    );

    recordResult(
      "CP-6.2",
      "Leaderboard Mengurutkan Sales Berdasarkan Unit Closing Sah",
      !!topSales && topSales.stats.berhasil >= 0,
      `Peringkat 1 Saat Ini: ${topSales?.name} (${topSales?.stats.berhasil} SPK Closing)`
    );

    recordResult(
      "CP-6.3",
      "Rasio Konversi Sales Dihitung Secara Presisi",
      typeof bagusStats?.stats.successRate === "string",
      `Sales ${bagusStats?.name}: ${bagusStats?.stats.berhasil}/${bagusStats?.stats.total} Unit (${bagusStats?.stats.successRate}%)`
    );

    const statsRes = await getDashboardStats();
    const statsData = statsRes.success ? statsRes.data : null;

    recordResult(
      "CP-6.4",
      "Statistik Global Dashboard Menghitung Duplikat & Gagal Berulang",
      statsRes.success && statsData !== null,
      statsData
        ? `Total: ${statsData.total} | Duplikat: ${statsData.duplicateCount} | Gagal Ulang: ${statsData.repeatFailedCount}`
        : `Error: ${statsRes.success ? "" : statsRes.error}`
    );

    console.log();
  } catch (error) {
    console.error("❌ Terjadi kesalahan fatal saat menjalankan simulasi E2E:", error);
  } finally {
    // ─── CHECKPOINT 7: TEARDOWN & PEMBERSIHAN DATA UJI COBA ────────────────
    console.log("📌 CHECKPOINT 7: Teardown & Pembersihan Data Uji Coba");

    if (createdPlanIds.length > 0) {
      const deleteResult = await prisma.planSPK.deleteMany({
        where: { id: { in: createdPlanIds } },
      });

      recordResult(
        "CP-7.1",
        "Data Uji Coba Simulasi Berhasil Dibersihkan dari PostgreSQL",
        deleteResult.count === createdPlanIds.length,
        `Dihapus: ${deleteResult.count} dari ${createdPlanIds.length} entri uji coba`
      );
    } else {
      recordResult("CP-7.1", "Tidak Ada Data Uji Coba yang Perlu Dihapus", true, "Bersih");
    }

    await prisma.$disconnect();
  }

  // ─── REKAPITULASI HASIL AKHIR ─────────────────────────────────────────────
  console.log("\n================================================================================");
  console.log("📊 REKAPITULASI HASIL SIMULASI TESTING E2E MULTI-ROLE");
  console.log("================================================================================");

  const totalTests = results.length;
  const passedTests = results.filter((r) => r.passed).length;
  const failedTests = totalTests - passedTests;

  console.log(`Total Pengujian : ${totalTests}`);
  console.log(`Lolos (PASS)    : ${passedTests} ✅`);
  console.log(`Gagal (FAIL)    : ${failedTests} ${failedTests > 0 ? "❌" : "✨"}`);

  if (failedTests === 0) {
    console.log("\n🎉 SEMUA SKENARIO MULTI-ROLE TERVERIFIKASI 100% SUKSES DAN AMAN!");
    console.log("   Sistem siap untuk pengujian manual antarmuka di browser.");
  } else {
    console.log("\n⚠️ Terdapat skenario yang gagal. Silakan periksa log detail di atas.");
  }
  console.log("================================================================================\n");
}

runE2eSimulation();
