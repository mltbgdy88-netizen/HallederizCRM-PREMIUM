import { PanelRedirectClient } from "../../../src/features/panel/components/PanelRedirectClient";

/** Panel menü rotası gösterge paneli ile aynı ana ekranı açar. İstemci: redirect("/dashboard") */
export default function PanelPage() {
  return <PanelRedirectClient />;
}
