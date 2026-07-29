import { mean, sampleStdDev } from '../spc/statUtils';
import { analyzeShape, type DistributionShape } from '../capability/skewnessKurtosis';

export interface HistogramBin {
  start: number;
  end: number;
  count: number;
}

export interface HistogramResult {
  bins: HistogramBin[];
  n: number;
  mean: number;
  stdDev: number;
  shape: DistributionShape;
}

/** Linear-interpolation percentile (the common "type 7" method used by Excel/numpy default). */
function percentile(sorted: number[], p: number): number {
  const index = p * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (index - lower) * (sorted[upper] - sorted[lower]);
}

/**
 * Determine bin count via the Freedman-Diaconis rule (robust to outliers,
 * data-driven bin width), falling back to Sturges' rule when the
 * interquartile range is zero (e.g. many repeated values).
 */
function chooseBinCount(sorted: number[], min: number, max: number): number {
  const n = sorted.length;
  const iqr = percentile(sorted, 0.75) - percentile(sorted, 0.25);
  const range = max - min;
  if (range === 0) return 1;

  const fdWidth = (2 * iqr) / Math.cbrt(n);
  if (fdWidth > 0) {
    return Math.max(1, Math.min(30, Math.ceil(range / fdWidth)));
  }
  const sturges = Math.ceil(Math.log2(n) + 1);
  return Math.max(1, Math.min(30, sturges));
}

export function calculateHistogram(values: number[], binCountOverride?: number): HistogramResult {
  if (values.length < 2) {
    throw new Error('A histogram needs at least 2 data points.');
  }

  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const binCount = binCountOverride ?? chooseBinCount(sorted, min, max);
  const binWidth = (max - min) / binCount || 1;

  const bins: HistogramBin[] = Array.from({ length: binCount }, (_, i) => ({
    start: min + i * binWidth,
    end: min + (i + 1) * binWidth,
    count: 0,
  }));

  for (const v of values) {
    const idx = binWidth === 0 ? 0 : Math.min(binCount - 1, Math.floor((v - min) / binWidth));
    bins[idx].count += 1;
  }

  const m = mean(values);

  return {
    bins,
    n: values.length,
    mean: m,
    stdDev: sampleStdDev(values, m),
    shape: analyzeShape(values),
  };
}
