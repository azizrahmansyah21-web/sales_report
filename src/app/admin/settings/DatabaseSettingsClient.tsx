"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import FormField from "@/components/molecules/FormField";
import {
  DatabaseHealthStats,
  TableName,
  TableDataResult,
  getTableRowsAction,
  deleteSelectedRowsAction,
  truncatePlanSpkAction,
} from "@/lib/actions/databaseAdmin";
import {
  FileSpreadsheet,
  Users2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Search,
  Lock,
  X,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface DatabaseSettingsClientProps {
  initialStats: DatabaseHealthStats;
}

export default function DatabaseSettingsClient({
  initialStats,
}: DatabaseSettingsClientProps) {
  const [stats, setStats] = useState<DatabaseHealthStats>(initialStats);
  const [activeTable, setActiveTable] = useState<TableName>("plan_spk");
  const [isPending, startTransition] = useTransition();

  // Table Data & Pagination State
  const [tableData, setTableData] = useState<TableDataResult | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingRows, setIsLoadingRows] = useState(true);

  // Selected Row IDs for Multi-Delete
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Banner Feedback
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Modal 1: Delete Selected Modal
  const [isDeleteSelectedModalOpen, setIsDeleteSelectedModalOpen] = useState(false);

  // Modal 2: Truncate Modal (Danger Zone)
  const [isTruncateModalOpen, setIsTruncateModalOpen] = useState(false);
  const [truncateConfirmText, setTruncateConfirmText] = useState("");
  const [truncatePassword, setTruncatePassword] = useState("");

  // Fetch Table Rows
  const loadTableData = useCallback(
    async (targetTable: TableName, targetPage: number, search: string) => {
      const res = await getTableRowsAction({
        tableName: targetTable,
        page: targetPage,
        pageSize,
        search,
      });

      if (res.success) {
        if (res.data) setTableData(res.data);
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Gagal memuat data tabel.",
        });
      }
      setIsLoadingRows(false);
      setSelectedIds([]);
    },
    [pageSize]
  );

  // Load rows when activeTable, page, or search changes
  useEffect(() => {
    let ignore = false;
    getTableRowsAction({
      tableName: activeTable,
      page,
      pageSize,
      search: searchTerm,
    }).then((res) => {
      if (ignore) return;
      if (res.success) {
        if (res.data) setTableData(res.data);
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Gagal memuat data tabel.",
        });
      }
      setIsLoadingRows(false);
      setSelectedIds([]);
    });

    return () => {
      ignore = true;
    };
  }, [activeTable, page, searchTerm, pageSize]);

  // Handle Search Input
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingRows(true);
    setPage(1);
    loadTableData(activeTable, 1, searchTerm);
  };

  // Switch Active Table Tab
  const handleSwitchTable = (table: TableName) => {
    setIsLoadingRows(true);
    setActiveTable(table);
    setPage(1);
    setSearchTerm("");
    setSelectedIds([]);
  };

  // Toggle single row selection
  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle select all on current page
  const handleToggleSelectAll = () => {
    if (!tableData) return;
    const selectableIds = tableData.rows.map((r) => r.id);
    const isAllSelected = selectableIds.every((id) => selectedIds.includes(id));

    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(selectableIds);
    }
  };

  // Execute Delete Selected Rows
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;

    startTransition(async () => {
      const res = await deleteSelectedRowsAction({
        tableName: activeTable,
        ids: selectedIds,
      });

      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        setIsDeleteSelectedModalOpen(false);
        // Reload data
        loadTableData(activeTable, page, searchTerm);
        // Update total stats
        setStats((prev) => ({
          ...prev,
          totalProspects:
            activeTable === "plan_spk"
              ? Math.max(0, prev.totalProspects - selectedIds.length)
              : prev.totalProspects,
          totalUsers:
            activeTable === "users"
              ? Math.max(0, prev.totalUsers - selectedIds.length)
              : prev.totalUsers,
        }));
      } else {
        setFeedback({ type: "error", message: res.error });
      }
    });
  };

  // Execute Truncate Table
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
        loadTableData("plan_spk", 1, "");
        setStats((prev) => ({
          ...prev,
          totalProspects: 0,
          totalDuplicates: 0,
          mockProspectsCount: 0,
          mockProspectsList: [],
        }));
      } else {
        setFeedback({ type: "error", message: res.error });
      }
    });
  };

  const isCurrentPageAllSelected =
    tableData &&
    tableData.rows.length > 0 &&
    tableData.rows.every((r) => selectedIds.includes(r.id));

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
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Database Health Summary Pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Prospek
          </span>
          <p className="text-xl font-black text-slate-900 mt-1">
            {stats.totalProspects}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
            tabel plan_spk
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Personel
          </span>
          <p className="text-xl font-black text-slate-900 mt-1">
            {stats.totalUsers}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
            tabel users
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Data Mock
          </span>
          <p
            className={`text-xl font-black mt-1 ${
              stats.mockProspectsCount > 0 ? "text-amber-600" : "text-slate-900"
            }`}
          >
            {stats.mockProspectsCount}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {stats.mockProspectsCount > 0 ? "Perlu dibersihkan" : "Bersih 100%"}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Database Size
          </span>
          <p className="text-xl font-black text-slate-900 mt-1 font-mono">
            {stats.estimatedDbSize}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>PostgreSQL Online</span>
          </div>
        </div>
      </div>

      {/* Table Explorer */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Table Selector & Top Action Toolbar */}
        <div className="p-4 md:p-5 border-b border-slate-200 bg-slate-50/70 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Table Tabs Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
                Tabel:
              </span>
              <button
                type="button"
                onClick={() => handleSwitchTable("plan_spk")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTable === "plan_spk"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>plan_spk</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeTable === "plan_spk"
                      ? "bg-blue-700 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {stats.totalProspects}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchTable("users")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTable === "users"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Users2 className="w-4 h-4" />
                <span>users</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeTable === "users"
                      ? "bg-blue-700 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {stats.totalUsers}
                </span>
              </button>
            </div>

            {/* Truncate Plan SPK Button (Only active when plan_spk is selected) */}
            {activeTable === "plan_spk" && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsTruncateModalOpen(true)}
                disabled={stats.totalProspects === 0 || isPending}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Truncate Tabel
              </Button>
            )}
          </div>

          {/* Search & Refresh Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Cari di tabel ${activeTable}...`}
                  className="w-full h-9 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs focus:border-blue-600 outline-none font-medium"
                />
              </div>
              <Button type="submit" variant="secondary" size="sm">
                Cari
              </Button>
            </form>

            <button
              type="button"
              onClick={() => {
                setIsLoadingRows(true);
                loadTableData(activeTable, page, searchTerm);
              }}
              disabled={isLoadingRows}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer self-end sm:self-auto"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoadingRows ? "animate-spin" : ""}`} />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        {/* Floating selection bar */}
        {selectedIds.length > 0 && (
          <div className="px-5 py-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>{selectedIds.length} baris data dipilih</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Batal Pilih
              </button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsDeleteSelectedModalOpen(true)}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Hapus ({selectedIds.length}) Baris
              </Button>
            </div>
          </div>
        )}

        {/* Table data grid */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 sticky top-0 select-none">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={!!isCurrentPageAllSelected}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                    aria-label="Pilih semua baris di halaman ini"
                  />
                </th>
                <th className="p-3 font-mono text-[11px] text-slate-500">#</th>
                {tableData?.columns.map((col) => (
                  <th key={col} className="p-3 uppercase tracking-wider font-semibold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoadingRows ? (
                <tr>
                  <td
                    colSpan={(tableData?.columns.length || 8) + 2}
                    className="p-12 text-center text-slate-400"
                  >
                    <RotateCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    <p className="text-xs font-medium">Memuat data dari database...</p>
                  </td>
                </tr>
              ) : tableData && tableData.rows.length > 0 ? (
                tableData.rows.map((row, index) => {
                  const isChecked = selectedIds.includes(row.id);
                  const isMock =
                    String(row.keteranganAdmin || "").toLowerCase().includes("mock") ||
                    String(row.customerName || "").toLowerCase().includes("contoh");

                  return (
                    <tr
                      key={row.id}
                      className={`transition-colors ${
                        isChecked
                          ? "bg-amber-50/70"
                          : isMock
                          ? "bg-amber-50/30 hover:bg-amber-50/50"
                          : "hover:bg-slate-50/80"
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleRow(row.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                        />
                      </td>
                      <td className="p-3 font-mono text-slate-400 text-[10px]">
                        {(page - 1) * pageSize + index + 1}
                      </td>
                      {tableData.columns.map((col) => {
                        const val = String(row[col] ?? "-");
                        const isStatusCol = col === "spkStatus";
                        const isDuplicateCol = col === "isDuplicate";

                        return (
                          <td key={col} className="p-3 font-medium text-slate-800">
                            {isStatusCol ? (
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  val === "BERHASIL"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : val === "BELUM_BERHASIL"
                                    ? "bg-rose-100 text-rose-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {val}
                              </span>
                            ) : isDuplicateCol ? (
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  val === "YA"
                                    ? "bg-amber-200 text-amber-900 font-bold"
                                    : "text-slate-400"
                                }`}
                              >
                                {val}
                              </span>
                            ) : (
                              <span className="truncate max-w-[200px] inline-block">
                                {val}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={(tableData?.columns.length || 8) + 2}
                    className="p-12 text-center text-slate-400"
                  >
                    <p className="text-xs font-semibold text-slate-600">
                      Tidak ada data ditemukan di tabel {activeTable}.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Menampilkan{" "}
            <span className="font-bold text-slate-800">
              {tableData && tableData.rows.length > 0 ? (page - 1) * pageSize + 1 : 0}
            </span>{" "}
            -{" "}
            <span className="font-bold text-slate-800">
              {tableData ? Math.min(page * pageSize, tableData.total) : 0}
            </span>{" "}
            dari <span className="font-bold text-slate-800">{tableData?.total || 0}</span> data
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || isLoadingRows}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            <span className="px-2 py-1 font-mono font-bold text-slate-700">
              Halaman {page} dari {tableData?.totalPages || 1}
            </span>

            <button
              type="button"
              disabled={!tableData || page >= tableData.totalPages || isLoadingRows}
              onClick={() => setPage((p) => p + 1)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Delete selected rows */}
      {isDeleteSelectedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">
                  Hapus {selectedIds.length} Baris Data?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteSelectedModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Anda akan menghapus <strong>{selectedIds.length} baris data terpilih</strong> dari tabel{" "}
              <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-mono">
                {activeTable}
              </code>
              . Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setIsDeleteSelectedModalOpen(false)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleDeleteSelected}
                isLoading={isPending}
              >
                Ya, Hapus ({selectedIds.length})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Truncate table */}
      {isTruncateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-rose-300 space-y-5">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">
                  Konfirmasi Truncate Tabel `plan_spk`
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
              <strong>PERINGATAN:</strong>
              <p className="mt-1">
                Seluruh {stats.totalProspects} data pada tabel <code>plan_spk</code> akan dikosongkan.
                Tabel master <code>users</code> tetap utuh.
              </p>
            </div>

            <div className="space-y-4">
              <FormField label='Ketik persis: "HAPUS SEMUA DATA PROSPEK"' required>
                <Input
                  value={truncateConfirmText}
                  onChange={(e) => setTruncateConfirmText(e.target.value)}
                  placeholder="HAPUS SEMUA DATA PROSPEK"
                  disabled={isPending}
                />
              </FormField>

              <FormField label="Kata Sandi Superadmin" required>
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
                Kosongkan Tabel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
