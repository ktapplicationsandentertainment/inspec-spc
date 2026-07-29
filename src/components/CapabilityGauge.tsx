import './CapabilityGauge.css';

const WIDTH = 400;
const HEIGHT = 90;
const BAR_Y = 30;
const BAR_H = 22;

export function CapabilityGauge({ value, threshold }: { value: number; threshold: number }) {
  const domainMax = Math.max(2, threshold * 1.3, value * 1.15);
  const x = (v: number) => (Math.max(0, Math.min(v, domainMax)) / domainMax) * WIDTH;

  const zones = [
    { from: 0, to: 1.0, color: '#e57373', label: 'Not capable' },
    { from: 1.0, to: threshold, color: '#f6c453', label: 'Marginal' },
    { from: threshold, to: domainMax, color: '#66bb6a', label: 'Capable' },
  ].filter((z) => z.to > z.from);

  const pointerX = x(value);

  return (
    <div className="capability-gauge">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" role="img" aria-label={`Capability index gauge, value ${value.toFixed(2)}`}>
        {zones.map((z) => (
          <rect key={z.label} x={x(z.from)} y={BAR_Y} width={x(z.to) - x(z.from)} height={BAR_H} fill={z.color} />
        ))}
        {/* Reference tick at 1.67, the common "excellent" bar */}
        {domainMax > 1.67 && (
          <line x1={x(1.67)} x2={x(1.67)} y1={BAR_Y - 4} y2={BAR_Y + BAR_H + 4} stroke="#2b2f36" strokeWidth={1} strokeDasharray="3 2" />
        )}
        {/* Pointer for the actual value */}
        <polygon
          points={`${pointerX - 7},${BAR_Y - 10} ${pointerX + 7},${BAR_Y - 10} ${pointerX},${BAR_Y - 1}`}
          fill="#2b2f36"
        />
        <text x={pointerX} y={BAR_Y - 14} textAnchor="middle" fontSize={13} fontWeight={700} fill="#2b2f36">
          {value.toFixed(2)}
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
