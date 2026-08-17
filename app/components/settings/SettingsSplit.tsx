import type { ReactNode } from "react";
import type { AppSettingsState } from "../../types/app-design";
import { DesignPreview } from "./DesignPreview";

type Props = {
  settings: AppSettingsState;
  children: ReactNode;
};

export function SettingsSplit({ settings, children }: Props) {
  return (
    <div className="osp-panel">
      <div className="osp-card">{children}</div>
      <DesignPreview settings={settings} />
    </div>
  );
}
