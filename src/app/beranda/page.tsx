import { redirect } from "next/navigation";

// /beranda has been retired per ADH revision (Oct 2026).
// Sales are now directed straight to the input form.
export default function BerandaPage() {
  redirect("/input");
}
