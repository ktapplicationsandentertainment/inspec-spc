import { describe, expect, it } from 'vitest';
import { chiSquareTestOfIndependence } from './chiSquareTest';
import { standardNormalCdf } from '../capability/normalDist';

describe('chiSquareTestOfIndependence', () => {
  it('matches a hand-computed 2x2 example', () => {
    // rowTotals=[30,30], colTotals=[30,30], grand=60 -> every expected cell = 15
    // chiSquare = 4 * (5^2/15) = 100/15 = 6.6667, df=1
    const result = chiSquareTestOfIndependence([
      [10, 20],
      [20, 10],
    ]);

    expect(result.expected).toEqual([
      [15, 15],
      [15, 15],
    ]);
    expect(result.statistic).toBeCloseTo(100 / 15, 6);
    expect(result.df).toBe(1);
    // Exact df=1 relation to the (already-validated) standard normal CDF.
    // Tolerance relaxed to account for the ~1.5e-7 error bound of the erf
    // approximation used by standardNormalCdf (an independent code path).
    const expectedP = 2 * (1 - standardNormalCdf(Math.sqrt(100 / 15)));
    expect(result.pValue).toBeCloseTo(expectedP, 6);
    expect(result.lowExpectedCountWarning).toBe(false);
  });

  it('flags a low-expected-count warning when a cell is under 5', () => {
    // rowTotals=[2,18], colTotals=[2,18], grand=20 -> expected cells are
    // 0.2, 1.8, 1.8, 16.2 - three of the four are well under 5.
    const result = chiSquareTestOfIndependence([
      [1, 1],
      [1, 17],
    ]);
    expect(result.lowExpectedCountWarning).toBe(true);
  });

  it('returns statistic 0 for a perfectly independent table', () => {
    const result = chiSquareTestOfIndependence([
      [10, 10],
      [10, 10],
    ]);
    expect(result.statistic).toBeCloseTo(0, 10);
  });

  it('throws on fewer than 2 rows or columns', () => {
    expect(() => chiSquareTestOfIndependence([[1, 2, 3]])).toThrow();
  });
});
