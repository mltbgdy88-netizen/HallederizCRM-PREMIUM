# Gap Notes

Bu notlar pilot oncesi bilincli olarak foundation seviyesinde birakilan alanlari ve sonraki oncelikleri listeler.

## 1. Bilincli Placeholder Foundation Alanlari

- Gercek auth/token dogrulama henuz mock session uzerindedir.
- Form mutation'lari UI seviyesinde foundation olarak durur; kalici backend persistence sonraki turda baglanacaktir.
- PDF render, e-fatura, WhatsApp provider ve ERP secret yonetimi gercek adapter'a bagli degildir.
- AI model cagrilari mock adapter uzerindedir; proposal/approval/execution kontrati gercek entegrasyona hazirdir.
- Local agent yazdirma ve dosya kaydetme handler'lari OS seviyesinde gercek cikti uretmez; queue ve policy kontrati hazirdir.

## 2. Pilot Icin Kapatilan Kritik Kopukluklar

- Cari karti aksiyonlari ilgili teklif, siparis, tahsilat, belge ve WhatsApp route'larina baglandi.
- Yeni teklif ekrani cari query baglamindan fiyat grubu snapshot'i uretebilir hale getirildi.
- Siparis detayindaki teslim ve fatura aksiyonlari uygun mock kayit varsa dogrudan detay route'una gider.
- Belge merkezi secili belge baglamiyla entity navigasyonu, queue save ve queue print aksiyonlarini gosterir.
- WhatsApp belge aksiyonu belge merkezine document query parametresiyle gider.
- Fabrika siparis listesinde detay acma tek tik ve acik aksiyonla gorunur hale getirildi.

## 3. Sonraki Yuksek Oncelikli Isler

1. Payments/Deliveries/Invoices/Returns/Documents write path'lerini DB transaction modeline tasimak.
2. Warehouse order line-level DB parity'yi tamamlamak.
3. DB-mode integration testlerini gercek test veritabaniyla CI'da kosmak.
4. UI'da conflict (409 stale update) handling deneyimini form seviyesinde iyilestirmek.
5. Document detail route'u ekleyip belge preview ve delivery history'yi detay sayfasina tasimak.
6. Approval execution sonucunu audit/timeline mock verisine yazmak.
