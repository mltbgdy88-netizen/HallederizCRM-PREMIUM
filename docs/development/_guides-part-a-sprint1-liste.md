# Bölüm A — Onaylı çekirdek + çekirdek liste masaları

## Stok Operasyon Masası — `stok-operasyon-masasi-acik-mod.png`
**Route:** `/stok`

**Bu ekran ne?**
Merkez, fabrika, depo ve raf bazında ürün stoklarının izlendiği ana envanter operasyon masasıdır.

**Gördüğü veriler:**
- Toplam ürün, kritik stok, lokasyon özetleri, fiyat grubu sayısı
- Ürün kodu, merkez/fabrika/raf stokları, birim fiyat, durum
- Seçili üründe barkod, marka, kategori, rezerv, raf kapasitesi

**Yapabildiği işler:**
- Yeni ürün, stok hareketi, transfer; filtreleme ve arama
- Satırda detay/stok/etiket; sağ panelden etiket ve transfer

**Tipik senaryo:**
Depo sorumlusu kritik stok KPI’sına bakar, fabrikada düşen deseni bulur, transfer talebi veya etiket basımı yapar.

**Kritik UI öğeleri:**
KPI şeridi, filtre bandı, liste + AKSİYON kolonu, sağ «Stok Bağlamı».

---

## Arşiv Operasyon Merkezi — `arsiv-operasyon-merkezi-acik-mod.png`
**Route:** `/archive`

**Bu ekran ne?**
Geçmiş ticari belgelerin ve denetim izinin arandığı merkezi arşivdir.

**Gördüğü veriler:**
- Kayıt no, cari, işlem türü, tarih, onay durumu, sorumlu
- Seçili belgede dosya meta, etiketler, denetim izi

**Yapabildiği işler:**
- Belge yükleme, indirme, dışa aktarma; tür/durum/tarih filtreleri
- Görüntüleme, bağlantı kopyalama, arşiv notu

**Tipik senaryo:**
Muhasebe geçmiş ay faturasını bulur, onay geçmişini doğrular, belgeyi indirir.

**Kritik UI öğeleri:**
KPI, kategori sekmeleri, liste, sağ «Arşiv Bağlamı».

---

## Rapor Operasyon Merkezi — `rapor-operasyon-merkezi-acik-mod.png`
**Route:** `/raporlar`

**Bu ekran ne?**
Ciro, tahsilat, stok ve kanal KPI’larının hedef–gerçekleşen tablosuyla izlendiği rapor merkezidir.

**Gördüğü veriler:**
- Üst metrikler, dönem karşılaştırması, performans tablosu
- Seçili metrikte ilerleme ve AI öneri notları (salt okunur)

**Yapabildiği işler:**
- Sekme ve dönem filtreleri; PDF/Excel; özel rapor tanımı

**Tipik senaryo:**
Yönetici açık bakiye artışını görür, AI önerisini okuyup tahsilat ekibine yönlendirir.

**Kritik UI öğeleri:**
KPI, filtre, metrik listesi, sağ «Rapor Bağlamı».

---

## WhatsApp Operasyon Paneli — `whatsapp-operasyon-paneli-acik-mod.png`
**Route:** `/whatsapp`

**Bu ekran ne?**
Bayi WhatsApp yazışmalarının SLA ve onay kurallarıyla yönetildiği omnichannel panelidir.

**Gördüğü veriler:**
- Bekleyen, okunmamış, SLA aşım sayıları; konuşma listesi
- Seçili görüşmede özet, AI taslak yanıtlar (öneri)

**Yapabildiği işler:**
- Şablon mesaj, onaylı gönderim, filtreleme, belge ekleme

**Tipik senaryo:**
Operasyon SLA aşımını filtreler, stok sorusuna yanıt verir, fiyat mesajını onaya bırakır.

**Kritik UI öğeleri:**
KPI, filtre, liste + AKSİYON, sağ «Konuşma Bağlamı».

---

## Teklifler Operasyon Masası — `teklifler-operasyon-masasi-acik-mod.png`
**Route:** `/teklifler`, `/teklifler/liste`

**Bu ekran ne?**
Tekliflerin listelendiği, durum ve dönüşümün izlendiği satış operasyon masasıdır.

**Gördüğü veriler:**
- Açık/cevap bekleyen adetler, aylık hacim, dönüşüm %
- Teklif no, cari, tutar, durum, geçerlilik; sağ panel uyarıları

**Yapabildiği işler:**
- Yeni/hızlı teklif, filtre, düzenle, e-posta, takip, dışa aktar

**Tipik senaryo:**
Temsilci cevap bekleyen teklifleri süzer, süresi dolan için revizyon açar.

**Kritik UI öğeleri:**
KPI, filtre, liste + AKSİYON, sağ «Teklif Bağlamı».

---

## Siparişler Operasyon Masası — `siparisler-operasyon-masasi-acik-mod.png`
**Route:** `/siparisler`, `/siparisler/liste`

**Bu ekran ne?**
Kesinleşmiş siparişlerin teslimat ve ödeme aşamasında yönetildiği merkez masadır.

**Gördüğü veriler:**
- Açık sipariş, teslimat bekleyen, riskli sayıları; sipariş satırları
- Seçili siparişte ödeme, kalem, toplamlar

**Yapabildiği işler:**
- Yeni sipariş, sevkiyat, fatura, mesaj; filtre ve dışa aktar

**Tipik senaryo:**
Operasyon teslimat bekleyenleri seçer, sevkiyat başlatır, riskli cariye hatırlatır.

**Kritik UI öğeleri:**
KPI, filtre, durum rozetleri, sağ «Sipariş Bağlamı».

---

## Cariler Operasyon Masası — `cariler-operasyon-masasi-acik-mod.png`
**Route:** `/cariler`, `/cariler/liste`

**Bu ekran ne?**
Bayi ve proje müşterilerinin bakiye, risk ve limit bilgilerinin yönetildiği cari masasıdır.

**Gördüğü veriler:**
- Toplam/aktif cari, riskli bakiye, limit aşımı
- Cari kodu, unvan, şehir, bakiye, risk; sağda limit ve vade

**Yapabildiği işler:**
- Yeni cari, tahsilat, ekstre; arama ve risk filtresi

**Tipik senaryo:**
Tahsilat yüksek riskli cariyi seçer, vadesi geçeni görür, tahsilat kaydı açar.

**Kritik UI öğeleri:**
KPI, filtre, liste + AKSİYON, sağ «Cari Bağlamı».

---

## Tahsilatlar Operasyon Masası — `tahsilatlar-operasyon-masasi-acik-mod.png`
**Route:** `/tahsilatlar`, `/tahsilatlar/liste`

**Bu ekran ne?**
Tahsilat kayıtları ve vadesi geçen alacakların takip edildiği finans masasıdır.

**Gördüğü veriler:**
- Bugün tahsilat, bekleyen, vadesi geçen KPI’ları
- Makbuz no, müşteri, tutar, durum, tarih

**Yapabildiği işler:**
- Yeni/hızlı tahsilat, hatırlatma, onay, yazdır, dışa aktar

**Tipik senaryo:**
Finans vadesi geçeni süzer, hatırlatma gönderir, havaleyi onaylar.

**Kritik UI öğeleri:**
KPI, filtre, liste + AKSİYON, sağ «Tahsilat Bağlamı».
