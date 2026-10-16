import { redirect } from "next/navigation";

// /riwayat has been retired per ADH revision (Oct 2026).
// Closing history is now embedded directly on /input.
export default function RiwayatPage() {
  redirect("/input");
}
