import { describe, expect, it } from 'vitest';
import { tCriticalValue, tTwoTailedPValue } from './tDistribution';

describe('tTwoTailedPValue', () => {
  it('matches the exact df=1 special case: t(1) is the standard Cauchy distribution', () => {
    // Two-tailed p-value for Cauchy: 1 - (2/pi)*atan(|t|).
    for (const t of [0.5, 1, 2, 5]) {
      const expected = 1 - (2 / Math.PI) * Math.atan(t);
      expect(tTwoTailedPValue(t, 1)).toBeCloseTo(expected, 8);
    }
  });

  it('matches the exact df=2 closed form: p = 1 - |t|/sqrt(2+t^2)', () => {
    for (const t of [0.5, 1, 3, 10]) {
      const expected = 1 - t / Math.sqrt(2 + t * t);
      expect(tTwoTailedPValue(t, 2)).toBeCloseTo(expected, 8);
    }
  });

  it('gives p=1 at t=0 (regardless of df)', () => {
    expect(tTwoTailedPValue(0, 10)).toBeCloseTo(1, 10);
  });

  it('approaches the standard normal two-tailed p-value for large df', () => {
    // At large df, the t-distribution converges to the standard normal.
    // z=1.96 -> two-tailed p ~= 0.05.
    expect(tTwoTailedPValue(1.96, 100000)).toBeCloseTo(0.05, 3);
  });
});

describe('tCriticalValue', () => {
  it('matches the well-known t-table value for df=24, 95% confidence', () => {
    expect(tCriticalValue(24, 0.95)).toBeCloseTo(2.064, 2);
  });

  it('matches the exact df=1 (Cauchy) critical value: t* = tan(confidence * pi/2)', () => {
    // Solving 1-(2/pi)*atan(t)=alpha for t gives t=tan((1-alpha)*pi/2)=tan(confidence*pi/2).
    const expected = Math.tan(0.95 * (Math.PI / 2));
    expect(tCriticalValue(1, 0.95)).toBeCloseTo(expected, 2);
    // This is also the famous df=1 t-table entry: 12.706.
    expect(tCriticalValue(1, 0.95)).toBeCloseTo(12.706, 2);
  });

  it('approaches the standard normal z-critical value for large df', () => {
    expect(tCriticalValue(100000, 0.95)).toBeCloseTo(1.96, 2);
  });
});
