# UI Integration Stabilization Tracker

Bu dosya `integration/ui-screens` branch üzerinde UI entegrasyon işlerini küçük, geri alınabilir ve test edilebilir adımlara bölmek için tutulur.

## Sabit kural

Kontrol: `.next`, `node_modules`, `dist`, `build`, `.env` ve `tsconfig.tsbuildinfo` entegrasyon kaynağı değildir; bunlar taşınmayacak.

Ek olarak `.runtime-next-dev`, `.pnpm-store`, `.turbo`, `coverage`, `.cache`, `tmp`, `logs` da kaynak değildir.

## Güvenilir kaynaklar

1. `main` branch ana proje kaynağıdır.
2. `reference/final-ui-source` final UI referans branch'idir.
3. `integration/ui-screens` kontrollü entegrasyon branch'idir.

`reference/final-ui-source` doğrudan merge edilmeyecek. Dosyalar tek tek seçilecek.

## Mimari sınırlar

- Main branch'e doğrudan işlem yok.
- Force push yok.
- Büyük tek parça merge yok.
- Eski veya ayrı auth provider taşınmayacak.
- Eski veya ayrı API client taşınmayacak.
- `localStorage` session mantığı eklenmeyecek.
- Tenant context olmadan mutation yok.
- Permission olmadan mutation yok.
- Role string ile iş kararı yok.
- AI doğrudan execute etmeyecek; proposal + insan onayı + dispatcher + audit kuralı korunacak.
- WhatsApp ve onay ekranları gerçek işlem yapmayacak; önce read-only/reference UI olarak entegre edilecek.

## Mevcut durum

- `backup/main-before-ui-integration` oluşturuldu.
- `integration/ui-screens` oluşturuldu.
- `reference/final-ui-source` GitHub'a push edildi.
- Ana sayfa referans denemesi eklendi fakat final sayfa olarak kabul edilmeyecek.
- `gosterge-paneli-test` için temiz, self-contained test ekranı hedefleniyor.

## İş sırası

### 1. Entegrasyon branch temizliği

- [ ] Eski bozuk ana-sayfa referans dosyalarını final kapsamdan çıkar.
- [ ] `layout.tsx` içinde gereksiz global CSS importlarını kaldır.
- [ ] `gosterge-paneli-test` ekranını self-contained hale getir.
- [ ] Reference branch'ten gelen ama kullanılmayan global CSS dosyalarını production route'a bağlama.

Kalite kapısı:

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm test
```

### 2. Gösterge paneli / operasyon paneli

- [ ] `reference/final-ui-source` içindeki gösterge paneli dosyalarını incele.
- [ ] `@/` alias importlarını ana proje standardına uydur.
- [ ] Link `href` değerlerini undefined olmayacak hale getir.
- [ ] Mock/reference data'yı production veri gibi bağlama.
- [ ] Önce `/gosterge-paneli-test` altında çalıştır.
- [ ] Görsel doğrulama sonrası `/dashboard` veya `/ana-sayfa` kararını ayrıca ver.

Kalite kapısı:

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm test
```

### 3. WhatsApp operasyon ekranları

- [ ] `features/whatsapp` dosyalarını referans branch'ten dosya bazlı seç.
- [ ] WhatsApp UI'ı önce read-only/reference ekran olarak bağla.
- [ ] Gerçek webhook, gönderim, mesaj onayı veya mutation ekleme.
- [ ] SDK dışı fetch/axios kullanımını engelle.
- [ ] Permission ve tenant gerektiren alanları ileride guard ile bağlamak üzere işaretle.

Kalite kapısı:

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm test
```

### 4. Onaylar / approvals

- [ ] `approvals`, `onaylar`, `approval` isimli dosyaları bul.
- [ ] Ekranı önce read-only/reference olarak bağla.
- [ ] Onay verme, reddetme, execution, dispatcher gibi işlemleri gerçek mutation'a bağlama.
- [ ] Approval + audit kurallarını bypass etme.

Kalite kapısı:

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm test
```

### 5. CRM ekranları

Sıra:

1. Cariler
2. Teklifler
3. Siparişler
4. Stok
5. Depo
6. Görevler
7. Belgeler

Her ekran için:

- [ ] Presentational mı kontrol et.
- [ ] Mock data'yı ayır.
- [ ] API client veya fetch var mı kontrol et.
- [ ] Tenant/permission/mutation riskini işaretle.
- [ ] Önce read-only UI olarak bağla.

Kalite kapısı:

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm test
```

### 6. Kritik ekranlar

En sona bırakılacaklar:

- Faturalar
- Tahsilatlar
- Roller
- Kullanıcılar
- Sistem
- Ayarlar
- ERP / fabrika entegrasyonları

Bu ekranlarda gerçek mutation sadece tenant + permission + approval + audit kuralları tamamlanınca bağlanacak.

## Her iş bitiminde yapılacak kontrol

1. `git status`
2. Yasak dosya var mı kontrol et.
3. `pnpm typecheck`
4. `pnpm lint`
5. `pnpm build`
6. `pnpm test`
7. Küçük commit.
8. Push.
9. Bu dosyadaki ilgili kutucuğu güncelle.

## Son not

Her okumada önce sabit kuralı tekrar kontrol et.

Sıradaki işe geç.
