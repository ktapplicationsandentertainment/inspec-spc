import { describe, expect, it } from 'vitest';
import { analyzeShape } from './skewnessKurtosis';

describe('analyzeShape', () => {
  it('computes zero skewness and negative excess kurtosis for a symmetric uniform set', () => {
    // mean=3, deviations -2,-1,0,1,2 -> m2=2, m3=0, m4=6.8
    // skewness = 0/2^1.5 = 0; excess kurtosis = 6.8/4 - 3 = -1.3
    const shape = analyzeShape([1, 2, 3, 4, 5]);
    expect(shape.skewness).toBeCloseTo(0, 10);
    expect(shape.excessKurtosis).toBeCloseTo(-1.3, 10);
    expect(shape.likelyNonNormal).toBe(true); // kurtosis exceeds the +/-1 heuristic
  });

  it('flags a heavily right-skewed dataset', () => {
    // mean=3, deviations -2,-2,-2,-1,7 -> m2=12.4, m3=63.6 -> skewness ~= 1.4566
    const shape = analyzeShape([1, 1, 1, 2, 10]);
    expect(shape.skewness).toBeCloseTo(1.4566, 3);
    expect(shape.likelyNonNormal).toBe(true);
  });

  it('does not flag a small, well-behaved dataset', () => {
    const shape = analyzeShape([9.8, 10.1, 9.9, 10.2, 10.0, 9.95, 10.05]);
    expect(shape.likelyNonNormal).toBe(false);
  });
});
