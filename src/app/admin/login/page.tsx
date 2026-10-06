"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ToyotaLogo from "@/components/atoms/ToyotaLogo";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import FormField from "@/components/molecules/FormField";
import { Mail, Lock, ArrowRight, Smartphone } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("budi.santoso@agungtoyota.co.id");
  const [password, setPassword] = useState("••••••••");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/admin/dashboard");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4 antialiased selection:bg-blue-600 selection:text-white">
      {/* Centered Login Card */}
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-sm p-7 sm:p-9 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex justify-center mb-1">
            <ToyotaLogo size="lg" />
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Agung Toyota UjungBatu
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Masuk ke Sistem
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <FormField label="EMAIL" required>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@agungtoyota.co.id"
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              required
            />
          </FormField>

          {/* Kata Sandi Field */}
          <FormField label="PASSWORD" required>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi"
              isPassword
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              required
            />
          </FormField>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-sm"
              isLoading={isLoading}
            >
              Masuk
            </Button>
          </div>
        </form>

        {/* Quick Link to Sales */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Portal Sales Lapangan?</span>
          <Link
            href="/login"
            className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Login Sales &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="text-center mt-6 text-xs text-slate-400">
        <p>© Agung Toyota UjungBatu</p>
      </div>
    </div>
  );
}
