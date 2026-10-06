"use client";

import React, { useState } from "react";
import MobilePwaLayout from "@/components/templates/MobilePwaLayout";
import FormField from "@/components/molecules/FormField";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import ToastAlert from "@/components/molecules/ToastAlert";
import { TOYOTA_MODELS } from "@/lib/mockData";
import {
  User,
  Phone,
  Car,
  FileText,
  Send,
  AlertTriangle,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function InputProspekPage() {
  const [customerName, setCustomerName] = useState("");
  const [unitModel, setUnitModel] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [status, setStatus] = useState<"NEW" | "FOLLOW_UP" | "DEAL">("NEW");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Live Duplicate Check simulation based on sample phone numbers
  const cleanedPhone = phoneNumber.replace(/[^0-9]/g, "");
  const isKnownDuplicate =
    cleanedPhone.includes("81275649981") ||
    cleanedPhone.includes("81388214309") ||
    cleanedPhone.endsWith("9981") ||
    cleanedPhone.endsWith("4309");

  const isPhoneValid = cleanedPhone.length >= 9;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessToast(true);
      // Reset form
      setCustomerName("");
      setUnitModel("");
      setPhoneNumber("");
      setNotes("");
      setStatus("NEW");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 800);
  };

  return (
    <MobilePwaLayout salesName="Bagus Triyanto" isOnline={true}>
      <div className="space-y-4">
        {/* Success Feedback Toast Alert */}
        {showSuccessToast && (
          <ToastAlert
            type="success"
            title="Data Berhasil Tersimpan!"
            message="Notifikasi laporan prospek berhasil dikirimkan ke WhatsApp Group Sales Agung Toyota UjungBatu."
            onDismiss={() => setShowSuccessToast(false)}
          />
        )}

        {/* Page Title Header */}
        <div className="border-b border-slate-200/80 pb-3">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Input Laporan Prospek
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verifikasi duplikasi nomor HP real-time & teruskan notifikasi WhatsApp cabang.
          </p>
        </div>

        {/* Main Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Field 1: Nama Customer */}
          <FormField
            label="Nama Lengkap Customer"
            required
            requiredBadge
            hint="Sesuai KTP / STNK kendaraan"
          >
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Contoh: Bambang Sudiro, S.E."
              leftIcon={<User className="w-4 h-4" />}
              required
            />
          </FormField>

          {/* Field 2: Pilihan Unit Toyota */}
          <FormField
            label="Model / Varian Unit Toyota"
            required
            requiredBadge
            hint="Unit kendaraan yang diminati customer"
          >
            <Select
              value={unitModel}
              onChange={(e) => setUnitModel(e.target.value)}
              options={TOYOTA_MODELS}
              placeholder="-- Pilih Model Unit Toyota --"
              leftIcon={<Car className="w-4 h-4" />}
              required
            />
          </FormField>

          {/* Field 3: Nomor Handphone & Real-Time Duplicate Check */}
          <FormField
            label="Nomor Handphone (WhatsApp)"
            required
            requiredBadge
            hint="Masukkan nomor aktif untuk verifikasi duplikasi sistem"
          >
            <Input
              type="tel"
              inputMode="numeric"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="812-7564-9981"
              prefixText="+62"
              leftIcon={<Phone className="w-4 h-4" />}
              required
            />

            {/* Live Duplicate Warning Box */}
            {isPhoneValid && isKnownDuplicate && (
              <div className="mt-2 rounded-xl bg-amber-50 border border-amber-300 p-3 text-xs text-amber-950 flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-amber-900">
                    Peringatan: Potensi Nomor Duplikat!
                  </p>
                  <p className="text-[11px] leading-relaxed text-amber-900/90">
                    Nomor ini tercatat pernah diinput 28 hari lalu oleh{" "}
                    <strong>Rian Pratama (NPK-ATUB-202204)</strong>. Laporan tetap
                    dapat dikirim dan akan dicatat sebagai <em>touchpoint lanjutan</em>.
                  </p>
                </div>
              </div>
            )}

            {/* Live New Lead Confirmation */}
            {isPhoneValid && !isKnownDuplicate && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-600 font-medium animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Nomor baru belum terdaftar (Clean Lead).</span>
              </div>
            )}
          </FormField>

          {/* Field 4: Status Awal Prospek */}
          <FormField label="Status Awal Interaksi" required>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "NEW", label: "Baru (New Lead)", color: "blue" },
                { key: "FOLLOW_UP", label: "Follow Up", color: "amber" },
                { key: "DEAL", label: "Deal (SPK)", color: "emerald" },
              ].map((st) => (
                <button
                  key={st.key}
                  type="button"
                  onClick={() => setStatus(st.key as "NEW" | "FOLLOW_UP" | "DEAL")}
                  className={`h-11 rounded-xl text-xs font-semibold border transition-all duration-150 select-none ${
                    status === st.key
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-600/20"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </FormField>

          {/* Field 5: Catatan Interaksi / Lokasi */}
          <FormField
            label="Catatan Pertemuan / Kebutuhan Customer"
            optionalBadge
            hint="Lokasi prospecting, skema pembayaran (cash/kredit), atau DP"
          >
            <div className="relative">
              <div className="absolute top-3 left-3.5 text-slate-400 pointer-events-none">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Contoh: Ketemu di Koperasi Sawit Tandun, minat Zenix V CVT warna putih, minta simulasi kredit DP 20% tenor 4 tahun..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none text-slate-900 text-sm placeholder:text-slate-400 font-normal transition-all"
              />
            </div>
          </FormField>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-md shadow-blue-600/20"
              isLoading={isSubmitting}
              rightIcon={<Send className="w-4 h-4" />}
            >
              Kirim Laporan Prospek
            </Button>
          </div>

          {/* Security & Sync Footnote */}
          <div className="text-center pt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Data terenkripsi SSL 256-bit • Terkoneksi ke DMS Pusat</span>
          </div>
        </form>
      </div>
    </MobilePwaLayout>
  );
}
