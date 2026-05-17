"use client";

import { ProductPageShell } from "../../../components/product-page-shell";

export function CustomerCreatePage() {
  return (
    <div className="hz-customers-create-page">
      <ProductPageShell
        title="Yeni cari"
        description="Cari oluşturma ekranı henüz canlı API ve onay zincirine bağlı değil. Kayıt oluşturmadan önce backend uçları ve yetki modeli tamamlanmalıdır."
        moduleGroup="Core CRM"
        status="needs-api"
        primaryHref="/cariler"
        primaryLabel="Cari listesine dön"
        relatedLinks={[
          { href: "/ayarlar/veri-yukleme", label: "Veri yükleme / içe aktarma" },
          { href: "/hizli-islem", label: "Hızlı işlem merkezi" }
        ]}
        requiredBackend="Tenant kapsamlı cari oluşturma API ucu, platform.customers.create onay politikası ve audit/timeline yazımı gereklidir."
        nextActions={[
          "Mevcut carileri listeden görüntüleyin veya seçin.",
          "Toplu cari aktarımı için Ayarlar → Veri yükleme yolunu kullanın.",
          "Tekil cari kaydı API hazır olduğunda bu ekranda form açılacaktır."
        ]}
      />
    </div>
  );
}
