"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ToyotaLogo from "@/components/atoms/ToyotaLogo";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import FormField from "@/components/molecules/FormField";
import {
  User,
  Lock,
  Fingerprint,
  ArrowRight,
  ShieldCheck,
  MapPin,
  HelpCircle,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [npk, setNpk] = useState("NPK-ATUB-202108");
  const [password, setPassword] = useState("••••••••");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/beranda");
    }, 600);
  };

  const handleBiometric = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/beranda");
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 antialiased selection:bg-blue-600 selection:text-white">
      {/* Mobile-sized Container */}
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Dealer Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex justify-center mb-2">
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
            Sistem Pelaporan Prospek Sales
          </h2>
          <p className="text-xs text-slate-500 font-normal">
            Aplikasi PWA Internal Sales Advisor & Fleet Specialist
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-7 space-y-5">
          {/* Internal Security Notice */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 flex items-start gap-2.5 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Khusus Sales Advisor resmi Agung Automall UjungBatu. Gunakan NPK
              terdaftar untuk sinkronisasi target dan prospek.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NPK / Email Field */}
            <FormField label="NPK / Nomor Induk Karyawan" required>
              <Input
                value={npk}
                onChange={(e) => setNpk(e.target.value)}
                placeholder="Contoh: NPK-ATUB-202108"
                leftIcon={<User className="w-4 h-4" />}
                required
              />
            </FormField>

            {/* Kata Sandi Field */}
            <FormField label="Kata Sandi Akun" required>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                isPassword
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
            </FormField>

            <div className="flex justify-end">
              <Link
                href="#"
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Lupa kata sandi?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-md"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Masuk ke Sistem Sales
            </Button>

            {/* Biometric Quick Login Button */}
            <button
              type="button"
              onClick={handleBiometric}
              className="w-full h-11 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Fingerprint className="w-4 h-4 text-blue-600" />
              <span>Masuk Cepat via Fingerprint / Face ID</span>
            </button>
          </form>

          {/* Quick Admin Portal Link */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Bukan Sales Advisor?</span>
            <Link
              href="/admin/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Login Portal Admin &rarr;
            </Link>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="text-center mt-6 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/80 text-[11px] text-slate-600 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>v2.4.0 PWA Mode Active • Offline-Ready</span>
          </div>

          <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Kendala akun? Hubungi IT Support Cabang UjungBatu</span>
          </p>
        </div>
      </div>
    </div>
  );
}
