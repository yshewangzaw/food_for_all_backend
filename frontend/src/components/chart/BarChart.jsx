/**
 * Small dependency-free SVG bar chart.
 * data: [{ label, value, color? }]
 *
 * Used on the dashboard for the status breakdowns that come out of
 * dashboardService.getOverview(). No chart library needed.
 */
const BarChart = ({ data = [], height = 190, formatValue = (value) => value }) => {
  if (!data.length) {
    return <p className="u-muted u-small">No data to chart yet.</p>;
  }

  const width = 520;
  const padding = { top: 14, right: 10, bottom: 30, left: 10 };
  const plotHeight = height - padding.top - padding.bottom;
  const plotWidth = width - padding.left - padding.right;
  const max = Math.max(...data.map((item) => item.value), 1);
  const slot = plotWidth / data.length;
  const barWidth = Math.min(52, slot * 0.6);

  return (
    <svg
      className="chart"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Bar chart"
    >
      {/* baseline */}
      <line
        className="chart__grid"
        x1={padding.left}
        y1={padding.top + plotHeight}
        x2={width - padding.right}
        y2={padding.top + plotHeight}
      />

      {data.map((item, index) => {
        const barHeight = Math.max(2, (item.value / max) * plotHeight);
        const x = padding.left + index * slot + (slot - barWidth) / 2;
        const y = padding.top + plotHeight - barHeight;

        return (
          <g key={item.label}>
            <rect
              className="chart__bar"
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx="3"
              fill={item.color || "var(--brand)"}
            >
              <title>{`${item.label}: ${formatValue(item.value)}`}</title>
            </rect>
            <text className="chart__value" x={x + barWidth / 2} y={y - 5} textAnchor="middle">
              {formatValue(item.value)}
            </text>
            <text
              className="chart__label"
              x={x + barWidth / 2}
              y={padding.top + plotHeight + 18}
              textAnchor="middle"
            >
              {item.label.length > 12 ? `${item.label.slice(0, 11)}…` : item.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default BarChart;
