import { describe, expect, it } from 'vitest';
import { chiSquarePValue } from './chiSquareDistribution';
import { standardNormalCdf } from '../capability/normalDist';

describe('chiSquarePValue', () => {
  it('matches the exact df=2 special case: chi-square(2) is Exponential(rate=1/2), p = exp(-x/2)', () => {
    expect(chiSquarePValue(4, 2)).toBeCloseTo(Math.exp(-2), 10);
    expect(chiSquarePValue(1, 2)).toBeCloseTo(Math.exp(-0.5), 10);
  });

  it('matches the exact df=1 relation to the standard normal: chi-square(1) = Z^2', () => {
    // P(X > x) for X=Z^2 equals P(|Z| > sqrt(x)) = 2*(1-Phi(sqrt(x))).
    const x = 3.841; // the well-known 95% critical value for df=1
    const expected = 2 * (1 - standardNormalCdf(Math.sqrt(x)));
    expect(chiSquarePValue(x, 1)).toBeCloseTo(expected, 6);
    expect(chiSquarePValue(x, 1)).toBeCloseTo(0.05, 3);
  });

  it('matches well-known chi-square critical values at p=0.05', () => {
    // Standard chi-square table entries.
    expect(chiSquarePValue(5.991, 2)).toBeCloseTo(0.05, 3);
    expect(chiSquarePValue(7.815, 3)).toBeCloseTo(0.05, 3);
    expect(chiSquarePValue(9.488, 4)).toBeCloseTo(0.05, 3);
  });

  it('returns 1 for x<=0', () => {
    expect(chiSquarePValue(0, 5)).toBe(1);
    expect(chiSquarePValue(-1, 5)).toBe(1);
  });
});
