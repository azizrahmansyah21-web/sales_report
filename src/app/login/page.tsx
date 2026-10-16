"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import ToyotaLogo from "@/components/atoms/ToyotaLogo";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import FormField from "@/components/molecules/FormField";
import {
  User,
  ArrowRight,
  ShieldCheck,
  MapPin,
  AlertCircle,
  KeyRound,
  Check,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Restore remembered NIP from browser localStorage on initial render
  useEffect(() => {
    try {
      const savedNip = localStorage.getItem("sales_remembered_nip");
      if (savedNip) {
        setIdentifier(savedNip);
        setRememberMe(true);
      }
    } catch {
      // Ignore localStorage access restrictions if any
    }
  }, []);

  // Preset shortcut filler for rapid field access & QA testing
  const fillPreset = (val: string) => {
    setIdentifier(val);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = identifier.trim();

    if (!cleanId) {
      setErrorMessage("NIP atau Kredensial wajib diisi");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Save or clear remembered NIP based on user preference
      if (rememberMe) {
        localStorage.setItem("sales_remembered_nip", cleanId);
      } else {
        localStorage.removeItem("sales_remembered_nip");
      }

      const result = await signIn("credentials", {
        identifier: cleanId,
        redirect: false,
      });

      if (result?.error) {
        setErrorMessage("NIP atau kredensial tidak ditemukan. Pastikan NIP terdaftar aktif di cabang 247.");
        setIsLoading(false);
        return;
      }

      // Read authenticated session to direct user to the appropriate screen
      const sessionResponse = await fetch("/api/auth/session");
      const sessionData = await sessionResponse.json();
      const role = sessionData?.user?.role;

      router.refresh();

      if (role === "ADMIN" || role === "SPV") {
        router.push("/admin/prospects");
      } else {
        router.push("/input");
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
            Plan SPK H-1
          </h2>
          <p className="text-xs text-slate-500 font-normal">
            Portal Terpadu Tim Sales, SPV & Administrasi Cabang
          </p>
        </div>

        {/* Card form */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-7 space-y-5">
          <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 flex items-start gap-2.5 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Login cepat tanpa kata sandi. Sales cukup masukkan NIP.
            </p>
          </div>

          {errorMessage && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3.5 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="NIP / Kredensial Masuk" required>
              <Input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Contoh: 143438A302"
                leftIcon={<User className="w-4 h-4 text-slate-400" />}
                required
                autoComplete="username"
                disabled={isLoading}
                autoFocus
              />
            </FormField>

            {/* Remember Me Option */}
            <div className="pt-0.5">
              <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors">
                  Ingat saya di browser ini (Sesi 60 Hari)
                </span>
              </label>
            </div>

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
              <span>Akses Cepat Uji Coba:</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillPreset("adh")}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-95 text-[11px] font-semibold text-slate-700 transition flex items-center justify-center gap-1"
              >
                <span>ADH</span>
                {identifier.toLowerCase() === "adh" && <Check className="w-3 h-3 text-blue-600" />}
              </button>
              <button
                type="button"
                onClick={() => fillPreset("101257A311")}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-95 text-[11px] font-semibold text-slate-700 transition flex items-center justify-center gap-1"
                title="Ahmad Sofian Panjaitan (SPV)"
              >
                <span>SPV</span>
                {identifier === "101257A311" && <Check className="w-3 h-3 text-blue-600" />}
              </button>
              <button
                type="button"
                onClick={() => fillPreset("143438A302")}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-95 text-[11px] font-semibold text-slate-700 transition flex items-center justify-center gap-1"
                title="Azis (Sales)"
              >
                <span>Azis (Sales)</span>
                {identifier === "143438A302" && <Check className="w-3 h-3 text-blue-600" />}
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
