import { useRef } from 'react';
import type { ParetoCategory } from '../lib/pareto/pareto';
import './ParetoView.css';

const WIDTH = 720;
const HEIGHT = 380;
const PAD = { top: 20, right: 48, bottom: 90, left: 56 };

export function ParetoView({ categories, threshold }: { categories: ParetoCategory[]; threshold: number }) {
  const svgRef = useRef<SVGSVGElement>(null);

  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const maxValue = Math.max(...categories.map((c) => c.value));

  const bandWidth = plotW / categories.length;
  const xCenter = (i: number) => PAD.left + bandWidth * (i + 0.5);
  const yValue = (v: number) => PAD.top + plotH - (v / (maxValue * 1.1)) * plotH;
  const yPercent = (p: number) => PAD.top + plotH - (p / 100) * plotH;

  const linePath = categories
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${xCenter(i)} ${yPercent(c.cumulativePercent)}`)
    .join(' ');

  function downloadPng() {
    const svg = svgRef.current;
    if (!svg) return;
    const svgString = new XMLSerializer().serializeToString(svg);
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
        link.download = 'pareto-chart.png';
        link.href = URL.createObjectURL(blob);
        link.click();
      });
    };
    img.src = url;
  }

  return (
    <div className="pareto-view">
      <div className="control-chart-header">
        <h3>Pareto Chart</h3>
        <button type="button" onClick={downloadPng}>
          Download PNG
        </button>
      </div>
      <svg ref={svgRef} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" role="img" aria-label="Pareto chart">
        <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="white" />

        {/* 80% reference line */}
        <line
          x1={PAD.left}
          x2={WIDTH - PAD.right}
          y1={yPercent(threshold)}
          y2={yPercent(threshold)}
          stroke="#9aa1ab"
          strokeDasharray="4 3"
        />
        <text x={WIDTH - PAD.right + 4} y={yPercent(threshold) + 3} fontSize={10} fill="#6b7280">
          {threshold}%
        </text>

        {/* Bars */}
        {categories.map((c, i) => (
          <rect
            key={c.label}
            x={xCenter(i) - bandWidth * 0.35}
            y={yValue(c.value)}
            width={bandWidth * 0.7}
            height={PAD.top + plotH - yValue(c.value)}
            fill={c.isVitalFew ? '#2463eb' : '#b7c4d9'}
          >
            <title>
              {c.label}: {c.value} ({c.percentOfTotal.toFixed(1)}%)
            </title>
          </rect>
        ))}

        {/* Cumulative line */}
        <path d={linePath} fill="none" stroke="#c0392b" strokeWidth={2} />
        {categories.map((c, i) => (
          <circle key={c.label} cx={xCenter(i)} cy={yPercent(c.cumulativePercent)} r={3.5} fill="#c0392b">
            <title>Cumulative: {c.cumulativePercent.toFixed(1)}%</title>
          </circle>
        ))}

        {/* Category labels, rotated to fit */}
        {categories.map((c, i) => (
          <text
            key={c.label}
            x={xCenter(i)}
            y={PAD.top + plotH + 14}
            fontSize={10}
            fill="#4a5568"
            textAnchor="end"
            transform={`rotate(-40 ${xCenter(i)} ${PAD.top + plotH + 14})`}
          >
            {c.label}
          </text>
        ))}

        {/* Right axis ticks (0/25/50/75/100%) */}
        {[0, 25, 50, 75, 100].map((p) => (
          <text key={p} x={WIDTH - PAD.right + 4} y={yPercent(p) + 3} fontSize={9} fill="#9aa1ab">
            {p}%
          </text>
        ))}
      </svg>
    </div>
  );
}
