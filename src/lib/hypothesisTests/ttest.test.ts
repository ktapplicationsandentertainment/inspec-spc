import { describe, expect, it } from 'vitest';
import { oneSampleTTest, pairedTTest, twoSampleTTest } from './ttest';
import { tTwoTailedPValue } from '../statFunctions/tDistribution';

describe('oneSampleTTest', () => {
  it('matches hand-computed statistic and df', () => {
    // [10,12,14,16,18]: mean=14, sample sd=sqrt(10), se=sqrt(10)/sqrt(5)=sqrt(2)
    // t = (14-10)/sqrt(2) = 4/sqrt(2) = 2*sqrt(2), df=4
    const result = oneSampleTTest([10, 12, 14, 16, 18], 10);
    expect(result.statistic).toBeCloseTo(2 * Math.sqrt(2), 6);
    expect(result.df).toBe(4);
    expect(result.meanDifference).toBeCloseTo(4, 10);
    expect(result.pValue).toBeCloseTo(tTwoTailedPValue(2 * Math.sqrt(2), 4), 10);
  });

  it('throws when all values are identical (zero standard error)', () => {
    expect(() => oneSampleTTest([5, 5, 5], 5)).toThrow();
  });
});

describe('twoSampleTTest', () => {
  it('matches a hand-computed symmetric example (Welch df reduces to n1+n2-2 here)', () => {
    // group1=[10,12,14] (mean=12, sd=2), group2=[20,22,24] (mean=22, sd=2)
    // se=sqrt(4/3+4/3)=sqrt(8/3), t=(12-22)/se
    const result = twoSampleTTest([10, 12, 14], [20, 22, 24]);
    const expectedSe = Math.sqrt(8 / 3);
    expect(result.statistic).toBeCloseTo(-10 / expectedSe, 6);
    expect(result.df).toBeCloseTo(4, 6); // equal variances/sizes -> Welch df = n1+n2-2
    expect(result.meanDifference).toBeCloseTo(-10, 10);
  });
});

describe('pairedTTest', () => {
  it('matches a hand-computed example with an exact df=2 closed-form p-value', () => {
    // differences = [2,1,2]: mean=5/3, sd=sqrt(1/3), se=sqrt(1/3)/sqrt(3)=1/3
    // t = (5/3)/(1/3) = 5, df=2
    const result = pairedTTest([10, 12, 14], [8, 11, 12]);
    expect(result.statistic).toBeCloseTo(5, 6);
    expect(result.df).toBe(2);
    // Exact df=2 closed form: p = 1 - |t|/sqrt(2+t^2)
    const expectedP = 1 - 5 / Math.sqrt(2 + 25);
    expect(result.pValue).toBeCloseTo(expectedP, 8);
  });

  it('throws on mismatched group lengths', () => {
    expect(() => pairedTTest([1, 2, 3], [1, 2])).toThrow();
  });
});
