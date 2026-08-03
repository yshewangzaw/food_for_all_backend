/**
 * Dependency-free SVG donut for share-of-total breakdowns.
 * data: [{ label, value, color }]
 */
const DonutChart = ({ data = [], size = 170, thickness = 24 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (!total) {
    return <p className="u-muted u-small">No data to chart yet.</p>;
  }

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="u-flex u-items-center u-gap-5 u-wrap">
      <svg width={size} height={size} role="img" aria-label="Donut chart">
        <g transform={`translate(${size / 2}, ${size / 2}) rotate(-90)`}>
          {data.map((item) => {
            const share = item.value / total;
            const dash = share * circumference;
            const segment = (
              <circle
                key={item.label}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
              >
                <title>{`${item.label}: ${item.value}`}</title>
              </circle>
            );
            offset += dash;
            return segment;
          })}
        </g>
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "20px",
            fontWeight: 600,
            fill: "var(--ink-900)",
          }}
        >
          {total}
        </text>
      </svg>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {data.map((item) => (
          <li key={item.label} className="u-small u-muted" style={{ marginBottom: 6 }}>
            <span className="chart__swatch" style={{ background: item.color }} />
            {item.label}
            <strong style={{ marginLeft: 8, color: "var(--text)" }}>{item.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DonutChart;
