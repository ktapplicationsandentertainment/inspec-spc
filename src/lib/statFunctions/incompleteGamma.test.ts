import { describe, expect, it } from 'vitest';
import { regularizedLowerIncompleteGamma, regularizedUpperIncompleteGamma } from './incompleteGamma';

describe('incomplete gamma functions', () => {
  it('matches the exact exponential-distribution special case (a=1): P(1,x) = 1 - exp(-x)', () => {
    expect(regularizedLowerIncompleteGamma(1, 2)).toBeCloseTo(1 - Math.exp(-2), 10);
    expect(regularizedUpperIncompleteGamma(1, 2)).toBeCloseTo(Math.exp(-2), 10);
  });

  it('handles a large x that exercises the continued-fraction branch', () => {
    expect(regularizedLowerIncompleteGamma(1, 10)).toBeCloseTo(1 - Math.exp(-10), 8);
  });

  it('P and Q sum to 1', () => {
    for (const [a, x] of [[1, 0.5], [3, 2], [5, 10], [0.5, 0.5]] as const) {
      expect(regularizedLowerIncompleteGamma(a, x) + regularizedUpperIncompleteGamma(a, x)).toBeCloseTo(1, 10);
    }
  });

  it('returns 0/1 boundary values at x=0', () => {
    expect(regularizedLowerIncompleteGamma(2, 0)).toBe(0);
    expect(regularizedUpperIncompleteGamma(2, 0)).toBe(1);
  });
});
