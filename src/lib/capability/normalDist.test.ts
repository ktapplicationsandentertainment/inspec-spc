import { describe, expect, it } from 'vitest';
import { normalPdf, standardNormalCdf, zCriticalValue } from './normalDist';

describe('standardNormalCdf', () => {
  // Reference values are well-known standard normal table entries.
  it.each([
    [0, 0.5],
    [1, 0.8413447],
    [-1, 0.1586553],
    [1.96, 0.9750021],
    [-1.96, 0.0249979],
    [3, 0.9986501],
    [-3, 0.0013499],
    [4.5, 0.9999966],
  ])('Phi(%f) ~= %f', (z, expected) => {
    expect(standardNormalCdf(z)).toBeCloseTo(expected, 6);
  });
});

describe('normalPdf', () => {
  it('matches the standard normal density at its peak (x=mean=0, sigma=1)', () => {
    // 1/sqrt(2*pi) = 0.3989423
    expect(normalPdf(0, 0, 1)).toBeCloseTo(0.3989423, 6);
  });

  it('matches a known standard normal density value at z=1', () => {
    expect(normalPdf(1, 0, 1)).toBeCloseTo(0.2419707, 6);
  });

  it('scales correctly for a shifted, wider distribution', () => {
    // Normal(10, 2) at x=10 should equal Normal(0,1) at 0, scaled by 1/sigma.
    expect(normalPdf(10, 10, 2)).toBeCloseTo(0.3989423 / 2, 6);
  });
});

describe('zCriticalValue', () => {
  it('matches the well-known two-tailed z-critical values', () => {
    expect(zCriticalValue(0.9)).toBeCloseTo(1.645, 3);
    expect(zCriticalValue(0.95)).toBeCloseTo(1.96, 2);
    expect(zCriticalValue(0.99)).toBeCloseTo(2.576, 3);
  });
});
