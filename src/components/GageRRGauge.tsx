import './CapabilityGauge.css';

const WIDTH = 400;
const HEIGHT = 90;
const BAR_Y = 30;
const BAR_H = 22;

/** Same visual language as CapabilityGauge, but with AIAG's fixed %GRR zones (lower is better). */
export function GageRRGauge({ percentGrr }: { percentGrr: number }) {
  const domainMax = Math.max(40, percentGrr * 1.15);
  const x = (v: number) => (Math.max(0, Math.min(v, domainMax)) / domainMax) * WIDTH;

  const zones = [
    { from: 0, to: 10, color: '#66bb6a', label: 'Acceptable' },
    { from: 10, to: 30, color: '#f6c453', label: 'Marginal' },
    { from: 30, to: domainMax, color: '#e57373', label: 'Unacceptable' },
  ].filter((z) => z.to > z.from);

  const pointerX = x(percentGrr);

  return (
    <div className="capability-gauge">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" role="img" aria-label={`Percent Gage R&R, value ${percentGrr.toFixed(1)}%`}>
        {zones.map((z) => (
          <rect key={z.label} x={x(z.from)} y={BAR_Y} width={x(z.to) - x(z.from)} height={BAR_H} fill={z.color} />
        ))}
        <polygon
          points={`${pointerX - 7},${BAR_Y - 10} ${pointerX + 7},${BAR_Y - 10} ${pointerX},${BAR_Y - 1}`}
          fill="#2b2f36"
        />
        <text x={pointerX} y={BAR_Y - 14} textAnchor="middle" fontSize={13} fontWeight={700} fill="#2b2f36">
          {percentGrr.toFixed(1)}%
        </text>
        {zones.map((z) => (
          <text key={z.label} x={(x(z.from) + x(z.to)) / 2} y={BAR_Y + BAR_H + 18} textAnchor="middle" fontSize={10} fill="#6b7280">
            {z.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
