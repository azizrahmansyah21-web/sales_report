import { redirect } from "next/navigation";

// /admin/dashboard has been retired per ADH revision (Oct 2026).
// Admin, ADH, and SPV land directly on the Data Rencana SPK page.
export default function AdminDashboardPage() {
  redirect("/admin/prospects");
}
