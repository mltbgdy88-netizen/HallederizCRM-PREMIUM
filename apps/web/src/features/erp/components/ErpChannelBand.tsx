import type { ErpChannelHealthView } from "../utils/map-erp-channel-view";

export function ErpChannelBand({
  channelView,
  loading
}: {
  channelView: ErpChannelHealthView;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <p className="erpf-channel-band erpf-channel-band--warn" role="status">
        <span className="erpf-channel-dot erpf-channel-dot--warn" aria-hidden />
        <strong>ERP durumu yükleniyor</strong>
        <span>Kanal sağlık kontrolü sürüyor…</span>
      </p>
    );
  }

  return (
    <p className={`erpf-channel-band erpf-channel-band--${channelView.dotTone}`} role="status">
      <span className={`erpf-channel-dot erpf-channel-dot--${channelView.dotTone}`} aria-hidden />
      <strong>{channelView.statusLine}</strong>
      <span>{channelView.note}</span>
    </p>
  );
}
