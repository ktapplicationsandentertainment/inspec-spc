/**
 * Abramowitz & Stegun formula 7.1.26 approximation of the error function.
 * Max absolute error ~1.5e-7, more than sufficient for PPM/defect-rate estimates.
 */
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1 / (1 + p * ax);
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return sign * y;
}

/** Standard normal cumulative distribution function, Phi(z). */
export function standardNormalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

/** Probability that a Normal(mean, sigma) variable falls below `x`. */
export function normalCdf(x: number, mean: number, sigma: number): number {
  if (sigma <= 0) return x < mean ? 0 : 1;
  return standardNormalCdf((x - mean) / sigma);
}

/** Normal probability density function, used to draw a fitted curve over a histogram. */
export function normalPdf(x: number, mean: number, sigma: number): number {
  if (sigma <= 0) return 0;
  const z = (x - mean) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

/** Inverse standard normal CDF (quantile function), found by bisection on the validated CDF above. */
export function standardNormalQuantile(p: number): number {
  if (p <= 0 || p >= 1) throw new Error('p must be strictly between 0 and 1.');
  let lo = -10;
  let hi = 10;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (standardNormalCdf(mid) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Two-tailed z-critical value for a given confidence level, e.g. 0.95 -> ~1.96. */
export function zCriticalValue(confidenceLevel: number): number {
  return standardNormalQuantile(1 - (1 - confidenceLevel) / 2);
}
