type Props = {
  active: boolean;
  title: string;
  detail: string;
  onClick: () => void;
};

/** One selectable card in Style / Shape settings. */
export function ChoiceCard({ active, title, detail, onClick }: Props) {
  return (
    <button
      type="button"
      className={`osp-choice${active ? " is-active" : ""}`}
      onClick={onClick}
    >
      <strong>{title}</strong>
      <span>{detail}</span>
    </button>
  );
}
