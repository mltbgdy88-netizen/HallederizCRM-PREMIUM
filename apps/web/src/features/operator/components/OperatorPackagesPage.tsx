const PACKAGE_ROWS = [
  {
    code: "core",
    title: "Core",
    description: "Temel CRM, cari, stok okuma, onay foundation ve hızlı işlem.",
    modules: ["core", "users", "settings", "reporting.basic"]
  },
  {
    code: "premium",
    title: "Premium",
    description: "WhatsApp, AI operator, ERP, gelişmiş workflow ve WMS add-onları.",
    modules: ["whatsapp", "ai", "erp", "workflow", "wms", "analytics"]
  },
  {
    code: "enterprise",
    title: "Enterprise",
    description: "Metering, compliance export ve yüksek limitler.",
    modules: ["metering", "compliance", "multi-channel"]
  }
] as const;

export function OperatorPackagesPage() {
  return (
    <div className="hz-operator-page" data-page="operator-packages">
      <header className="hz-operator-page-head">
        <h2>Paketler</h2>
        <p>SaaS paket seviyeleri ve modül matrisi. Kiracı atamaları kiracı listesinden yönetilecektir.</p>
      </header>

      <section className="hz-operator-card-grid">
        {PACKAGE_ROWS.map((pkg) => (
          <article key={pkg.code} className="hz-operator-card hz-operator-card--static">
            <p className="hz-operator-card-code">{pkg.code}</p>
            <h3>{pkg.title}</h3>
            <p>{pkg.description}</p>
            <ul className="hz-operator-module-list">
              {pkg.modules.map((module) => (
                <li key={module}>{module}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <p className="hz-operator-note">
        Plan limitleri ve faturalama metrikleri <code>MODULE_AND_PLAN_MODEL.md</code> hedef şemasına göre bağlanacaktır.
      </p>
    </div>
  );
}
