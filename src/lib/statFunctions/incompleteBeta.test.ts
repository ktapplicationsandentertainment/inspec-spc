import { describe, expect, it } from 'vitest';
import { regularizedIncompleteBeta } from './incompleteBeta';

describe('regularizedIncompleteBeta', () => {
  it('matches the exact uniform-distribution special case (a=b=1): I_x(1,1) = x', () => {
    expect(regularizedIncompleteBeta(1, 1, 0.3)).toBeCloseTo(0.3, 10);
    expect(regularizedIncompleteBeta(1, 1, 0.87)).toBeCloseTo(0.87, 10);
  });

  it('matches the exact arcsine-distribution special case: I_x(0.5,0.5) = (2/pi)*asin(sqrt(x))', () => {
    // At x=0.75, asin(sqrt(0.75)) = asin(sqrt(3)/2) = pi/3 exactly -> I = 2/3.
    expect(regularizedIncompleteBeta(0.5, 0.5, 0.75)).toBeCloseTo(2 / 3, 8);
    // At x=0.5, symmetric point -> I = 0.5 exactly.
    expect(regularizedIncompleteBeta(0.5, 0.5, 0.5)).toBeCloseTo(0.5, 10);
  });

  it('returns boundary values at x=0 and x=1', () => {
    expect(regularizedIncompleteBeta(3, 4, 0)).toBe(0);
    expect(regularizedIncompleteBeta(3, 4, 1)).toBe(1);
  });

  it('satisfies the symmetry identity I_x(a,b) = 1 - I_(1-x)(b,a)', () => {
    expect(regularizedIncompleteBeta(2, 5, 0.3)).toBeCloseTo(1 - regularizedIncompleteBeta(5, 2, 0.7), 10);
  });
});
