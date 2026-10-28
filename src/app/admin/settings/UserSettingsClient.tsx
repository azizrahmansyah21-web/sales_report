"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import FormField from "@/components/molecules/FormField";
import Select from "@/components/atoms/Select";
import Avatar from "@/components/atoms/Avatar";
import {
  AdminUserItem,
  getUsersListAction,
  createUserAction,
  updateUserAction,
  toggleUserStatusAction,
  deleteUserAction,
} from "@/lib/actions/userAdmin";
import {
  Users2,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Phone,
  CheckCircle2,
  AlertTriangle,
  X,
  Lock,
  RotateCw,
  Power,
} from "lucide-react";
import type { Role } from "@prisma/client";

export default function UserSettingsClient() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    salesCount: 0,
    spvCount: 0,
    adminCount: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("ALL");

  // Feedback Banner
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);

  // Form states for Create
  const [createForm, setCreateForm] = useState({
    name: "",
    nip: "",
    username: "",
    email: "",
    phone: "",
    role: "SALES" as Role,
    title: "",
    password: "",
  });

  // Form states for Edit
  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    nip: "",
    username: "",
    email: "",
    phone: "",
    role: "SALES" as Role,
    title: "",
    newPassword: "",
  });

  // Load Users
  const loadUsers = useCallback(async (search: string, role: string) => {
    const res = await getUsersListAction({ search, role });
    if (res.success) {
      if (res.data) {
        setUsers(res.data.users);
        setStats(res.data.stats);
      }
    } else {
      setFeedback({ type: "error", message: res.error || "Gagal memuat pengguna." });
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let ignore = false;
    getUsersListAction({ search: searchTerm, role: selectedRoleFilter }).then((res) => {
      if (ignore) return;
      if (res.success) {
        if (res.data) {
          setUsers(res.data.users);
          setStats(res.data.stats);
        }
      } else {
        setFeedback({ type: "error", message: res.error || "Gagal memuat pengguna." });
      }
      setIsLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, [searchTerm, selectedRoleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    loadUsers(searchTerm, selectedRoleFilter);
  };

  // Open Edit Modal
  const handleOpenEdit = (user: AdminUserItem) => {
    setSelectedUser(user);
    setEditForm({
      id: user.id,
      name: user.name,
      nip: user.nip || "",
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role,
      title: user.title || "",
      newPassword: "",
    });
    setIsEditModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDelete = (user: AdminUserItem) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Action: Toggle Active Status
  const handleToggleStatus = (user: AdminUserItem) => {
    startTransition(async () => {
      const res = await toggleUserStatusAction(user.id, !user.isActive);
      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        if (res.data) {
          const newStatus = res.data.isActive;
          setUsers((prev) =>
            prev.map((u) =>
              u.id === user.id ? { ...u, isActive: newStatus } : u
            )
          );
          setStats((prev) => ({
            ...prev,
            active: newStatus ? prev.active + 1 : prev.active - 1,
            inactive: newStatus ? prev.inactive - 1 : prev.inactive + 1,
          }));
        }
      } else {
        setFeedback({ type: "error", message: res.error });
      }
    });
  };

  // Action: Submit Create User
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createUserAction(createForm);
      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        setIsCreateModalOpen(false);
        setCreateForm({
          name: "",
          nip: "",
          username: "",
          email: "",
          phone: "",
          role: "SALES",
          title: "",
          password: "",
        });
        loadUsers(searchTerm, selectedRoleFilter);
      } else {
        setFeedback({ type: "error", message: res.error });
      }
    });
  };

  // Action: Submit Edit User
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateUserAction(editForm);
      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        setIsEditModalOpen(false);
        loadUsers(searchTerm, selectedRoleFilter);
      } else {
        setFeedback({ type: "error", message: res.error });
      }
    });
  };

  // Action: Confirm Delete User
  const handleDeleteConfirm = () => {
    if (!selectedUser) return;
    startTransition(async () => {
      const res = await deleteUserAction(selectedUser.id);
      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        setIsDeleteModalOpen(false);
        loadUsers(searchTerm, selectedRoleFilter);
      } else {
        setFeedback({ type: "error", message: res.error });
      }
    });
  };

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

      {/* User Stats Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Personel
          </span>
          <p className="text-xl font-black text-slate-900 mt-1">{stats.total}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Cabang Resmi 220</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Status Akun
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl font-black text-emerald-600">
              {stats.active}
            </span>
            <span className="text-xs text-slate-400">Aktif</span>
            <span className="text-slate-300">•</span>
            <span className="text-xl font-black text-slate-400">
              {stats.inactive}
            </span>
            <span className="text-xs text-slate-400">Nonaktif</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Dapat login ke sistem</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Tenaga Sales
          </span>
          <p className="text-xl font-black text-blue-600 mt-1">
            {stats.salesCount}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Input Rencana SPK H-1</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Pimpinan & Admin
          </span>
          <p className="text-xl font-black text-purple-600 mt-1">
            {stats.spvCount + stats.adminCount}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {stats.spvCount} SPV • {stats.adminCount} Admin/ADH
          </p>
        </div>
      </div>

      {/* Main User Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Toolbar Header */}
        <div className="p-4 md:p-5 border-b border-slate-200 bg-slate-50/70 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">
                Manajemen Akun Karyawan & Hak Akses
              </h2>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Tambah Karyawan Baru
            </Button>
          </div>

          {/* Search & Role Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari nama, NIP, username, no WA..."
                  className="w-full h-9 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs focus:border-blue-600 outline-none font-medium"
                />
              </div>
              <Button type="submit" variant="secondary" size="sm">
                Cari
              </Button>
            </form>

            {/* Role Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar self-start sm:self-auto">
              {["ALL", "SALES", "SPV", "ADMIN", "SUPERADMIN"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setIsLoading(true);
                    setSelectedRoleFilter(r);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedRoleFilter === r
                      ? "bg-slate-900 text-white font-bold"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {r === "ALL" ? "Semua Peran" : r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Data Table */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 select-none">
              <tr>
                <th className="p-3 w-10 text-center font-mono text-[11px] text-slate-500">#</th>
                <th className="p-3">Nama Karyawan</th>
                <th className="p-3">NIP / Username</th>
                <th className="p-3">Role</th>
                <th className="p-3">No. WhatsApp</th>
                <th className="p-3 text-center">Status Aktif</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <RotateCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    <p className="text-xs font-medium">Memuat data pengguna...</p>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((u, index) => {
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
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${roleBadgeStyle}`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="p-3 font-mono text-slate-600">
                        {u.phone ? (
                          <a
                            href={`https://wa.me/${u.phone.replace(/^0/, "62")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-emerald-600 hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>{u.phone}</span>
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          disabled={u.role === "SUPERADMIN" || isPending}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 mx-auto ${
                            u.isActive
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          } ${u.role === "SUPERADMIN" ? "opacity-60 cursor-not-allowed" : ""}`}
                          title={
                            u.role === "SUPERADMIN"
                              ? "Superadmin selalu aktif"
                              : u.isActive
                              ? "Klik untuk nonaktifkan"
                              : "Klik untuk aktifkan"
                          }
                        >
                          <Power className="w-3 h-3" />
                          <span>{u.isActive ? "Aktif" : "Nonaktif"}</span>
                        </button>
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Data Karyawan"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {u.role !== "SUPERADMIN" && (
                            <button
                              type="button"
                              onClick={() => handleOpenDelete(u)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Hapus Karyawan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <p className="text-xs font-semibold text-slate-600">
                      Tidak ada data pengguna yang sesuai dengan pencarian.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create user */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-blue-600">
                <UserPlus className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">
                  Tambah Karyawan Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <FormField label="Nama Lengkap Karyawan" required>
                <Input
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Contoh: AHMAD SOFIAN"
                  required
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="NIP Karyawan" required>
                  <Input
                    value={createForm.nip}
                    onChange={(e) => setCreateForm({ ...createForm, nip: e.target.value })}
                    placeholder="Contoh: 101257A311"
                    required
                  />
                </FormField>

                <FormField label="Username Login" required>
                  <Input
                    value={createForm.username}
                    onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                    placeholder="Contoh: sofian"
                    required
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Peran Hak Akses (Role)" required>
                  <Select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as Role })}
                    options={[
                      { value: "SALES", label: "SALES (Input SPK H-1)" },
                      { value: "SPV", label: "SPV (Supervisor Tim)" },
                      { value: "ADMIN", label: "ADMIN (Administrasi Cabang)" },
                      { value: "SUPERADMIN", label: "SUPERADMIN (Kendali Penuh)" },
                    ]}
                  />
                </FormField>

                <FormField label="Jabatan / Title">
                  <Input
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    placeholder="Contoh: Sales Executive"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Nomor WhatsApp">
                  <Input
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="081268000100"
                  />
                </FormField>

                <FormField label="Email Resmi">
                  <Input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="nama@atujungbatu.com"
                  />
                </FormField>
              </div>

              <FormField label="Kata Sandi Awal (Opsional)">
                <Input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="Default: toyota220 jika dikosongkan"
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                />
              </FormField>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isPending}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  isLoading={isPending}
                >
                  Simpan Karyawan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit user and reset password */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-blue-600">
                <Edit2 className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">
                  Edit Data: {selectedUser.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <FormField label="Nama Lengkap Karyawan" required>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="NIP Karyawan" required>
                  <Input
                    value={editForm.nip}
                    onChange={(e) => setEditForm({ ...editForm, nip: e.target.value })}
                    required
                  />
                </FormField>

                <FormField label="Username Login" required>
                  <Input
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    required
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Peran Hak Akses (Role)" required>
                  <Select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as Role })}
                    options={[
                      { value: "SALES", label: "SALES (Input SPK H-1)" },
                      { value: "SPV", label: "SPV (Supervisor Tim)" },
                      { value: "ADMIN", label: "ADMIN (Administrasi Cabang)" },
                      { value: "SUPERADMIN", label: "SUPERADMIN (Kendali Penuh)" },
                    ]}
                  />
                </FormField>

                <FormField label="Jabatan / Title">
                  <Input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Nomor WhatsApp">
                  <Input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </FormField>

                <FormField label="Email Resmi">
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </FormField>
              </div>

              <FormField label="Ganti Kata Sandi Baru (Kosongkan jika tidak diubah)">
                <Input
                  type="password"
                  value={editForm.newPassword}
                  onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                  placeholder="Ketik password baru jika ingin mereset..."
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                />
              </FormField>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isPending}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  isLoading={isPending}
                >
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete user confirmation */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">
                  Hapus Akun Karyawan?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs leading-relaxed">
              <strong>Peringatan Penghapusan:</strong>
              <p className="mt-1">
                Akun <strong>{selectedUser.name}</strong> (NIP: {selectedUser.nip}) dan seluruh {selectedUser.totalPlansCount} catatan prospek terkait akan dihapus permanen.
              </p>
            </div>

            <p className="text-xs text-slate-500">
              Tips: Jika karyawan hanya mutasi atau nonaktif, gunakan tombol <strong>Nonaktifkan</strong> daripada menghapus agar riwayat prospek tetap tersimpan.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleDeleteConfirm}
                isLoading={isPending}
              >
                Ya, Hapus Karyawan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
