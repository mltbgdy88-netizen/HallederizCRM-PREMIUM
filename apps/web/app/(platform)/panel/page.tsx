import { redirect } from "next/navigation";

/** Panel menü rotası gösterge paneli ile aynı ana ekranı açar. */
export default function PanelPage() {
  redirect("/dashboard");
}
