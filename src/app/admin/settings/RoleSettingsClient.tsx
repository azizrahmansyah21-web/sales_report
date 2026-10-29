"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import Button from "@/components/atoms/Button";
import Avatar from "@/components/atoms/Avatar";
import {
  RoleOverviewData,
  RoleUserItem,
  RolePermissionRow,
  getRoleOverviewAction,
  updateUserRoleAction,
} from "@/lib/actions/roleAdmin";
import {
  ShieldCheck,
  Users2,
  CheckCircle2,
  AlertTriangle,
  X,
  Search,
  RotateCw,
  Lock,
  ArrowRightLeft,
  Check,
  Minus,
} from "lucide-react";
import type { Role } from "@prisma/client";

type SubTabId = "MATRIX" | "MUTATION";

export default function RoleSettingsClient() {
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>("MATRIX");
  const [overview, setOverview] = useState<RoleOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Mutation Filter & Selected User for Confirmation
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [selectedUserForMutation, setSelectedUserForMutation] = useState<{
    user: RoleUserItem;
    targetRole: Role;
  } | null>(null);

  const loadOverview = useCallback(async () => {
    const res = await getRoleOverviewAction();
    if (res.success && res.data) {
      setOverview(res.data);
    } else if (!res.success) {
      setFeedback({ type: "error", message: res.error || "Gagal memuat matriks perizinan role." });
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let ignore = false;
    getRoleOverviewAction().then((res) => {
      if (ignore) return;
      if (res.success && res.data) {
        setOverview(res.data);
      } else if (!res.success) {
        setFeedback({ type: "error", message: res.error || "Gagal memuat matriks perizinan role." });
      }
      setIsLoading(false);
    });
    return () => {
      ignore = true;
    };
  }, []);

  // Action: Confirm Mutation
  const handleConfirmMutation = () => {
    if (!selectedUserForMutation) return;

    startTransition(async () => {
      const res = await updateUserRoleAction({
        userId: selectedUserForMutation.user.id,
        newRole: selectedUserForMutation.targetRole,
      });

      if (res.success && res.data) {
        setFeedback({ type: "success", message: res.message });
        setSelectedUserForMutation(null);
        loadOverview();
      } else if (!res.success) {
        setFeedback({ type: "error", message: res.error });
      }
    });
  };

  // Filtered Users for Mutation
  const filteredUsers = (overview?.users || []).filter((u) => {
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const cleanSearch = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !cleanSearch ||
      u.name.toLowerCase().includes(cleanSearch) ||
      (u.nip && u.nip.toLowerCase().includes(cleanSearch)) ||
      (u.username && u.username.toLowerCase().includes(cleanSearch));
    return matchesRole && matchesSearch;
  });

  // Group matrix rows by category
  const groupedMatrix: { [category: string]: RolePermissionRow[] } = {};
  if (overview?.matrix) {
    for (const row of overview.matrix) {
      if (!groupedMatrix[row.category]) {
        groupedMatrix[row.category] = [];
      }
      groupedMatrix[row.category].push(row);
    }
  }

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
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
            className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Role Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Tenaga Sales
          </span>
          <p className="text-xl font-black text-blue-600 mt-1 font-mono">
            {overview?.stats.salesCount ?? 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Role SALES (Input PWA)
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Supervisor (SPV)
          </span>
          <p className="text-xl font-black text-amber-600 mt-1 font-mono">
            {overview?.stats.spvCount ?? 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Role SPV (Evaluasi Prospek)
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Admin Operasional
          </span>
          <p className="text-xl font-black text-purple-600 mt-1 font-mono">
            {overview?.stats.adminCount ?? 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Role ADMIN (Closing & Ekspor)
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Pusat Kendali
          </span>
          <p className="text-xl font-black text-rose-600 mt-1 font-mono">
            {overview?.stats.superadminCount ?? 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Role SUPERADMIN (Kendali Penuh)
          </p>
        </div>
      </div>

      {/* Internal Sub-Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveSubTab("MATRIX")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none whitespace-nowrap ${
            activeSubTab === "MATRIX"
              ? "bg-blue-600 text-white shadow-2xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>1. Matriks Perizinan Visual (Permissions Matrix)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("MUTATION")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none whitespace-nowrap ${
            activeSubTab === "MUTATION"
              ? "bg-blue-600 text-white shadow-2xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>2. Mutasi & Promosi Role Personel</span>
        </button>
      </div>

      {/* ─── TAB 1: VISUAL PERMISSIONS MATRIX ────────────────────────────── */}
      {activeSubTab === "MATRIX" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden space-y-0">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Matriks Hak Akses & Pembatasan Fitur (RBAC Matrix)
              </h3>
              <p className="text-xs text-slate-500">
                Pemetaan kewenangan operasional harian Cabang 220 UjungBatu untuk menjamin keamanan data dan pemisahan tugas.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                loadOverview();
              }}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer self-end sm:self-auto"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh Matriks</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 select-none">
                <tr>
                  <th className="p-3 w-1/3">Kewenangan / Aksi Sistem</th>
                  <th className="p-3 text-center w-24">SALES</th>
                  <th className="p-3 text-center w-24">SPV</th>
                  <th className="p-3 text-center w-24">ADMIN</th>
                  <th className="p-3 text-center w-28">SUPERADMIN</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-slate-400">
                      <RotateCw className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
                      <p className="text-xs font-medium">Memuat matriks perizinan...</p>
                    </td>
                  </tr>
                ) : (
                  Object.keys(groupedMatrix).map((category) => (
                    <React.Fragment key={category}>
                      {/* Category Header Row */}
                      <tr className="bg-slate-50/80 border-t-2 border-slate-200 font-bold text-slate-800">
                        <td colSpan={5} className="px-3.5 py-2.5 text-[11px] uppercase tracking-wider text-slate-600 font-mono">
                          📂 {category}
                        </td>
                      </tr>

                      {/* Items under Category */}
                      {groupedMatrix[category].map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">
                              {row.action}
                            </span>
                            <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                              {row.description}
                            </span>
                          </td>

                          {/* SALES */}
                          <td className="p-3 text-center">
                            {row.sales ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                                <Check className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400">
                                <Minus className="w-3 h-3" />
                              </span>
                            )}
                          </td>

                          {/* SPV */}
                          <td className="p-3 text-center">
                            {row.spv ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                                <Check className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400">
                                <Minus className="w-3 h-3" />
                              </span>
                            )}
                          </td>

                          {/* ADMIN */}
                          <td className="p-3 text-center">
                            {row.admin ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                                <Check className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400">
                                <Minus className="w-3 h-3" />
                              </span>
                            )}
                          </td>

                          {/* SUPERADMIN */}
                          <td className="p-3 text-center">
                            {row.superadmin ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                                <Check className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400">
                                <Minus className="w-3 h-3" />
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 2: MUTASI & PROMOSI ROLE PERSONEL ────────────────────────── */}
      {activeSubTab === "MUTATION" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {/* Header & Filter Toolbar */}
          <div className="p-4 md:p-5 border-b border-slate-200 bg-slate-50/70 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Daftar Personel & Mutasi Jabatan
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Total {filteredUsers.length} personel ditemukan
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="relative flex-1 w-full sm:max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari nama karyawan, NIP, atau username..."
                  className="w-full h-9 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs focus:border-blue-600 outline-none font-medium"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar self-start sm:self-auto">
                {["ALL", "SALES", "SPV", "ADMIN", "SUPERADMIN"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRoleFilter(r)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      roleFilter === r
                        ? "bg-slate-900 text-white font-bold"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {r === "ALL" ? "Semua" : r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 select-none">
                <tr>
                  <th className="p-3 w-10 text-center font-mono text-[11px] text-slate-500">#</th>
                  <th className="p-3">Nama Karyawan</th>
                  <th className="p-3">NIP / Username</th>
                  <th className="p-3">Role Saat Ini</th>
                  <th className="p-3 text-center">Tindakan Mutasi Role</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-slate-400">
                      <RotateCw className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
                      <p className="text-xs font-medium">Memuat data personel...</p>
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((u, index) => {
                    const roleBadgeStyle =
                      u.role === "SUPERADMIN"
                        ? "bg-rose-100 text-rose-800 border-rose-200"
                        : u.role === "ADMIN"
                        ? "bg-purple-100 text-purple-800 border-purple-200"
                        : u.role === "SPV"
                        ? "bg-amber-100 text-amber-800 border-amber-200"
                        : "bg-blue-100 text-blue-800 border-blue-200";

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 text-center font-mono text-slate-400 text-[10px]">
                          {index + 1}
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={u.name} size="sm" isOnline={u.isActive} />
                            <div>
                              <span className="font-bold text-slate-900 block">
                                {u.name}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {u.title || "Personel Cabang"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3 font-mono">
                          <span className="font-bold text-slate-800 block">
                            {u.nip || "-"}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            @{u.username || u.nip}
                          </span>
                        </td>

                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${roleBadgeStyle}`}>
                            {u.role}
                          </span>
                        </td>

                        <td className="p-3 text-center">
                          {u.isProtected ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-500 text-[11px] font-semibold">
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                              <span>Akun Terproteksi</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <select
                                defaultValue={u.role}
                                onChange={(e) => {
                                  const targetRole = e.target.value as Role;
                                  if (targetRole !== u.role) {
                                    setSelectedUserForMutation({
                                      user: u,
                                      targetRole,
                                    });
                                  }
                                }}
                                className="h-8 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none cursor-pointer hover:border-blue-400"
                              >
                                <option value="SALES">SALES</option>
                                <option value="SPV">SPV</option>
                                <option value="ADMIN">ADMIN</option>
                                <option value="SUPERADMIN">SUPERADMIN</option>
                              </select>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-slate-400">
                      <p className="text-xs font-semibold text-slate-600">
                        Tidak ada data personel yang cocok dengan pencarian.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Role Mutation */}
      {selectedUserForMutation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-blue-600">
                <ArrowRightLeft className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">
                  Konfirmasi Mutasi Peran
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForMutation(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-2">
              <p>
                Anda akan mengubah hak akses akun karyawan:
              </p>
              <div className="font-bold text-slate-900">
                {selectedUserForMutation.user.name} (NIP: {selectedUserForMutation.user.nip || "-"})
              </div>
              <div className="flex items-center gap-2 pt-1 font-mono text-xs">
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold">
                  {selectedUserForMutation.user.role}
                </span>
                <span className="text-slate-400">➔</span>
                <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold">
                  {selectedUserForMutation.targetRole}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Perubahan peran akan langsung memengaruhi hak akses halaman dan navigasi akun tersebut saat login berikutnya.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setSelectedUserForMutation(null)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleConfirmMutation}
                isLoading={isPending}
              >
                Ya, Ubah Peran
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

