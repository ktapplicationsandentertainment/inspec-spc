import { regularizedIncompleteBeta } from './incompleteBeta';

/**
 * Two-tailed p-value for a t-statistic with `df` degrees of freedom:
 * P(|T| > |t|). Derived from the standard identity relating the Student's
 * t-distribution to the regularized incomplete beta function:
 * P(|T| > |t|) = I_x(df/2, 1/2), where x = df / (df + t^2).
 */
export function tTwoTailedPValue(t: number, df: number): number {
  const x = df / (df + t * t);
  return regularizedIncompleteBeta(df / 2, 0.5, x);
}

/**
 * Two-tailed critical value t* such that P(|T| > t*) = 1 - confidenceLevel,
 * found by bisection on the monotonically-decreasing p-value function.
 * Used for confidence intervals (e.g. mean +/- t* * standard error).
 */
export function tCriticalValue(df: number, confidenceLevel: number): number {
  const alpha = 1 - confidenceLevel;
  let lo = 0;
  let hi = 1000;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (tTwoTailedPValue(mid, df) > alpha) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
