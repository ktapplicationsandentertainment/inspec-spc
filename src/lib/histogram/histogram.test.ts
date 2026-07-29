import { describe, expect, it } from 'vitest';
import { calculateHistogram } from './histogram';

describe('calculateHistogram', () => {
  it('bins 1-10 using the Freedman-Diaconis rule (hand-verified: 3 bins, width 3)', () => {
    // n=10, Q1=3.25, Q3=7.75 (linear-interpolation percentile), IQR=4.5
    // FD width = 2*4.5 / 10^(1/3) = 4.178 -> bin count = ceil(9 / 4.178) = 3
    // binWidth = 9/3 = 3 -> edges [1,4), [4,7), [7,10]
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = calculateHistogram(values);

    expect(result.bins).toHaveLength(3);
    expect(result.bins[0]).toMatchObject({ start: 1, end: 4, count: 3 });
    expect(result.bins[1]).toMatchObject({ start: 4, end: 7, count: 3 });
    expect(result.bins[2]).toMatchObject({ start: 7, end: 10, count: 4 });
    expect(result.n).toBe(10);
    expect(result.mean).toBeCloseTo(5.5, 6);
  });

  it('falls back to Sturges rule when the IQR is zero', () => {
    // Nine 5s and one 10 -> Q1=Q3=5, IQR=0 -> Sturges: ceil(log2(10)+1) = 5 bins
    const values = [5, 5, 5, 5, 5, 5, 5, 5, 5, 10];
    const result = calculateHistogram(values);

    expect(result.bins).toHaveLength(5);
    expect(result.bins.reduce((sum, b) => sum + b.count, 0)).toBe(10);
    expect(result.bins[0].count).toBe(9);
    expect(result.bins[result.bins.length - 1].count).toBe(1);
  });

  it('accepts a manual bin count override', () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = calculateHistogram(values, 5);
    expect(result.bins).toHaveLength(5);
  });

  it('computes sample standard deviation with Bessel correction', () => {
    // 1..10: variance (n-1) = 9.166..., sd = 3.0277
    const result = calculateHistogram([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(result.stdDev).toBeCloseTo(3.0277, 3);
  });

  it('throws on fewer than 2 points', () => {
    expect(() => calculateHistogram([1])).toThrow();
  });
});
