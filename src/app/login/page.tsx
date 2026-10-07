"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import ToyotaLogo from "@/components/atoms/ToyotaLogo";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import FormField from "@/components/molecules/FormField";
import {
  User,
  Lock,
  ArrowRight,
  ShieldCheck,
  MapPin,
  AlertCircle,
  KeyRound,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick preset loader to simplify testing across all three roles
  const fillPreset = (user: string, pass: string) => {
    setIdentifier(user);
    setPassword(pass);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMessage("Username/email dan kata sandi wajib diisi");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await signIn("credentials", {
        identifier: identifier.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setErrorMessage("Akun atau kata sandi tidak cocok. Silakan periksa kembali.");
        setIsLoading(false);
        return;
      }

      // Read authenticated session to determine role-based destination
      const sessionResponse = await fetch("/api/auth/session");
      const sessionData = await sessionResponse.json();
      const role = sessionData?.user?.role;

      router.refresh();

      if (role === "ADMIN" || role === "SPV") {
        router.push("/admin/dashboard");
      } else {
        router.push("/beranda");
      }
    } catch (err) {
      console.error("[LoginPage] Auth error:", err);
      setErrorMessage("Terjadi gangguan koneksi ke server autentikasi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 antialiased selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Branch identity header */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex justify-center mb-1">
            <ToyotaLogo size="xl" />
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
            AGUNG TOYOTA
          </h1>

          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Cabang UjungBatu, Riau</span>
            </span>
          </div>

          <div className="w-12 h-1 bg-blue-600 mx-auto rounded-full my-1" />

          <h2 className="text-sm font-bold text-slate-800">
            Laporan SPK H-1
          </h2>
          <p className="text-xs text-slate-500 font-normal">
            Portal Terpadu Sales Advisor, SPV & Administrasi Cabang
          </p>
        </div>

        {/* Card form */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-7 space-y-5">
          <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 flex items-start gap-2.5 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Login tunggal untuk seluruh peran (Sales, SPV, dan Admin). Sistem otomatis
              mengarahkan ke menu sesuai hak akses Anda.
            </p>
          </div>

          {errorMessage && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3.5 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Username / Email / NIP" required>
              <Input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Contoh: admin, spv, atau bagus"
                leftIcon={<User className="w-4 h-4" />}
                required
                autoComplete="username"
                disabled={isLoading}
              />
            </FormField>

            <FormField label="Kata Sandi" required>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi akun"
                isPassword
                leftIcon={<Lock className="w-4 h-4" />}
                required
                autoComplete="current-password"
                disabled={isLoading}
              />
            </FormField>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-md mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Masuk ke Sistem
            </Button>
          </form>

          {/* Quick preset selector for review and QA */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2">
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              <span>Akun Uji Coba Cepat:</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillPreset("admin", "Admin@2024")}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-95 text-[11px] font-semibold text-slate-700 transition"
              >
                Branch Admin
              </button>
              <button
                type="button"
                onClick={() => fillPreset("spv", "Spv@2024")}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-95 text-[11px] font-semibold text-slate-700 transition"
              >
                Supervisor
              </button>
              <button
                type="button"
                onClick={() => fillPreset("bagus", "Sales@2024")}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-95 text-[11px] font-semibold text-slate-700 transition"
              >
                Senior Sales
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/80 text-[11px] text-slate-600 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Sistem SPK H-1 • Aktif Cabang UjungBatu</span>
          </div>
          <p className="text-xs text-slate-400">
            © Agung Toyota UjungBatu • PT Agung Automall
          </p>
        </div>
      </div>
    </div>
  );
}
