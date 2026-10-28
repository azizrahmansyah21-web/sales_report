import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(80, "Nama maksimal 80 karakter"),
  nip: z
    .string()
    .min(4, "NIP minimal 4 karakter")
    .max(30, "NIP maksimal 30 karakter")
    .transform((val) => val.trim().toUpperCase()),
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(30, "Username maksimal 30 karakter")
    .regex(/^[a-zA-Z0-9._]+$/, "Username hanya boleh huruf, angka, titik, atau underscore")
    .transform((val) => val.trim().toLowerCase()),
  email: z
    .string()
    .email("Format email tidak valid")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .min(9, "Nomor WhatsApp minimal 9 digit")
    .max(16, "Nomor WhatsApp maksimal 16 digit")
    .regex(/^08[0-9]+$/, "Nomor WhatsApp harus diawali 08 (contoh: 081268000100)")
    .optional()
    .or(z.literal("")),
  role: z.enum(["SALES", "SPV", "ADMIN", "SUPERADMIN"], {
    message: "Role harus salah satu dari: SALES, SPV, ADMIN, SUPERADMIN",
  }),
  title: z.string().max(60, "Jabatan maksimal 60 karakter").optional().or(z.literal("")),
  password: z.string().min(6, "Password minimal 6 karakter").optional().or(z.literal("")),
});

export const updateUserSchema = z.object({
  id: z.string().uuid("ID pengguna tidak valid"),
  name: z.string().min(2, "Nama minimal 2 karakter").max(80, "Nama maksimal 80 karakter"),
  nip: z
    .string()
    .min(4, "NIP minimal 4 karakter")
    .max(30, "NIP maksimal 30 karakter")
    .transform((val) => val.trim().toUpperCase()),
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(30, "Username maksimal 30 karakter")
    .regex(/^[a-zA-Z0-9._]+$/, "Username hanya boleh huruf, angka, titik, atau underscore")
    .transform((val) => val.trim().toLowerCase()),
  email: z
    .string()
    .email("Format email tidak valid")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .min(9, "Nomor WhatsApp minimal 9 digit")
    .max(16, "Nomor WhatsApp maksimal 16 digit")
    .regex(/^08[0-9]+$/, "Nomor WhatsApp harus diawali 08 (contoh: 081268000100)")
    .optional()
    .or(z.literal("")),
  role: z.enum(["SALES", "SPV", "ADMIN", "SUPERADMIN"], {
    message: "Role harus salah satu dari: SALES, SPV, ADMIN, SUPERADMIN",
  }),
  title: z.string().max(60, "Jabatan maksimal 60 karakter").optional().or(z.literal("")),
  newPassword: z.string().min(6, "Password baru minimal 6 karakter").optional().or(z.literal("")),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

