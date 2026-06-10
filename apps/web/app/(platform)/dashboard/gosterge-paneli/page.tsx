import { redirect } from "next/navigation";

/** Altın standart gösterge paneli ana rota: `/dashboard` */
export default function DashboardGostergePaneliRedirect() {
  redirect("/dashboard");
}

