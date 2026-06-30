import type { LocalAiChannelHealthView } from "../utils/map-local-ai-channel-view";

export function LocalAiChannelBand({ channelView }: { channelView: LocalAiChannelHealthView }) {
  return (
    <p className={`aif-channel-band aif-channel-band--${channelView.dotTone}`} role="status">
      <span className={`aif-channel-dot aif-channel-dot--${channelView.dotTone}`} aria-hidden />
      <strong>{channelView.statusLine}</strong>
      <span>{channelView.note}</span>
    </p>
  );
}
