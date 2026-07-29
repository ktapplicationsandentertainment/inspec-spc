import { describe, expect, it } from 'vitest';
import { calculateGageRRAnova, calculateGageRRRange, type GageRRData } from './gageRR';

describe('calculateGageRRAnova', () => {
  // Hand-derived by construction: 2 parts, 2 operators, 2 trials. Every
  // operator agrees exactly (no operator bias, no interaction); only
  // within-cell noise (+/-1 around each cell mean) exists.
  //
  // Values: Op1/Part1=[9,11], Op2/Part1=[9,11], Op1/Part2=[19,21], Op2/Part2=[19,21]
  // Grand mean=15. Part means=10,20. Operator means=15,15 (equal by design).
  // SS_Part=200, SS_Operator=0, SS_Interaction=0, SS_Total=208, SS_Equipment=8.
  // df: Part=1, Operator=1, Interaction=1, Equipment=4.
  // MS_Part=200, MS_Operator=0, MS_Interaction=0, MS_Equipment=2.
  // var_Equipment=2, var_Interaction=max(0,(0-2)/2)=0, var_Operator=max(0,(0-0)/4)=0,
  // var_Part=max(0,(200-0)/4)=50. var_GRR=2, var_Total=52.
  const noBiasNoInteraction: GageRRData = [
    [[9, 11], [9, 11]],
    [[19, 21], [19, 21]],
  ];

  it('matches hand-derived variance components with no operator bias or interaction', () => {
    const result = calculateGageRRAnova(noBiasNoInteraction);

    expect(result.repeatability.stdDev).toBeCloseTo(Math.sqrt(2), 6);
    expect(result.reproducibility.stdDev).toBeCloseTo(0, 6);
    expect(result.interaction!.stdDev).toBeCloseTo(0, 6); // clipped from a negative estimate
    expect(result.partVariation.stdDev).toBeCloseTo(Math.sqrt(50), 6);
    expect(result.grr.stdDev).toBeCloseTo(Math.sqrt(2), 6);
    expect(result.totalVariation.stdDev).toBeCloseTo(Math.sqrt(52), 6);

    expect(result.grr.percentContribution).toBeCloseTo((100 * 2) / 52, 6);
    expect(result.grr.percentStudyVariation).toBeCloseTo((100 * Math.sqrt(2)) / Math.sqrt(52), 6);
    expect(result.ndc).toBe(7);
    expect(result.verdict).toBe('marginal'); // ~19.6% is between 10 and 30
  });

  // Same layout, but Op2 reads consistently +2 high on every part (uniform
  // bias, still zero interaction since the bias doesn't vary by part).
  // Grand mean=16. Part means=11,21. Operator means=15,17.
  // SS_Part=200, SS_Operator=8, SS_Interaction=0, SS_Total=216, SS_Equipment=8.
  // MS_Operator=8 -> var_Operator=max(0,(8-0)/4)=2. var_Reproducibility=2, var_GRR=4, var_Total=54.
  const withOperatorBias: GageRRData = [
    [[9, 11], [11, 13]],
    [[19, 21], [21, 23]],
  ];

  it('attributes a uniform operator bias to reproducibility, not interaction', () => {
    const result = calculateGageRRAnova(withOperatorBias);

    expect(result.repeatability.stdDev).toBeCloseTo(Math.sqrt(2), 6);
    expect(result.interaction!.stdDev).toBeCloseTo(0, 6);
    expect(result.reproducibility.stdDev).toBeCloseTo(Math.sqrt(2), 6);
    expect(result.partVariation.stdDev).toBeCloseTo(Math.sqrt(50), 6);
    expect(result.grr.stdDev).toBeCloseTo(2, 6);
    expect(result.totalVariation.stdDev).toBeCloseTo(Math.sqrt(54), 6);
    expect(result.ndc).toBe(4);
  });

  it('throws outside the supported part/operator/trial ranges', () => {
    expect(() => calculateGageRRAnova([[[1, 2]]])).toThrow(); // only 1 part, 1 operator
  });
});

describe('calculateGageRRRange', () => {
  // Same "with operator bias" dataset as above, checked against the AIAG
  // K1/K2/K3 formulas directly (formula-consistency check using the
  // published constants, since this method doesn't independently re-derive
  // sigma the way the ANOVA path does).
  const withOperatorBias: GageRRData = [
    [[9, 11], [11, 13]],
    [[19, 21], [21, 23]],
  ];

  it('matches the AIAG Average-and-Range formulas using published K constants', () => {
    const result = calculateGageRRRange(withOperatorBias);

    // EV = Rbar * K1(2 trials) = 2 * 4.56 = 9.12
    const ev = 2 * 4.56;
    // AV = sqrt((Xdiff*K2)^2 - EV^2/(n*r)), Xdiff = |17-15| = 2, K2(2 operators) = 3.65
    const av = Math.sqrt((2 * 3.65) ** 2 - ev ** 2 / (2 * 2));
    // PV = Rp * K3(2 parts) = |21-11| * 3.65 = 36.5
    const pv = 10 * 3.65;

    expect(result.repeatability.stdDev).toBeCloseTo(ev / 5.15, 6);
    expect(result.reproducibility.stdDev).toBeCloseTo(av / 5.15, 6);
    expect(result.partVariation.stdDev).toBeCloseTo(pv / 5.15, 6);
    expect(result.grr.stdDev).toBeCloseTo(Math.sqrt(ev ** 2 + av ** 2) / 5.15, 6);
    expect(result.interaction).toBeNull();
  });

  it('accepts 3 trials (the other AIAG-published K1 entry)', () => {
    const threeTrials: GageRRData = [
      [[1, 2, 3], [2, 3, 4]],
      [[5, 6, 7], [6, 7, 8]],
    ];
    expect(() => calculateGageRRRange(threeTrials)).not.toThrow();
  });

  it('rejects trial counts outside 2-3', () => {
    const fourTrials: GageRRData = [
      [[1, 2, 3, 4], [2, 3, 4, 5]],
      [[5, 6, 7, 8], [6, 7, 8, 9]],
    ];
    expect(() => calculateGageRRRange(fourTrials)).toThrow();
  });
});
