"use client";

import React, { useState, useTransition } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import FormField from "@/components/molecules/FormField";
import {
  DatabaseHealthStats,
  cleanMockProspectsAction,
  truncatePlanSpkAction,
  selectiveDeleteProspectsAction,
} from "@/lib/actions/databaseAdmin";
import {
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  FileSpreadsheet,
  Users2,
  HardDrive,
  Search,
  Lock,
  X,
} from "lucide-react";

interface DatabaseSettingsClientProps {
  initialStats: DatabaseHealthStats;
}

export default function DatabaseSettingsClient({
  initialStats,
}: DatabaseSettingsClientProps) {
  const [stats, setStats] = useState<DatabaseHealthStats>(initialStats);
  const [isPending, startTransition] = useTransition();

  // Feedback banner state
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Modal 1: Clean Mock Modal
  const [isMockModalOpen, setIsMockModalOpen] = useState(false);
  const [mockConfirmText, setMockConfirmText] = useState("");

  // Modal 2: Truncate Modal (Danger Zone)
  const [isTruncateModalOpen, setIsTruncateModalOpen] = useState(false);
  const [truncateConfirmText, setTruncateConfirmText] = useState("");
  const [truncatePassword, setTruncatePassword] = useState("");

  // Selective search keyword
  const [selectiveKeyword, setSelectiveKeyword] = useState("");

  // Handler: Clean Mock Data
  const handleCleanMock = () => {
    if (mockConfirmText.trim() !== "BERSIHKAN DATA MOCK") {
      setFeedback({
        type: "error",
        message: 'Teks konfirmasi harus persis: "BERSIHKAN DATA MOCK"',
      });
      return;
    }

    startTransition(async () => {
      const res = await cleanMockProspectsAction(mockConfirmText);
      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        setIsMockModalOpen(false);
        setMockConfirmText("");
        // Update local stats
        setStats((prev) => ({
          ...prev,
          totalProspects: Math.max(0, prev.totalProspects - (res.data?.deletedCount || 0)),
          mockProspectsCount: 0,
          mockProspectsList: [],
        }));
      } else {
        setFeedback({ type: "error", message: res.error });
      }
    });
  };

  // Handler: Truncate All Prospects
  const handleTruncate = () => {
    if (truncateConfirmText.trim() !== "HAPUS SEMUA DATA PROSPEK") {
      setFeedback({
        type: "error",
        message: 'Teks konfirmasi harus persis: "HAPUS SEMUA DATA PROSPEK"',
      });
      return;
    }

    if (!truncatePassword.trim()) {
      setFeedback({
        type: "error",
        message: "Kata sandi Superadmin wajib diisi.",
      });
      return;
    }

    startTransition(async () => {
      const res = await truncatePlanSpkAction(truncateConfirmText, truncatePassword);
      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        setIsTruncateModalOpen(false);
        setTruncateConfirmText("");
        setTruncatePassword("");
        // Reset local stats
        setStats((prev) => ({
          ...prev,
          totalProspects: 0,
          totalDuplicates: 0,
          mockProspectsCount: 0,
          mockProspectsList: [],
          byStatus: { PENDING: 0, BERHASIL: 0, BELUM_BERHASIL: 0 },
        }));
      } else {
        setFeedback({ type: "error", message: res.error });
      }
    });
  };

  // Handler: Selective Delete
  const handleSelectiveDelete = () => {
    if (!selectiveKeyword.trim() || selectiveKeyword.trim().length < 2) {
      setFeedback({
        type: "error",
        message: "Masukkan kata kunci pencarian minimal 2 karakter.",
      });
      return;
    }

    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus seluruh data yang mengandung kata kunci "${selectiveKeyword}"?`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const res = await selectiveDeleteProspectsAction(selectiveKeyword);
      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        setSelectiveKeyword("");
        // Decrement local stats
        setStats((prev) => ({
          ...prev,
          totalProspects: Math.max(0, prev.totalProspects - (res.data?.deletedCount || 0)),
        }));
      } else {
        setFeedback({ type: "error", message: res.error });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-start justify-between shadow-2xs animate-in fade-in ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-950"
              : "bg-rose-50 border-rose-300 text-rose-950"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <p className="text-xs font-semibold leading-relaxed">
              {feedback.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid 4 Kartu Metrik Kesehatan Database */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Prospects */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Tabel `plan_spk`</span>
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl lg:text-3xl font-black text-slate-900 mt-2">
            {stats.totalProspects}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>{stats.byStatus.BERHASIL} Closing</span>
            <span className="text-slate-300">•</span>
            <span>{stats.byStatus.PENDING} Menunggu</span>
          </div>
        </div>

        {/* Total Users */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Tabel `users`</span>
            <Users2 className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl lg:text-3xl font-black text-slate-900 mt-2">
            {stats.totalUsers}
          </p>
          <p className="text-[11px] text-purple-600 mt-2 font-medium">
            {stats.totalActiveSales} Sales Lapangan Aktif
          </p>
        </div>

        {/* Mock Prospects Status */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Data Uji Coba (Mock)</span>
            <AlertTriangle
              className={`w-4 h-4 ${
                stats.mockProspectsCount > 0 ? "text-amber-500" : "text-emerald-500"
              }`}
            />
          </div>
          <p
            className={`text-2xl lg:text-3xl font-black mt-2 ${
              stats.mockProspectsCount > 0 ? "text-amber-600" : "text-slate-900"
            }`}
          >
            {stats.mockProspectsCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            {stats.mockProspectsCount > 0
              ? "Perlu dibersihkan"
              : "Database 100% Bersih"}
          </p>
        </div>

        {/* PostgreSQL Storage & Connection */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Database Storage</span>
            <HardDrive className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl lg:text-3xl font-black text-slate-900 mt-2 font-mono">
            {stats.estimatedDbSize}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Connection Pool: Aktif</span>
          </div>
        </div>
      </div>

      {/* Panel 1: Pembersihan Data Uji Coba (Mock Data Hygiene) */}
      <div className="p-6 md:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900">
                Pembersihan Data Uji Coba & Mockup
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Menghapus entri yang mengandung label [mock up], data contoh, atau data latihan tanpa mengganggu prospek nasabah asli.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsMockModalOpen(true)}
            disabled={stats.mockProspectsCount === 0 || isPending}
            leftIcon={<Trash2 className="w-4 h-4 text-amber-600" />}
          >
            Bersihkan Data Mock ({stats.mockProspectsCount})
          </Button>
        </div>

        {stats.mockProspectsCount > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-700">
              Daftar Data Mock Terdeteksi (Maks 10 terakhir):
            </p>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Nama Customer</th>
                    <th className="p-3">Unit</th>
                    <th className="p-3">Catatan Admin</th>
                    <th className="p-3">Sales</th>
                    <th className="p-3">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.mockProspectsList.map((m) => (
                    <tr key={m.id} className="hover:bg-amber-50/40">
                      <td className="p-3 font-semibold text-slate-900">
                        {m.customerName}
                      </td>
                      <td className="p-3 text-slate-600">{m.unitName}</td>
                      <td className="p-3 text-amber-700 font-medium">
                        {m.keteranganAdmin || "-"}
                      </td>
                      <td className="p-3 text-slate-600">{m.salesName}</td>
                      <td className="p-3 text-slate-400 font-mono text-[11px]">
                        {new Date(m.createdAt).toLocaleDateString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs text-emerald-800 font-medium">
              Basis data bersih dari data tiruan / mock up. Seluruh record prospek yang tersimpan saat ini adalah data operasional riil.
            </p>
          </div>
        )}
      </div>

      {/* Panel 2: Penghapusan Selektif Berdasarkan Kata Kunci */}
      <div className="p-6 md:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">
            Penghapusan Selektif Berdasarkan Kata Kunci
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Cari dan hapus entri prospek tertentu berdasarkan kata kunci nama pelanggan atau catatan admin (misal: &quot;latihan&quot;, &quot;test123&quot;).
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 max-w-xl">
          <Input
            value={selectiveKeyword}
            onChange={(e) => setSelectiveKeyword(e.target.value)}
            placeholder="Ketik kata kunci yang ingin dihapus..."
            className="flex-1"
            disabled={isPending}
          />
          <Button
            variant="secondary"
            onClick={handleSelectiveDelete}
            disabled={!selectiveKeyword.trim() || isPending}
            isLoading={isPending}
            leftIcon={<Trash2 className="w-4 h-4 text-rose-600" />}
          >
            Hapus Data Terpilih
          </Button>
        </div>
      </div>

      {/* Panel 3: Danger Zone (TRUNCATE plan_spk) */}
      <div className="p-6 md:p-7 rounded-3xl bg-rose-50/60 border border-rose-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rose-700">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="text-base font-bold">
                Zona Bahaya: Reset Total Data Prospek (`TRUNCATE plan_spk`)
              </h2>
            </div>
            <p className="text-xs text-rose-900 leading-relaxed max-w-2xl">
              Tindakan ini akan <strong>mengosongkan seluruh baris tabel prospek ({stats.totalProspects} data)</strong> secara permanen. 
              Gunakan hanya saat reset pergantian tahun/siklus atau pembersihan total pasca-training. Akun karyawan, admin, dan pimpinan tetap aman 100%.
            </p>
          </div>

          <Button
            variant="danger"
            size="md"
            onClick={() => setIsTruncateModalOpen(true)}
            disabled={stats.totalProspects === 0 || isPending}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Kosongkan Seluruh Prospek
          </Button>
        </div>
      </div>

      {/* ─── MODAL 1: KONFIRMASI BERSIHKAN DATA MOCK ──────────────────────── */}
      {isMockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">
                  Konfirmasi Pembersihan Data Mock
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMockModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Sebanyak <strong>{stats.mockProspectsCount} data prospek mock up</strong> akan dihapus permanen dari basis data.
            </p>

            <FormField label='Ketik: "BERSIHKAN DATA MOCK" untuk konfirmasi' required>
              <Input
                value={mockConfirmText}
                onChange={(e) => setMockConfirmText(e.target.value)}
                placeholder="BERSIHKAN DATA MOCK"
                disabled={isPending}
                autoFocus
              />
            </FormField>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setIsMockModalOpen(false)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleCleanMock}
                disabled={mockConfirmText.trim() !== "BERSIHKAN DATA MOCK" || isPending}
                isLoading={isPending}
              >
                Bersihkan Sekarang
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: KONFIRMASI GANDA DANGER ZONE (TRUNCATE) ──────────────── */}
      {isTruncateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-rose-300 space-y-5">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">
                  Pengaman Ganda: Reset Seluruh Prospek
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTruncateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs leading-relaxed">
              <strong>PERINGATAN TINGKAT TINGGI:</strong>
              <p className="mt-1">
                Seluruh <strong>{stats.totalProspects} data rencana prospek dan realisasi SPK</strong> akan dikosongkan permanen. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="space-y-4">
              <FormField label='Langkah 1: Ketik persis: "HAPUS SEMUA DATA PROSPEK"' required>
                <Input
                  value={truncateConfirmText}
                  onChange={(e) => setTruncateConfirmText(e.target.value)}
                  placeholder="HAPUS SEMUA DATA PROSPEK"
                  disabled={isPending}
                />
              </FormField>

              <FormField label="Langkah 2: Verifikasi Kata Sandi Superadmin" required>
                <Input
                  type="password"
                  value={truncatePassword}
                  onChange={(e) => setTruncatePassword(e.target.value)}
                  placeholder="Masukkan kata sandi atau Master PIN..."
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  disabled={isPending}
                />
              </FormField>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setIsTruncateModalOpen(false)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleTruncate}
                disabled={
                  truncateConfirmText.trim() !== "HAPUS SEMUA DATA PROSPEK" ||
                  !truncatePassword.trim() ||
                  isPending
                }
                isLoading={isPending}
              >
                Saya Mengerti & Kosongkan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
