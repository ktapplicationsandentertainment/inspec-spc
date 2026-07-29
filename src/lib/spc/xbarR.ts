import {
  MAX_XBAR_R_SUBGROUP_SIZE,
  MIN_XBAR_R_SUBGROUP_SIZE,
  XBAR_R_CONSTANTS,
} from './constants';
import { detectViolations } from './westernElectric';
import { mean, range } from './statUtils';
import type { ControlChartResult } from './types';

/**
 * Xbar and R control chart for subgrouped data (subgroup size 2-10).
 * Control limit formulas per NIST/SEMATECH e-Handbook 6.3.2.1:
 * https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc321.htm
 */
export function calculateXbarR(subgroups: number[][], labels?: string[]): ControlChartResult {
  if (subgroups.length < 2) {
    throw new Error('An Xbar-R chart needs at least 2 subgroups.');
  }

  const n = subgroups[0].length;
  if (!subgroups.every((sg) => sg.length === n)) {
    throw new Error('All subgroups must have the same number of measurements.');
  }
  if (n < MIN_XBAR_R_SUBGROUP_SIZE || n > MAX_XBAR_R_SUBGROUP_SIZE) {
    throw new Error(
      `Xbar-R charts support subgroup sizes ${MIN_XBAR_R_SUBGROUP_SIZE}-${MAX_XBAR_R_SUBGROUP_SIZE}. Got ${n}.`,
    );
  }

  const constants = XBAR_R_CONSTANTS[n];
  const subgroupMeans = subgroups.map(mean);
  const subgroupRanges = subgroups.map(range);

  const xbarbar = mean(subgroupMeans);
  const rbar = mean(subgroupRanges);

  const uclX = xbarbar + constants.A2 * rbar;
  const lclX = xbarbar - constants.A2 * rbar;
  // Sigma of the subgroup mean, derived from the limit itself: since
  // UCL = Xbarbar + 3 * sigma-of-mean by construction, sigma-of-mean = A2*Rbar/3.
  const sigmaX = (uclX - xbarbar) / 3;

  const uclR = constants.D4 * rbar;
  const lclR = constants.D3 * rbar;
  const sigmaR = (uclR - rbar) / 3;

  const pointLabels = subgroups.map((_, i) => labels?.[i] ?? String(i + 1));
  const primaryViolations = detectViolations(subgroupMeans, xbarbar, sigmaX);
  const secondaryViolations = detectViolations(subgroupRanges, rbar, sigmaR).map((v) =>
    v.filter((rule) => rule === 1),
  );

  const violationCount = primaryViolations.filter((v) => v.length > 0).length;

  return {
    chartType: 'XBAR-R',
    subgroupSize: n,
    primary: {
      title: 'X̄ (Xbar) Chart',
      centerLine: xbarbar,
      ucl: uclX,
      lcl: lclX,
      sigma: sigmaX,
      points: subgroupMeans.map((v, i) => ({
        index: i,
        label: pointLabels[i],
        value: v,
        violations: primaryViolations[i],
      })),
    },
    secondary: {
      title: 'R (Range) Chart',
      centerLine: rbar,
      ucl: uclR,
      lcl: Math.max(lclR, 0),
      sigma: sigmaR,
      points: subgroupRanges.map((v, i) => ({
        index: i,
        label: pointLabels[i],
        value: v,
        violations: secondaryViolations[i],
      })),
    },
    violationCount,
    inControl: violationCount === 0,
  };
}
