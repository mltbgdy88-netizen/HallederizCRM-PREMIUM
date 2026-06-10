export default function PanelLoading() {
  return (
    <main className="hz-panel-redirect" aria-busy="true">
      <div className="hz-panel-redirect-spinner" role="presentation" />
      <p className="hz-panel-redirect-text">Gösterge paneline yönlendiriliyorsunuz.</p>
    </main>
  );
}

