import { useRef } from 'react';
import type { ChartSeries } from '../lib/spc/types';
import './ControlChartView.css';

const WIDTH = 720;
const HEIGHT = 280;
const PAD = { top: 20, right: 20, bottom: 32, left: 64 };

export function ControlChartView({ series }: { series: ChartSeries }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { points, centerLine, ucl, lcl } = series;

  const values = points.map((p) => p.value);
  const yMin = Math.min(lcl, ...values);
  const yMax = Math.max(ucl, ...values);
  const yPad = (yMax - yMin || 1) * 0.1;
  const domainMin = yMin - yPad;
  const domainMax = yMax + yPad;

  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;

  const x = (i: number) =>
    PAD.left + (points.length <= 1 ? plotW / 2 : (i / (points.length - 1)) * plotW);
  const y = (v: number) =>
    PAD.top + plotH - ((v - domainMin) / (domainMax - domainMin)) * plotH;

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.value)}`).join(' ');

  function downloadPng() {
    const svg = svgRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = WIDTH * 2;
      canvas.height = HEIGHT * 2;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement('a');
        link.download = `${series.title.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
      });
    };
    img.src = url;
  }

  return (
    <div className="control-chart-view">
      <div className="control-chart-header">
        <h3>{series.title}</h3>
        <button type="button" onClick={downloadPng}>
          Download PNG
        </button>
      </div>
      <svg ref={svgRef} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" role="img" aria-label={series.title}>
        <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="white" />

        {/* Control limit lines */}
        <GuideLine label={`UCL ${ucl.toFixed(3)}`} yPos={y(ucl)} width={WIDTH} pad={PAD} color="#c0392b" />
        <GuideLine label={`CL ${centerLine.toFixed(3)}`} yPos={y(centerLine)} width={WIDTH} pad={PAD} color="#4a5568" dashed />
        <GuideLine label={`LCL ${lcl.toFixed(3)}`} yPos={y(lcl)} width={WIDTH} pad={PAD} color="#c0392b" />

        {/* Data line */}
        <path d={linePath} fill="none" stroke="#2463eb" strokeWidth={1.5} />

        {/* Points */}
        {points.map((p, i) => {
          const flagged = p.violations.length > 0;
          return (
            <circle
              key={i}
              cx={x(i)}
              cy={y(p.value)}
              r={flagged ? 5 : 3.5}
              fill={flagged ? '#c0392b' : '#2463eb'}
            >
              <title>
                {p.label}: {p.value.toFixed(3)}
                {flagged ? ` (rule ${p.violations.join(', ')} violation)` : ''}
              </title>
            </circle>
          );
        })}

        {/* X axis labels (sparse) */}
        {points.map((p, i) =>
          i % Math.max(1, Math.ceil(points.length / 12)) === 0 ? (
            <text key={i} x={x(i)} y={HEIGHT - 8} fontSize={10} textAnchor="middle" fill="#6b7280">
              {p.label}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  );
}

function GuideLine({
  label,
  yPos,
  width,
  pad,
  color,
  dashed,
}: {
  label: string;
  yPos: number;
  width: number;
  pad: typeof PAD;
  color: string;
  dashed?: boolean;
}) {
  return (
    <g>
      <line
        x1={pad.left}
        x2={width - pad.right}
        y1={yPos}
        y2={yPos}
        stroke={color}
        strokeWidth={1}
        strokeDasharray={dashed ? '4 3' : undefined}
      />
      <text x={pad.left - 6} y={yPos + 3} fontSize={10} textAnchor="end" fill={color}>
        {label}
      </text>
    </g>
  );
}
