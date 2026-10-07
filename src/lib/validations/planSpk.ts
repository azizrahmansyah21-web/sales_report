import { z } from "zod";

export const planSpkSchema = z.object({
  customerName: z
    .string()
    .min(2, "Nama customer minimal 2 karakter")
    .max(100, "Nama customer maksimal 100 karakter")
    .trim(),
  unitName: z
    .string()
    .min(2, "Unit Toyota wajib dipilih")
    .max(100, "Nama unit maksimal 100 karakter")
    .trim(),
  planDate: z
    .string()
    .date("Format tanggal tidak valid")
    .transform((val) => new Date(val)),
});

export type PlanSpkInput = z.infer<typeof planSpkSchema>;

export const updateSpkStatusSchema = z.object({
  spkStatus: z.enum(["PENDING", "BERHASIL", "BELUM_BERHASIL"]),
});

export const updateKeteranganSchema = z.object({
  keterangan: z
    .string()
    .max(500, "Keterangan maksimal 500 karakter")
    .nullable()
    .transform((val) => (val === "" ? null : val)),
});

export type UpdateSpkStatusInput = z.infer<typeof updateSpkStatusSchema>;
export type UpdateKeteranganInput = z.infer<typeof updateKeteranganSchema>;
