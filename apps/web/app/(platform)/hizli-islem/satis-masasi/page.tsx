import { redirect } from "next/navigation";

/** Eski alt rota — ana masaya yönlendir */
export default function HizliIslemSatisMasasiRedirect() {
  redirect("/hizli-islem");
}

