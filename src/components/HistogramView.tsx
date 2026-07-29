import { useRef } from 'react';
import type { HistogramResult } from '../lib/histogram/histogram';
import { normalPdf } from '../lib/capability/normalDist';
import './HistogramView.css';

const WIDTH = 720;
const HEIGHT = 320;
const PAD = { top: 20, right: 20, bottom: 32, left: 48 };

export function HistogramView({
  result,
  showNormalCurve,
}: {
  result: HistogramResult;
  showNormalCurve: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { bins, mean, stdDev, n } = result;

  const domainMin = bins[0].start;
  const domainMax = bins[bins.length - 1].end;
  const maxCount = Math.max(...bins.map((b) => b.count));
  const avgBinWidth = (domainMax - domainMin) / bins.length;
  const curvePeakCount = stdDev > 0 ? n * avgBinWidth * normalPdf(mean, mean, stdDev) : 0;
  const yMax = Math.max(maxCount, curvePeakCount) * 1.15 || 1;

  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;

  const x = (v: number) => PAD.left + ((v - domainMin) / (domainMax - domainMin || 1)) * plotW;
  const y = (count: number) => PAD.top + plotH - (count / yMax) * plotH;

  const curvePath = (() => {
    if (!showNormalCurve || stdDev <= 0) return '';
    const steps = 60;
    const points = Array.from({ length: steps + 1 }, (_, i) => {
      const xv = domainMin + (i / steps) * (domainMax - domainMin);
      const expectedCount = n * avgBinWidth * normalPdf(xv, mean, stdDev);
      return `${i === 0 ? 'M' : 'L'} ${x(xv)} ${y(expectedCount)}`;
    });
    return points.join(' ');
  })();

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
        link.download = 'histogram.png';
        link.href = URL.createObjectURL(blob);
        link.click();
      });
    };
    img.src = url;
  }

  return (
    <div className="histogram-view">
      <div className="control-chart-header">
        <h3>Histogram</h3>
        <button type="button" onClick={downloadPng}>
          Download PNG
        </button>
      </div>
      <svg ref={svgRef} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" role="img" aria-label="Histogram">
        <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="white" />

        {bins.map((b, i) => (
          <rect
            key={i}
            x={x(b.start) + 1}
            y={y(b.count)}
            width={Math.max(0, x(b.end) - x(b.start) - 2)}
            height={plotH - (y(b.count) - PAD.top)}
            fill="#2463eb"
          >
            <title>
              {b.start.toFixed(2)} - {b.end.toFixed(2)}: {b.count}
            </title>
          </rect>
        ))}

        {showNormalCurve && curvePath && (
          <path d={curvePath} fill="none" stroke="#c0392b" strokeWidth={2} />
        )}

        {/* Axis line */}
        <line x1={PAD.left} x2={WIDTH - PAD.right} y1={PAD.top + plotH} y2={PAD.top + plotH} stroke="#d7dbe0" />

        {bins.map((b, i) =>
          i % Math.max(1, Math.ceil(bins.length / 10)) === 0 ? (
            <text key={i} x={x(b.start)} y={HEIGHT - 10} fontSize={10} textAnchor="middle" fill="#6b7280">
              {b.start.toFixed(1)}
            </text>
          ) : null,
        )}
        <text x={x(domainMax)} y={HEIGHT - 10} fontSize={10} textAnchor="middle" fill="#6b7280">
          {domainMax.toFixed(1)}
        </text>
      </svg>
    </div>
  );
}
