import { logGamma } from './logGamma';

const MAX_ITERATIONS = 200;
const EPSILON = 3e-14;
const MIN_VALUE = 1e-300;

/** Continued fraction used by the regularized incomplete beta function (Numerical Recipes betacf). */
function betaContinuedFraction(a: number, b: number, x: number): number {
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < MIN_VALUE) d = MIN_VALUE;
  d = 1 / d;
  let h = d;

  for (let m = 1; m <= MAX_ITERATIONS; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < MIN_VALUE) d = MIN_VALUE;
    c = 1 + aa / c;
    if (Math.abs(c) < MIN_VALUE) c = MIN_VALUE;
    d = 1 / d;
    h *= d * c;

    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < MIN_VALUE) d = MIN_VALUE;
    c = 1 + aa / c;
    if (Math.abs(c) < MIN_VALUE) c = MIN_VALUE;
    d = 1 / d;
    const del = d * c;
    h *= del;

    if (Math.abs(del - 1) < EPSILON) break;
  }
  return h;
}

/**
 * Regularized incomplete beta function I_x(a,b), used to derive the
 * Student's t-distribution CDF. Standard Numerical Recipes algorithm.
 */
export function regularizedIncompleteBeta(a: number, b: number, x: number): number {
  if (x < 0 || x > 1) throw new Error('x must be between 0 and 1.');
  if (x === 0 || x === 1) return x;

  const logBt = logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x);
  const bt = Math.exp(logBt);

  if (x < (a + 1) / (a + b + 2)) {
    return (bt * betaContinuedFraction(a, b, x)) / a;
  }
  return 1 - (bt * betaContinuedFraction(b, a, 1 - x)) / b;
}
