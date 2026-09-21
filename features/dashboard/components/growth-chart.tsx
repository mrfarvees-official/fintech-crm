export function GrowthChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const width = 480;
  const height = 140;
  const barWidth = width / data.length - 12;

  return (
    <svg
      viewBox={`0 0 ${width} ${height + 24}`}
      className="mt-3 w-full max-w-lg"
    >
      {data.map((d, i) => {
        const barHeight = (d.value / max) * height;
        const x = i * (width / data.length) + 6;
        const y = height - barHeight;
        return (
          <g key={d.label}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={3}
              className="fill-ledger"
            />
            <text
              x={x + barWidth / 2}
              y={height + 16}
              textAnchor="middle"
              fontSize="10"
              className="fill-current text-steel"
            >
              {d.label}
            </text>
            <text
              x={x + barWidth / 2}
              y={y - 4}
              textAnchor="middle"
              fontSize="10"
              className="fill-current text-ink-soft"
            >
              {d.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
