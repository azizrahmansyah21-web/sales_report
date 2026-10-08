import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MobilePwaLayout from "@/components/templates/MobilePwaLayout";
import MetricCard from "@/components/molecules/MetricCard";
import PlanSpkCardMobile from "@/components/organisms/PlanSpkCardMobile";
import {
  UserPlus,
  ArrowRight,
  Calendar,
  Sparkles,
  Inbox,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default async function BerandaPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id;
  const salesName = session.user.name || "Sales Advisor";
  const salesTitle = session.user.title || "Sales Advisor Lapangan";
  const salesUsername = session.user.username ? `@${session.user.username}` : "";

  // Fetch actual operational plan SPKs and KPI stats for this authenticated sales
  const [recentPlans, totalCount, pendingCount, berhasilCount] = await Promise.all([
    prisma.planSPK.findMany({
      where: { salesId: userId },
      orderBy: { planDate: "desc" },
      take: 6,
    }),
    prisma.planSPK.count({ where: { salesId: userId } }),
    prisma.planSPK.count({ where: { salesId: userId, spkStatus: "PENDING" } }),
    prisma.planSPK.count({ where: { salesId: userId, spkStatus: "BERHASIL" } }),
  ]);

  const todayFormatted = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <MobilePwaLayout salesName={salesName} isOnline={true}>
      <div className="space-y-5">
        {/* Sales Greeting & Operational Status Card */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white p-5 shadow-md relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/15 text-blue-100 backdrop-blur-xs border border-white/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Monitoring H-1 Aktif</span>
              </span>

              <div className="flex items-center gap-1 text-[11px] text-blue-200">
                <Calendar className="w-3.5 h-3.5" />
                <span>{todayFormatted}</span>
              </div>
            </div>

            <div>
              <p className="text-xs text-blue-200 font-medium">Selamat Datang,</p>
              <h2 className="text-xl font-black tracking-tight text-white">
                {salesName}
              </h2>
              <p className="text-xs text-blue-200/90 font-mono mt-0.5">
                {salesUsername ? `${salesUsername} • ` : ""}{salesTitle}
              </p>
            </div>
          </div>

          {/* Decorative visual accents */}
          <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute top-0 right-10 w-24 h-24 rounded-full bg-blue-500/20 blur-xl pointer-events-none" />
        </div>

        {/* Real-time KPI Summary Cards */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          <MetricCard
            title="Menunggu"
            value={pendingCount}
            subtitle="Menunggu Hari H"
            icon={<Clock className="w-3.5 h-3.5 text-amber-600" />}
            className="p-3!"
          />
          <MetricCard
            title="SPK Berhasil"
            value={berhasilCount}
            subtitle="Closing Valid"
            icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            className="p-3!"
          />
          <MetricCard
            title="Total Plan"
            value={totalCount}
            subtitle="Diajukan"
            className="p-3!"
          />
        </div>

        {/* Primary CTA Button: Input Plan SPK Baru */}
        <div>
          <Link
            href="/input"
            className="group block w-full rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white p-4 shadow-lg shadow-blue-600/25 border border-blue-500 transition-all duration-200 select-none active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight">
                    + Buat Rencana SPK Besok
                  </h3>
                  <p className="text-[11px] text-blue-100 mt-0.5">
                    Input rencana penutupan SPK H-1 untuk approval SPV
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Recent Plan SPK List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Rencana SPK Terbaru</span>
              <span className="w-2 h-2 rounded-full bg-blue-600" />
            </h3>

            {totalCount > 0 && (
              <Link
                href="/riwayat"
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
              >
                Lihat Semua ({totalCount}) &rarr;
              </Link>
            )}
          </div>

          {recentPlans.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center bg-white space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Inbox className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">
                  Belum ada rencana SPK
                </p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Mulai catat rencana penutupan SPK besok sekarang untuk dipantau oleh SPV.
                </p>
              </div>
              <Link
                href="/input"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Buat Rencana Pertama</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recentPlans.map((plan) => (
                <PlanSpkCardMobile key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </div>
      </div>
    </MobilePwaLayout>
  );
}
