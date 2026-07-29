import { describe, expect, it } from 'vitest';
import { calculateCapabilityFromRawData, calculateCapabilityFromSummary } from './capability';

describe('calculateCapabilityFromSummary', () => {
  it('computes a centered, exactly-1.0-Cpk process (textbook Cp=Cpk=1.0 case)', () => {
    // mean=10, sigma=1, USL=13, LSL=7 -> spec is exactly +/-3 sigma each side.
    const result = calculateCapabilityFromSummary(10, 1, 'within', { usl: 13, lsl: 7 });
    const idx = result.within!;

    expect(idx.cp).toBeCloseTo(1.0, 6);
    expect(idx.cpu).toBeCloseTo(1.0, 6);
    expect(idx.cpl).toBeCloseTo(1.0, 6);
    expect(idx.cpk).toBeCloseTo(1.0, 6);
    // Phi(-3) = Phi(3) = 0.0013499 -> ~1349.9 ppm on each tail.
    expect(idx.ppmBelowLsl).toBeCloseTo(1349.9, 0);
    expect(idx.ppmAboveUsl).toBeCloseTo(1349.9, 0);
    expect(idx.ppmTotal).toBeCloseTo(2699.8, 0);
    expect(idx.sigmaLevel).toBeCloseTo(3.0, 6);
    expect(result.overall).toBeNull();
  });

  it('identifies which side is limiting an off-center process', () => {
    // mean shifted toward LSL: mean=9, sigma=1, USL=13, LSL=7.
    const result = calculateCapabilityFromSummary(9, 1, 'within', { usl: 13, lsl: 7 });
    const idx = result.within!;

    expect(idx.cp).toBeCloseTo(1.0, 6); // Cp unaffected by centering
    expect(idx.cpu).toBeCloseTo(1.3333, 3);
    expect(idx.cpl).toBeCloseTo(0.6667, 3);
    expect(idx.cpk).toBeCloseTo(0.6667, 3); // driven by the lower side
  });

  it('supports one-sided specs (USL only)', () => {
    const result = calculateCapabilityFromSummary(10, 1, 'within', { usl: 13, lsl: null });
    const idx = result.within!;

    expect(idx.cp).toBeNull();
    expect(idx.cpl).toBeNull();
    expect(idx.cpu).toBeCloseTo(1.0, 6);
    expect(idx.cpk).toBeCloseTo(1.0, 6);
    expect(idx.ppmBelowLsl).toBeNull();
    expect(idx.ppmAboveUsl).toBeCloseTo(1349.9, 0);
  });

  it('labels Pp/Ppk correctly when sigma is declared as overall', () => {
    const result = calculateCapabilityFromSummary(10, 1, 'overall', { usl: 13, lsl: 7 });
    expect(result.overall).not.toBeNull();
    expect(result.within).toBeNull();
    expect(result.overall!.cpk).toBeCloseTo(1.0, 6);
  });

  it('throws when neither spec limit is provided', () => {
    expect(() => calculateCapabilityFromSummary(10, 1, 'within', { usl: null, lsl: null })).toThrow();
  });

  it('throws when USL <= LSL', () => {
    expect(() => calculateCapabilityFromSummary(10, 1, 'within', { usl: 5, lsl: 7 })).toThrow();
  });
});

describe('calculateCapabilityFromRawData', () => {
  // Same 10-point dataset validated against NIST in imr.test.ts, so the
  // within-sigma (moving-range-based) estimate here is cross-checked there.
  const data = [49.6, 47.6, 49.9, 51.3, 47.8, 51.2, 52.6, 52.4, 53.6, 52.1];

  it('estimates within (short-term) sigma via moving range, matching the I-MR chart', () => {
    const result = calculateCapabilityFromRawData(data, { usl: 60, lsl: 40 });
    // MRbar = 1.8778 (per NIST example) / d2(1.128) = 1.664716...
    expect(result.within!.sigma).toBeCloseTo(1.6647, 3);
  });

  it('estimates overall (long-term) sigma via sample standard deviation', () => {
    const result = calculateCapabilityFromRawData(data, { usl: 60, lsl: 40 });
    // Hand-computed sample variance (n-1) = 37.229 / 9 = 4.136556 -> sd ~= 2.0339
    expect(result.overall!.sigma).toBeCloseTo(2.0339, 3);
  });

  it('returns the correct process mean', () => {
    const result = calculateCapabilityFromRawData(data, { usl: 60, lsl: 40 });
    expect(result.mean).toBeCloseTo(50.81, 6);
  });

  it('throws on fewer than 2 points', () => {
    expect(() => calculateCapabilityFromRawData([5], { usl: 10, lsl: 0 })).toThrow();
  });
});
