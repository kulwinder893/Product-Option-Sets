import type { OptionSetStatus } from "@prisma/client";
import { OPTION_SET_STATUS_LABELS } from "../../constants";

const TONE: Record<OptionSetStatus, "success" | "caution" | "neutral" | "info"> = {
  ACTIVE: "success",
  DISABLED: "caution",
  ARCHIVED: "neutral",
};

type Props = {
  status: OptionSetStatus;
};

export function OptionSetStatusBadge({ status }: Props) {
  return (
    <s-badge tone={TONE[status]}>
      {OPTION_SET_STATUS_LABELS[status] ?? status}
    </s-badge>
  );
}
