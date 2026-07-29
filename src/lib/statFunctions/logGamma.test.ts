import { describe, expect, it } from 'vitest';
import { logGamma } from './logGamma';

describe('logGamma', () => {
  it('matches known exact factorial values: Gamma(n) = (n-1)!', () => {
    // Gamma(1)=0!=1, Gamma(5)=4!=24, Gamma(7)=6!=720
    expect(Math.exp(logGamma(1))).toBeCloseTo(1, 6);
    expect(Math.exp(logGamma(5))).toBeCloseTo(24, 4);
    expect(Math.exp(logGamma(7))).toBeCloseTo(720, 2);
  });

  it('matches the known exact value Gamma(0.5) = sqrt(pi)', () => {
    expect(Math.exp(logGamma(0.5))).toBeCloseTo(Math.sqrt(Math.PI), 6);
  });
});
