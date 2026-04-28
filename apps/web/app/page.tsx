import { PlaceholderCard } from "@hallederiz/ui";

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">HallederizCRM-PREMIUM</p>
        <h1>Kurumsal CRM ve Operasyon Motoru Baslangici</h1>
        <p className="subtitle">
          Bu ekran, cok kiracili platformun temiz bootstrap durumunu gosterir.
          Is mantigi bir sonraki iterasyonlarda eklenecektir.
        </p>
      </section>

      <PlaceholderCard
        title="Bootstrap Hazir"
        description="apps/web Next.js tabanli olarak calisiyor. Domain, SDK ve entegrasyon katmanlari icin temel monorepo omurgasi olusturuldu."
      />
    </main>
  );
}
