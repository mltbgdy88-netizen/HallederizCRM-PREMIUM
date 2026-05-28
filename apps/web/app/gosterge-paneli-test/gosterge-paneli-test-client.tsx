"use client";

import styles from "./gosterge-paneli-test.module.css";

const kpis = [
  {
    value: "7",
    title: "Fabrikaya Verilecek",
    detail: "2 siparis - 3+ gun",
    tone: "orange"
  },
  {
    value: "11",
    title: "Depoda Haz\u0131rlanacak",
    detail: "4 is - bugun kapanmal\u0131",
    tone: "mint"
  },
  {
    value: "6",
    title: "M\u00FC\u015Fteriye Teslim",
    detail: "3 m\u00FC\u015Fteri - randevu ge\u00E7ti",
    tone: "green"
  },
  {
    value: "4",
    title: "Kargo Bekliyor",
    detail: "1 paket - 5. gun",
    tone: "blue"
  },
  {
    value: "3",
    title: "Onay Bekleyen",
    detail: "\u0130skonto + tahsilat",
    tone: "gold"
  },
  {
    value: "8",
    title: "Geciken \u0130\u015F",
    detail: "\u00D6ncelikli liste",
    tone: "slate"
  }
];

const conversations = [
  {
    id: "#WAP-1587",
    phone: "+90 538 *** 34",
    cari: "Demir Yap\u0131 A.\u015E.",
    message: "Merhaba, teklifimiz hakk\u0131nda bilgi alabilir miyim?",
    time: "10:24",
    status: "Onay Bekliyor",
    sla: "2s 15dk",
    tone: "warn"
  },
  {
    id: "#WAP-1582",
    phone: "+90 533 210 44 11",
    cari: "Nova \u0130n\u015Faat Ltd.",
    message: "Sevkiyat tarihini netle\u015Ftirebilir misiniz?",
    time: "14:08",
    status: "Beklemede",
    sla: "28 dk",
    tone: "blue"
  },
  {
    id: "#WAP-1576",
    phone: "+90 542 880 12 03",
    cari: "Kuzey Mobilya",
    message: "Stok listesini WhatsApp \u00FCzerinden payla\u015Ft\u0131k.",
    time: "13:54",
    status: "Aktif",
    sla: "1s 04dk",
    tone: "green"
  },
  {
    id: "#WAP-1569",
    phone: "+90 536 991 77 45",
    cari: "Atlas Dekor",
    message: "\u00D6deme plan\u0131 onayland\u0131, te\u015Fekk\u00FCrler.",
    time: "13:31",
    status: "Tamamland\u0131",
    sla: "Tamam",
    tone: "green"
  },
  {
    id: "#WAP-1561",
    phone: "+90 505 332 19 88",
    cari: "Ege Yap\u0131 Market",
    message: "\u015Eablon mesaj m\u00FC\u015Fteriye iletildi.",
    time: "12:47",
    status: "Aktif",
    sla: "45 dk",
    tone: "green"
  },
  {
    id: "#WAP-1554",
    phone: "+90 531 774 02 16",
    cari: "Vadi Seramik",
    message: "\u0130ade s\u00FCreci i\u00E7in onay bekleniyor.",
    time: "12:15",
    status: "Onay Bekliyor",
    sla: "6 dk",
    tone: "red"
  },
  {
    id: "#WAP-1548",
    phone: "+90 544 660 55 90",
    cari: "Merkez Toptan",
    message: "Fiyat revizyonu payla\u015F\u0131ld\u0131.",
    time: "11:58",
    status: "Beklemede",
    sla: "1s 22dk",
    tone: "blue"
  },
  {
    id: "#WAP-1541",
    phone: "+90 538 120 44 73",
    cari: "Park Yap\u0131 Malzeme",
    message: "Teslimat adresi g\u00FCncellendi.",
    time: "11:36",
    status: "Tamamland\u0131",
    sla: "Tamam",
    tone: "green"
  }
];

const alerts = [
  "Demir\u00F6z Elekt. - SP-2412 - fabrikaya verilmedi - 3. g\u00FCn",
  "Kaya Yap\u0131 - SP-2409 - depo haz\u0131rl\u0131\u011F\u0131 yar\u0131m - 2. g\u00FCn",
  "Akdeniz Oto. - SP-2405 - kargo \u00E7\u0131k\u0131\u015F\u0131 yok - 5. g\u00FCn",
  "ABC \u0130n\u015Faat - SP-2401 - ma\u011Fazada teslim bekliyor - 1. g\u00FCn",
  "Y\u0131lmaz G\u0131da - SP-2396 - fabrika + depo b\u00F6l\u00FCnm\u00FC\u015F - 4. g\u00FCn",
  "Mega Market - SP-2392 - iskonto onay\u0131 - 2. g\u00FCn"
];

const summary = [
  ["Fabrikaya verilecek", "7 sipari\u015F", "3 tanesi 3+ g\u00FCn bekliyor"],
  ["Depoda haz\u0131rlanacak", "11 sipari\u015F", "4 i\u015F bug\u00FCn kapanmal\u0131"],
  ["M\u00FC\u015Fteriye teslim", "6 m\u00FC\u015Fteri", "3 randevu saati ge\u00E7ti"],
  ["Kargo \u00E7\u0131k\u0131\u015F bekleyen", "4 paket", "1 paket 5. g\u00FCnde"]
];

