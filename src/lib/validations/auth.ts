import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(3, "Username atau Email minimal 3 karakter")
    .trim(),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").trim(),
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh berupa huruf, angka, dan underscore")
    .toLowerCase()
    .trim(),
  email: z.string().email("Format email tidak valid").toLowerCase().trim().optional(),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["ADMIN", "SALES"]).default("SALES"),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
