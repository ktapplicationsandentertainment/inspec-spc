import type { WesternElectricRule } from './types';

/**
 * Classic Western Electric zone rules for detecting an out-of-control process.
 * Applied against a series of values relative to a center line and an
 * estimated one-sigma distance. Returns, for each input value, the list of
 * rules that value triggers (a value can trigger more than one rule).
 */
export function detectViolations(
  values: number[],
  centerLine: number,
  sigma: number,
  consecutiveSameSideCount = 8,
): WesternElectricRule[][] {
  const violations: WesternElectricRule[][] = values.map(() => []);
  if (sigma <= 0) return violations;

  const side = (v: number) => (v > centerLine ? 1 : v < centerLine ? -1 : 0);
  const zone = (v: number) => Math.abs(v - centerLine) / sigma;

  for (let i = 0; i < values.length; i++) {
    // Rule 1: single point beyond 3 sigma.
    if (zone(values[i]) > 3) {
      violations[i].push(1);
    }

    // Rule 2: 2 of 3 consecutive points beyond 2 sigma, same side.
    if (i >= 2) {
      const window = [values[i - 2], values[i - 1], values[i]];
      for (const s of [1, -1] as const) {
        const beyond2 = window.filter((v) => side(v) === s && zone(v) > 2);
        if (beyond2.length >= 2) {
          violations[i].push(2);
          break;
        }
      }
    }

    // Rule 3: 4 of 5 consecutive points beyond 1 sigma, same side.
    if (i >= 4) {
      const window = values.slice(i - 4, i + 1);
      for (const s of [1, -1] as const) {
        const beyond1 = window.filter((v) => side(v) === s && zone(v) > 1);
        if (beyond1.length >= 4) {
          violations[i].push(3);
          break;
        }
      }
    }

    // Rule 4: N consecutive points on the same side of the center line.
    if (i >= consecutiveSameSideCount - 1) {
      const window = values.slice(i - consecutiveSameSideCount + 1, i + 1);
      const firstSide = side(window[0]);
      if (firstSide !== 0 && window.every((v) => side(v) === firstSide)) {
        violations[i].push(4);
      }
    }
  }

  return violations;
}
