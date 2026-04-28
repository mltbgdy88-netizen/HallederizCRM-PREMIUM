# Demo Data Map

Bu dosya pilot demo ve test anlatimi icin onemli seed kimliklerini listeler.

## Musteriler
- `customer_1` / `CUS-001` / Aydin Dekor: ana bayi senaryosu.
- `customer_2` / `CUS-002` / Mira Yapi: yuksek risk, tahsilat ve AI follow-up.
- `customer_3` / `CUS-003` / Pera Mimarlik: mimar satis firsati.
- `customer_5` / `CUS-005` / Bursa Duvar Bayi: uzun sure siparis vermeyen cari.
- `customer_8` / `CUS-008` / Kuzey Insaat: blokeli/yuksek borclu cari.

## Urunler
- `prod_1` / `DK-1001`: ana merkez depo urunu.
- `prod_2` / `DK-2022`: kritik stok ve AI stok tahmini.
- `prod_3` / `DK-3308`: fabrika kaynakli satis.
- `prod_5` / `DK-5110`: fabrika stogu yuksek, merkez stogu dusuk.
- `prod_9` / `DK-9100`: yuksek degerli fabrika kaynakli urun.

## Teklifler
- `offer_1` / `OFF-801`: cevap bekleyen teklif.
- `offer_2` / `OFF-798`: siparise donusmus teklif, `order_1` baglanti noktasi.
- `offer_3` / `OFF-792`: draft teklif.
- `offer_4` / `OFF-789`: gonderilmis teklif.

## Siparisler
- `order_1` / `SO-2481`: ana tekliften donusen, kismi tahsilatli, depo/fabrika kaynakli siparis.
- `order_2` / `SO-2478`: fabrika stok bekleyen siparis.
- `order_3` / `SO-2469`: WhatsApp kaynakli manuel siparis.
- `order_4` / `SO-2460`: tamamlanmis siparis.
- `order_5` / `SO-2455`: hazir, teslim bekleyen siparis.
- `order_6` / `SO-2448`: yuksek borclu cari icin fabrika/approval riski.

## Tahsilat, Depo, Teslim, Fatura
- `payment_1` / `PAY-930`: `order_1` icin kismi tahsilat allocation.
- `payment_2` / `PAY-928`: kismi dagitilmis tahsilat.
- `payment_3` / `PAY-923`: allocation bekleyen tahsilat.
- `warehouse_order_1` / `WO-114`: picking durumunda depo emri.
- `warehouse_order_2` / `WO-111`: waiting durumunda depo emri.
- `warehouse_order_3` / `WO-108`: prepared durumunda depo emri.
- `delivery_1` / `DLV-401`: teslim bekleyen hazir kayit.
- `delivery_2` / `DLV-398`: pending teslimat.
- `delivery_3` / `DLV-390`: delivered teslimat.
- `invoice_1` / `INV-1201`: kesilmis fatura.
- `invoice_2` / `INV-1194`: draft fatura.

## Belgeler
- `document_1`: teklif PDF.
- `document_2`: siparis PDF.
- `document_3`: tahsilat makbuzu.
- `document_4`: depo hazirlik notu.
- `document_5`: teslim fisi.
- `document_6`: irsaliye.
- `document_7`: fatura PDF.
- `document_8`: iade notu.
- `document_9`: cari ekstre.

## Operasyon, AI ve Entegrasyon
- `approval_1` / `APR-1001`: eksik tahsilatli teslim onayi.
- `approval_2` / `APR-1002`: AI kaynakli follow-up onayi.
- `ai_proposal_1` / `AI-401`: Mira Yapi tahsilat WhatsApp proposal'i.
- `factory_order_1` / `FO-221`: Ankara Fabrika siparisi.
- `factory_order_2` / `FO-214`: Izmir Fabrika uretim/fallback ornegi.

## Ekran Baglantilari
- `/cariler/customer_1`: ana cari karti.
- `/teklifler/offer_2`: siparise donusmus teklif.
- `/siparisler/order_1`: ana operasyon siparisi.
- `/tahsilatlar/payment_1`: kismi tahsilat.
- `/depo/emirler/warehouse_order_1`: picking depo emri.
- `/teslimatlar/delivery_1`: teslim dogrulama.
- `/faturalar/invoice_1`: kesilmis fatura.
- `/belgeler?document=document_2`: siparis belgesi.
- `/whatsapp`: baglamli konusma paneli.
- `/ai`: proposal, insight ve approval execution merkezi.

