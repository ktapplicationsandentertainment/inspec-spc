import { regularizedUpperIncompleteGamma } from './incompleteGamma';

/**
 * Upper-tail p-value for a chi-square statistic: P(X > x) for X ~ chi-square(df).
 * The chi-square distribution is a special case of the gamma distribution,
 * so this is the regularized upper incomplete gamma Q(df/2, x/2).
 */
export function chiSquarePValue(x: number, df: number): number {
  if (x <= 0) return 1;
  return regularizedUpperIncompleteGamma(df / 2, x / 2);
}
