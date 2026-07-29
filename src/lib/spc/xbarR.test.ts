import { describe, expect, it } from 'vitest';
import { calculateXbarR } from './xbarR';

describe('calculateXbarR', () => {
  // Self-constructed sanity-check dataset (not from a published source) used
  // to verify the formula implementation against hand-computed arithmetic.
  // Subgroup means: 11, 10, 12, 10, 12 -> Xbarbar = 11
  // Subgroup ranges: 2, 2, 2, 0, 2 -> Rbar = 1.6
  // n=5 constants (NIST table): A2=0.577, D3=0, D4=2.115
  // UCL_x = 11 + 0.577*1.6 = 11.9232, LCL_x = 11 - 0.9232 = 10.0768
  // UCL_R = 2.115*1.6 = 3.384, LCL_R = 0
  //
  // TODO: replace/supplement with a citable NIST or Montgomery textbook
  // dataset once one can be sourced and transcribed with full confidence.
  const subgroups = [
    [10, 12, 11, 11, 11],
    [9, 11, 10, 10, 10],
    [12, 13, 11, 12, 12],
    [10, 10, 10, 10, 10],
    [11, 12, 13, 11, 13],
  ];

  it('matches the hand-computed reference values', () => {
    const result = calculateXbarR(subgroups);

    expect(result.primary.centerLine).toBeCloseTo(11, 6);
    expect(result.primary.ucl).toBeCloseTo(11.9232, 6);
    expect(result.primary.lcl).toBeCloseTo(10.0768, 6);

    expect(result.secondary.centerLine).toBeCloseTo(1.6, 6);
    expect(result.secondary.ucl).toBeCloseTo(3.384, 6);
    expect(result.secondary.lcl).toBeCloseTo(0, 6);
  });

  it('rejects subgroup sizes outside 2-10', () => {
    expect(() => calculateXbarR([[1], [2]])).toThrow();
    const tooWide = Array.from({ length: 3 }, () => Array(11).fill(1));
    expect(() => calculateXbarR(tooWide)).toThrow();
  });

  it('rejects inconsistent subgroup sizes', () => {
    expect(() => calculateXbarR([[1, 2, 3], [1, 2]])).toThrow();
  });
});
