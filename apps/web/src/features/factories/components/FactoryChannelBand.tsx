import type { FactoryChannelHealthView } from "../utils/map-factory-channel-view";

export function FactoryChannelBand({
  channelView,
  loading
}: {
  channelView: FactoryChannelHealthView;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <p className="fabf-channel-band fabf-channel-band--warn" role="status">
        <span className="fabf-channel-dot fabf-channel-dot--warn" aria-hidden />
        <strong>Fabrika durumu yükleniyor</strong>
        <span>Kanal sağlık kontrolü sürüyor…</span>
      </p>
    );
  }

  return (
    <p className={`fabf-channel-band fabf-channel-band--${channelView.dotTone}`} role="status">
      <span className={`fabf-channel-dot fabf-channel-dot--${channelView.dotTone}`} aria-hidden />
      <strong>{channelView.statusLine}</strong>
      <span>{channelView.note}</span>
    </p>
  );
}
