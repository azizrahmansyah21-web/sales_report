"use client";

import React, { useState } from "react";
import AdminDashboardLayout from "@/components/templates/AdminDashboardLayout";
import Button from "@/components/atoms/Button";
import {
  ShieldAlert,
  MessageCircle,
  Database,
  Save,
  CheckCircle2,
  Sliders,
  Bell,
  RefreshCw,
  Lock,
  Smartphone,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"DUPLICATE" | "WHATSAPP" | "DMS">("DUPLICATE");

  // Duplicate settings state
  const [isEngineActive, setIsEngineActive] = useState(true);
  const [phoneExactMatch, setPhoneExactMatch] = useState(true);
  const [nameSimilarity, setNameSimilarity] = useState(85);
  const [timeWindowDays, setTimeWindowDays] = useState(30);
  const [duplicateAction, setDuplicateAction] = useState<"WARN" | "LOCK" | "REJECT">("WARN");

  // WhatsApp settings state
  const [waConnected, setWaConnected] = useState(true);
  const [notifyNewLead, setNotifyNewLead] = useState(true);
  const [notifyDuplicate, setNotifyDuplicate] = useState(true);
  const [notifyDeal, setNotifyDeal] = useState(true);

  // Save state
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <AdminDashboardLayout
      title="Pengaturan Sistem"
      subtitle="Konfigurasi Mesin Deteksi Duplikasi, WhatsApp Gateway & Integrasi DMS Pusat"
      duplicateCount={3}
    >
      <div className="space-y-6">
        {/* Saved Alert Banner */}
        {isSaved && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center justify-between shadow-2xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <span className="font-bold block">
                  Perubahan Pengaturan Berhasil Disimpan!
                </span>
                <span>
                  Konfigurasi mesin deteksi dan WhatsApp Gateway telah diperbarui di server cabang.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("DUPLICATE")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === "DUPLICATE"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Aturan Deteksi Duplikasi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("WHATSAPP")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === "WHATSAPP"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Gateway & Notifikasi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("DMS")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === "DMS"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Integrasi DMS Pusat & Keamanan</span>
          </button>
        </div>

        {/* TAB 1: DUPLICATE ENGINE */}
        {activeTab === "DUPLICATE" && (
          <div className="space-y-5">
            {/* Master Engine Toggle */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Mesin Deteksi Duplikasi Real-Time
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Memindai kecocokan nomor HP dan nama customer seketika saat sales menginput data di form PWA.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isEngineActive}
                  onChange={(e) => setIsEngineActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Detection Parameter Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Rule 1: Phone Normalization */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded uppercase">
                  Parameter 1
                </span>
                <h4 className="font-bold text-sm text-slate-900">
                  Normalisasi Nomor HP (E.164)
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Otomatis menghapus strip/spasi dan mengonversi format awalan{" "}
                  <code>08xx</code> ke <code>+628xx</code> untuk pencocokan 100% presisi.
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Kecocokan Eksak (100% Match)</span>
                </div>
              </div>

              {/* Rule 2: Levenshtein Distance Slider */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded uppercase">
                    Parameter 2
                  </span>
                  <span className="text-xs font-black text-purple-700">
                    {nameSimilarity}%
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">
                  Kemiripan Nama (Fuzzy Matching)
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Toleransi salah ketik atau penulisan gelar menggunakan Levenshtein Distance.
                </p>
                <input
                  type="range"
                  min="70"
                  max="100"
                  step="5"
                  value={nameSimilarity}
                  onChange={(e) => setNameSimilarity(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Longgar (70%)</span>
                  <span>Ketat (100%)</span>
                </div>
              </div>

              {/* Rule 3: Time Window */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded uppercase">
                  Parameter 3
                </span>
                <h4 className="font-bold text-sm text-slate-900">
                  Jendela Waktu Audit (Time Window)
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Rentang waktu pelacakan prospek sebelum dinyatakan cold lead (hangus).
                </p>
                <select
                  value={timeWindowDays}
                  onChange={(e) => setTimeWindowDays(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50"
                >
                  <option value={14}>14 Hari (Dua Minggu)</option>
                  <option value={30}>30 Hari (Default Dealer Toyota)</option>
                  <option value={60}>60 Hari (Dua Bulan)</option>
                  <option value={90}>90 Hari (Satu Kuartal)</option>
                </select>
              </div>
            </div>

            {/* Rule 4: Action on Duplicate */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
              <h4 className="font-bold text-sm text-slate-900">
                Tindakan Sistem Saat Duplikasi Terdeteksi
              </h4>
              <p className="text-xs text-slate-500">
                Pilih perilaku otomatis saat nomor telepon ganda dimasukkan oleh sales advisor lain:
              </p>

              <div className="space-y-2 pt-1">
                {[
                  {
                    key: "WARN",
                    title: "Beri Peringatan Lembut, Izinkan Simpan (Rekomendasi Dealer)",
                    desc: "Sales mendapat feedback peringatan kuning di form, data tetap tersimpan sebagai touchpoint lanjutan dan masuk antrean mediasi admin.",
                  },
                  {
                    key: "LOCK",
                    title: "Kunci Lead & Wajibkan Persetujuan Supervisor",
                    desc: "Data tertahan hingga Branch Manager Budi Santoso menyetujui izin input.",
                  },
                  {
                    key: "REJECT",
                    title: "Tolak Input Baru Secara Otomatis",
                    desc: "Sistem memblokir input dan mengarahkan sales untuk berkoordinasi dengan pemegang lead pertama.",
                  },
                ].map((act) => (
                  <label
                    key={act.key}
                    onClick={() => setDuplicateAction(act.key as "WARN" | "LOCK" | "REJECT")}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      duplicateAction === act.key
                        ? "bg-blue-50/50 border-blue-400 ring-1 ring-blue-400"
                        : "bg-slate-50/50 border-slate-200 hover:bg-slate-100/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="duplicateAction"
                      checked={duplicateAction === act.key}
                      onChange={() => {}}
                      className="mt-1 text-blue-600 focus:ring-blue-600"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{act.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {act.desc}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WHATSAPP GATEWAY */}
        {activeTab === "WHATSAPP" && (
          <div className="space-y-5">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase">
                  Status Gateway
                </span>
                <h3 className="font-extrabold text-sm text-slate-900 mt-1">
                  WhatsApp Business Bot Cabang UjungBatu
                </h3>
                <p className="text-xs text-slate-500">
                  Target Grup: <strong>[ATUB] Sales Lapangan Cabang 247</strong> (+62 822-8888-0247)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-700">ONLINE</span>
              </div>
            </div>

            {/* Notification Toggles & WhatsApp Message Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Event Toggles */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
                <h4 className="font-bold text-sm text-slate-900">
                  Pemicu Notifikasi Otomatis (Event Webhook)
                </h4>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Prospek Baru Didaftarkan
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Kirim ringkasan lead seketika saat sales submit form.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifyNewLead}
                      onChange={(e) => setNotifyNewLead(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-300 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-amber-950 block">
                        ⚠️ Duplikasi Nomor HP Terdeteksi
                      </span>
                      <span className="text-[11px] text-amber-800">
                        Broadcast peringatan otomatis ke grup & mention sales terkait.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifyDuplicate}
                      onChange={(e) => setNotifyDuplicate(e.target.checked)}
                      className="rounded text-amber-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-300 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block">
                        🎉 Deal SPK Closing
                      </span>
                      <span className="text-[11px] text-emerald-800">
                        Ucapan selamat & update leaderboard target cabang.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifyDeal}
                      onChange={(e) => setNotifyDeal(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                  </label>
                </div>
              </div>

              {/* Right: Realistic WhatsApp Bubble Preview */}
              <div className="p-5 rounded-2xl bg-slate-800 text-white shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                    <span className="font-semibold uppercase tracking-wider text-[10px]">
                      Pratinjau Format Chat WhatsApp
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <Smartphone className="w-3.5 h-3.5" />
                      Live Template
                    </span>
                  </div>

                  {/* WA Chat Bubble Container */}
                  <div className="p-3.5 rounded-2xl bg-[#d9fdd3] text-[#111b21] shadow-md border border-[#c0e8ba] text-xs space-y-1.5 font-sans leading-relaxed">
                    <p className="font-bold text-[#075e54]">
                      🚨 [AGUNG TOYOTA UJUNGBATU]
                    </p>
                    <p className="font-bold">LAPORAN PROSPEK MASUK</p>
                    <p className="text-[11px] text-slate-600">----------------------------------------</p>
                    <p>
                      <strong>Customer:</strong> Bambang Sudiro, S.E.
                    </p>
                    <p>
                      <strong>Nomor HP:</strong> +62 812-7564-9981
                    </p>
                    <p>
                      <strong>Unit:</strong> Kijang Innova Zenix 2.0 V CVT
                    </p>
                    <p>
                      <strong>Sales:</strong> Bagus Triyanto (NPK-ATUB-202108)
                    </p>
                    <p>
                      <strong>Status:</strong> Follow Up (Minta Test Drive)
                    </p>
                    <p>
                      <strong>Catatan:</strong> Ketemu di KUD Sawit Tandun
                    </p>
                    <p className="text-[11px] text-slate-600">----------------------------------------</p>
                    <div className="p-2 rounded-lg bg-[#fff3cd] text-[#856404] font-semibold text-[11px]">
                      ⚠️ <strong>PERINGATAN DUPLIKASI:</strong> Nomor ini pernah
                      tercatat 28 hari lalu oleh Rian Pratama (NPK-ATUB-202204).
                    </div>
                    <div className="text-right text-[10px] text-slate-500 pt-1">
                      13:45 WIB • Terkirim via DMS Bot
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-3 text-center">
                  Template ini otomatis terkirim melalui API WhatsApp Cloud Gateway.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DMS INTEGRATION */}
        {activeTab === "DMS" && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900">
                Koneksi Agung Automall Central DMS (Pekanbaru Cloud Hub)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-500 font-medium">Endpoint Server:</span>
                  <p className="font-mono font-bold text-slate-900">
                    https://dms-hub.agungtoyota.co.id/api/v2/branch/247
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-slate-500 font-medium">Status Enkripsi:</span>
                  <p className="font-bold text-emerald-600 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span>TLS 1.3 / AES-256 Bit Enkripsi Aktif</span>
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                <strong className="block">Sinkronisasi Basis Data:</strong>
                <p className="leading-relaxed">
                  Data prospek dan status SPK tersinkronisasi dua arah setiap 15 menit
                  ke database pusat PT Agung Automall. Seluruh audit trail deteksi duplikasi
                  disimpan selama minimal 3 tahun sesuai regulasi TAM.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Action Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Perubahan berlaku untuk seluruh Sales Advisor Cabang UjungBatu (Cabang 247).
          </p>

          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            rightIcon={<Save className="w-4 h-4" />}
          >
            Simpan Perubahan Pengaturan
          </Button>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
