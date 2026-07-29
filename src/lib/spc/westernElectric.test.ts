import { describe, expect, it } from 'vitest';
import { detectViolations } from './westernElectric';

describe('detectViolations', () => {
  it('flags rule 1: a single point beyond 3 sigma', () => {
    const values = [0, 0.5, -0.5, 3.5, 0.2];
    const violations = detectViolations(values, 0, 1);
    expect(violations[3]).toContain(1);
    expect(violations[0]).toHaveLength(0);
  });

  it('flags rule 2: 2 of 3 consecutive points beyond 2 sigma, same side', () => {
    const values = [0, 2.1, 0.1, 2.2];
    const violations = detectViolations(values, 0, 1);
    expect(violations[3]).toContain(2);
  });

  it('does not flag rule 2 when the two points are on opposite sides', () => {
    const values = [0, 2.1, 0.1, -2.2];
    const violations = detectViolations(values, 0, 1);
    expect(violations[3]).not.toContain(2);
  });

  it('flags rule 3: 4 of 5 consecutive points beyond 1 sigma, same side', () => {
    const values = [0, 1.1, 1.2, 0.2, 1.3, 1.1];
    const violations = detectViolations(values, 0, 1);
    expect(violations[5]).toContain(3);
  });

  it('flags rule 4: 8 consecutive points on the same side of center', () => {
    const values = [1, 2, 1, 2, 1, 2, 1, 2];
    const violations = detectViolations(values, 0, 10);
    expect(violations[7]).toContain(4);
  });

  it('does not flag rule 4 when a point crosses the center line', () => {
    const values = [1, 2, 1, 2, 1, -2, 1, 2];
    const violations = detectViolations(values, 0, 10);
    expect(violations[7]).not.toContain(4);
  });

  it('returns no violations for a well-behaved series', () => {
    const values = [0.1, -0.1, 0.2, -0.2, 0.1, -0.1];
    const violations = detectViolations(values, 0, 1);
    expect(violations.every((v) => v.length === 0)).toBe(true);
  });
});
