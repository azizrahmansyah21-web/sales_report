import { z } from "zod";

// Skema pembersihan dan validasi nomor handphone Indonesia
const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;

export const prospectSchema = z.object({
  customerName: z
    .string()
    .min(2, "Nama customer minimal 2 karakter")
    .max(100, "Nama customer maksimal 100 karakter")
    .trim(),
  customerPhone: z
    .string()
    .trim()
    .regex(phoneRegex, "Nomor handphone tidak valid (contoh: 08123456789 atau 628123456789)")
    .transform((val) => {
      // Normalisasi nomor HP ke format standar (08...)
      const cleaned = val.replace(/\D/g, "");
      if (cleaned.startsWith("62")) {
        return "0" + cleaned.slice(2);
      }
      return cleaned;
    }),
  unitName: z
    .string()
    .min(2, "Unit produk wajib dipilih atau diisi")
    .max(100, "Nama unit maksimal 100 karakter")
    .trim(),
  status: z
    .enum(["NEW", "FOLLOW_UP", "DEAL", "LOST"])
    .default("NEW"),
  notes: z
    .string()
    .max(1000, "Catatan maksimal 1000 karakter")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
});

export type ProspectInput = z.infer<typeof prospectSchema>;

export const updateProspectStatusSchema = z.object({
  status: z.enum(["NEW", "FOLLOW_UP", "DEAL", "LOST"]),
  notes: z.string().max(1000, "Catatan maksimal 1000 karakter").optional().nullable(),
});

export type UpdateProspectStatusInput = z.infer<typeof updateProspectStatusSchema>;
