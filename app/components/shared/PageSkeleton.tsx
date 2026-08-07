type Props = {
  rows?: number;
};

export function PageSkeleton({ rows = 5 }: Props) {
  return (
    <s-section>
      <s-stack direction="block" gap="base">
        {Array.from({ length: rows }).map((_, index) => (
          <s-box
            key={index}
            padding="base"
            borderWidth="base"
            borderRadius="base"
            background="subdued"
          >
            <s-stack direction="block" gap="small">
              <div
                style={{
                  height: 14,
                  width: `${55 + (index % 3) * 12}%`,
                  background: "var(--p-color-bg-fill-tertiary, #dfe3e8)",
                  borderRadius: 4,
                }}
              />
              <div
                style={{
                  height: 10,
                  width: "35%",
                  background: "var(--p-color-bg-fill-tertiary, #dfe3e8)",
                  borderRadius: 4,
                }}
              />
            </s-stack>
          </s-box>
        ))}
      </s-stack>
    </s-section>
  );
}
