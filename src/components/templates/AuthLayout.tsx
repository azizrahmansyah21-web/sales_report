import React from "react";
import ToyotaLogo from "@/components/atoms/ToyotaLogo";

export interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  branchName?: string;
  portalType?: "SALES" | "ADMIN";
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  branchName = "Cabang UjungBatu • Rokan Hulu",
  portalType = "SALES",
}) => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 antialiased">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex justify-center mb-3">
            <ToyotaLogo size="lg" />
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Agung Toyota
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{branchName}</p>

          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
              {subtitle}
            </p>
          )}

          {/* Portal Type Badge */}
          <div className="mt-3 flex justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              {portalType === "SALES" ? "PORTAL SALES PWA" : "PORTAL MANAJEMEN ADMIN"}
            </span>
          </div>
        </div>

        {/* Form Card Container */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8">
          {children}
        </div>

        {/* Footer Meta */}
        <div className="text-center mt-6 text-xs text-slate-400 space-y-1">
          <p>© 2024 PT Agung Automall Cabang UjungBatu.</p>
          <p className="text-[11px] text-slate-400/80">
            Sistem Deteksi Duplikasi & Pelaporan Prospek Real-Time
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
