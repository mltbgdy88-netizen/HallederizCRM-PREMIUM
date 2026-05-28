import { redirect } from "next/navigation";

/** Kanonik giriş `/ai` — operatör merkezi tek menü kapısı */
export default function AiOperatorHubAliasRoute() {
  redirect("/ai");
}

