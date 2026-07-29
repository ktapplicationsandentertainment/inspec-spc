import { logGamma } from './logGamma';

const MAX_ITERATIONS = 200;
const EPSILON = 3e-14;
const MIN_VALUE = 1e-300;

/** Series expansion for the regularized lower incomplete gamma P(a,x), valid for x < a+1. */
function lowerIncompleteGammaSeries(a: number, x: number): number {
  let sum = 1 / a;
  let del = sum;
  let ap = a;
  for (let n = 1; n <= MAX_ITERATIONS; n++) {
    ap += 1;
    del *= x / ap;
    sum += del;
    if (Math.abs(del) < Math.abs(sum) * EPSILON) break;
  }
  return sum * Math.exp(-x + a * Math.log(x) - logGamma(a));
}

/** Continued fraction for the regularized upper incomplete gamma Q(a,x), valid for x >= a+1. */
function upperIncompleteGammaContinuedFraction(a: number, x: number): number {
  let b = x + 1 - a;
  let c = 1 / MIN_VALUE;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i <= MAX_ITERATIONS; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < MIN_VALUE) d = MIN_VALUE;
    c = b + an / c;
    if (Math.abs(c) < MIN_VALUE) c = MIN_VALUE;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPSILON) break;
  }
  return Math.exp(-x + a * Math.log(x) - logGamma(a)) * h;
}

/** Regularized lower incomplete gamma function P(a,x). */
export function regularizedLowerIncompleteGamma(a: number, x: number): number {
  if (x < 0 || a <= 0) throw new Error('Invalid arguments to incomplete gamma function.');
  if (x === 0) return 0;
  return x < a + 1 ? lowerIncompleteGammaSeries(a, x) : 1 - upperIncompleteGammaContinuedFraction(a, x);
}

/** Regularized upper incomplete gamma function Q(a,x) = 1 - P(a,x), computed to avoid cancellation. */
export function regularizedUpperIncompleteGamma(a: number, x: number): number {
  if (x < 0 || a <= 0) throw new Error('Invalid arguments to incomplete gamma function.');
  if (x === 0) return 1;
  return x < a + 1 ? 1 - lowerIncompleteGammaSeries(a, x) : upperIncompleteGammaContinuedFraction(a, x);
}
