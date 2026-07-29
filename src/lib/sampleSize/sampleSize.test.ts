import { describe, expect, it } from 'vitest';
import {
  confidenceIntervalForMean,
  confidenceIntervalForProportion,
  sampleSizeForMean,
  sampleSizeForProportion,
} from './sampleSize';
import { zCriticalValue } from '../capability/normalDist';
import { tCriticalValue } from '../statFunctions/tDistribution';

describe('sampleSizeForProportion', () => {
  it('matches the famous "385 respondents" result for 95% confidence, +/-5%, unknown proportion', () => {
    // n = z^2 * 0.25 / 0.05^2 = 384.16 -> ceil 385. This exact number is one
    // of the most widely cited results in survey methodology.
    expect(sampleSizeForProportion(0.95, 0.05)).toBe(385);
  });

  it('applies the finite population correction consistently with the formula', () => {
    const z = zCriticalValue(0.95);
    const n0 = (z * z * 0.25) / 0.05 ** 2;
    const expected = Math.ceil(n0 / (1 + (n0 - 1) / 1000));
    expect(sampleSizeForProportion(0.95, 0.05, 0.5, 1000)).toBe(expected);
  });

  it('requires fewer samples for a more extreme (less uncertain) estimated proportion', () => {
    const balanced = sampleSizeForProportion(0.95, 0.05, 0.5);
    const skewed = sampleSizeForProportion(0.95, 0.05, 0.1);
    expect(skewed).toBeLessThan(balanced);
  });
});

describe('sampleSizeForMean', () => {
  it('matches a hand-computed result: z=1.96ish, sigma=10, E=2 -> 97', () => {
    // n = z^2*100/4 ~= 96.04 -> ceil 97.
    expect(sampleSizeForMean(0.95, 2, 10)).toBe(97);
  });
});

describe('confidenceIntervalForMean', () => {
  it('matches a hand-computed t-based interval: mean=100, sd=15, n=25, 95%', () => {
    const df = 24;
    const t = tCriticalValue(df, 0.95);
    const moe = t * (15 / Math.sqrt(25));
    const result = confidenceIntervalForMean(100, 15, 25, 0.95);

    expect(result.marginOfError).toBeCloseTo(moe, 6);
    expect(result.lower).toBeCloseTo(100 - moe, 6);
    expect(result.upper).toBeCloseTo(100 + moe, 6);
    // Sanity check against the well-known table value (t~=2.064 -> moe~=6.19).
    expect(moe).toBeCloseTo(6.19, 1);
  });
});

describe('confidenceIntervalForProportion', () => {
  it('matches a hand-computed Wald interval: 50/200 successes, 95%', () => {
    const z = zCriticalValue(0.95);
    const pHat = 0.25;
    const moe = z * Math.sqrt((pHat * (1 - pHat)) / 200);
    const result = confidenceIntervalForProportion(50, 200, 0.95);

    expect(result.pointEstimate).toBeCloseTo(0.25, 10);
    expect(result.marginOfError).toBeCloseTo(moe, 6);
    expect(result.lower).toBeCloseTo(pHat - moe, 6);
    expect(result.upper).toBeCloseTo(pHat + moe, 6);
  });

  it('clamps the interval to [0,1]', () => {
    const result = confidenceIntervalForProportion(1, 2, 0.99);
    expect(result.upper).toBeLessThanOrEqual(1);
    expect(result.lower).toBeGreaterThanOrEqual(0);
  });
});
