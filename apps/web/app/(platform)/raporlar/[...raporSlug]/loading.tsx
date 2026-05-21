export default function RaporDetailLoading() {
  return (
    <div className="hz-reports-page hz-reports-page--detail" aria-busy="true">
      <p className="hz-reports-live-band" role="status">
        <strong>Rapor görünümü yükleniyor…</strong>
        <span>Lütfen bekleyin.</span>
      </p>
    </div>
  );
}