const quickActions = [
  "Yeni Sipari\u015F",
  "Tahsilat Ekle",
  "Teklif Haz\u0131rla",
  "M\u00FC\u015Fteri Ekle",
  "Stok Giri\u015Fi",
  "G\u00F6rev Olu\u015Ftur"
];

const aiNotes = [
  "Demir\u00F6z Elekt. fabrika emri 3. g\u00FCnde; \u00F6nce fabrikaya ver.",
  "Akdeniz Oto. kargo 5. g\u00FCn; m\u00FC\u015Fteriyi bilgilendir.",
  "4 depo haz\u0131rl\u0131\u011F\u0131 bug\u00FCn kapanmal\u0131.",
  "3 teslim randevusu saati ge\u00E7ti."
];

function Badge({ tone, children }: { tone: string; children: React.ReactNode }) {
  return <span className={`${styles.badge} ${styles[`badge_${tone}`]}`}>{children}</span>;
}

export default function GostergePaneliTestClient() {
  return (
    <main className={styles.page}>
      <section className={styles.kpiGrid} aria-label="Kritik operasyon g\u00F6stergeleri">
        {kpis.map((kpi) => (
          <article key={kpi.title} className={`${styles.kpiCard} ${styles[`kpi_${kpi.tone}`]}`}>
            <div className={styles.kpiIcon}>!</div>
            <div>
              <strong>{kpi.value}</strong>
              <h2>{kpi.title}</h2>
              <p>{kpi.detail}</p>
              <span>Acil takip</span>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.mainGrid}>
        <article className={`${styles.panel} ${styles.conversationPanel}`}>
          <header className={styles.panelHeader}>
            <h2>Aktif Konu\u015Fmalar</h2>
            <button type="button">WhatsApp Masas\u0131</button>
          </header>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Konu\u015Fma</th>
                  <th>Cari</th>
                  <th>Son Mesaj</th>
                  <th>Durum</th>
                  <th>SLA</th>
                  <th>Aksiyon</th>
                </tr>
              </thead>
              <tbody>
                {conversations.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.id}</strong>
                      <small>{item.phone}</small>
                    </td>
                    <td>{item.cari}</td>
                    <td>
                      {item.message}
                      <small>{item.time}</small>
                    </td>
                    <td>
                      <Badge tone={item.tone}>{item.status}</Badge>
                    </td>
                    <td>{item.sla}</td>
                    <td>
                      <div className={styles.actions}>
                        <button type="button">Mesaj</button>
                        <button type="button">A\u00E7</button>
                        <button type="button">...</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className={styles.tableFooter}>1-8 / 120 konu\u015Fma</footer>
        </article>

        <aside className={styles.midColumn}>
          <article className={styles.panel}>
            <header className={styles.panelHeader}>
              <h2>Acil Takip Uyar\u0131lar\u0131</h2>
              <button type="button">T\u00FCm\u00FCn\u00FC G\u00F6r</button>
            </header>
            <ul className={styles.alertList}>
              {alerts.map((alert) => (
                <li key={alert}>
                  <span>!</span>
                  <p>{alert}</p>
                </li>
              ))}
            </ul>
          </article>

          <article className={styles.panel}>
            <header className={styles.panelHeader}>
              <h2>Acil \u0130\u015F \u00D6zeti</h2>
            </header>
            <ul className={styles.summaryList}>
              {summary.map(([label, value, detail]) => (
                <li key={label}>
                  <div>
                    <strong>{label}</strong>
                    <small>{detail}</small>
                  </div>
                  <b>{value}</b>
                </li>
              ))}
            </ul>
          </article>

          <article className={styles.panel}>
            <header className={styles.panelHeader}>
              <h2>Acil \u0130\u015F Da\u011F\u0131l\u0131m\u0131</h2>
            </header>
            <div className={styles.donutArea}>
              <div className={styles.donut}>
                <span>Acil \u0130\u015F</span>
                <strong>28</strong>
              </div>
              <ul>
                <li><span className={styles.orangeDot}></span>Fabrika emri <b>%25</b></li>
                <li><span className={styles.greenDot}></span>Depo haz\u0131rl\u0131k <b>%39</b></li>
                <li><span className={styles.tealDot}></span>Teslimat <b>%22</b></li>
                <li><span className={styles.blueDot}></span>Kargo bekleyen <b>%14</b></li>
              </ul>
            </div>
          </article>
        </aside>

        <aside className={`${styles.panel} ${styles.aiPanel}`}>
          <header className={styles.panelHeader}>
            <h2>AI Asistan</h2>
          </header>

          <div className={styles.videoBox}>
            <button type="button" aria-label="Videoyu oynat">▶</button>
            <strong>Acil i\u015F ve geciken sipari\u015F \u00F6zeti haz\u0131r.</strong>
            <div className={styles.progress}>
              <span></span>
            </div>
            <small>01:24 / 03:15</small>
          </div>

          <p>
            Merhaba Yusuf Bey, bug\u00FCn 28 acil i\u015F var. Fabrika emri ve kargo bekleyenleri
            \u00F6nce videoda \u00F6zetledim.
          </p>

          <h3>\u00D6ne \u00C7\u0131kanlar</h3>
          <ul className={styles.aiList}>
            {aiNotes.map((note) => (
              <li key={note}>✓ {note}</li>
            ))}
          </ul>
        </aside>
      </section>

      <section className={styles.quickBar} aria-label="H\u0131zl\u0131 i\u015Flemler">
        {quickActions.map((action) => (
          <button type="button" key={action}>
            <span>+</span>
            {action}
          </button>
        ))}
      </section>
    </main>
  );
}
