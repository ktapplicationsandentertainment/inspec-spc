import { INDIVIDUALS_D2, MOVING_RANGE_CONSTANTS } from './constants';
import { detectViolations } from './westernElectric';
import { mean } from './statUtils';
import type { ControlChartResult } from './types';

/**
 * Individuals (X) and Moving Range (MR) control chart, for a single column
 * of individual measurements. Formulas verified against the NIST worked
 * example: https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc322.htm
 */
export function calculateIMR(values: number[], labels?: string[]): ControlChartResult {
  if (values.length < 2) {
    throw new Error('An Individuals chart needs at least 2 data points.');
  }

  const xbar = mean(values);
  const movingRanges = values.slice(1).map((v, i) => Math.abs(v - values[i]));
  const mrbar = mean(movingRanges);

  const sigma = mrbar / INDIVIDUALS_D2;
  const uclX = xbar + 3 * sigma;
  const lclX = xbar - 3 * sigma;

  const uclMr = MOVING_RANGE_CONSTANTS.D4 * mrbar;
  const lclMr = MOVING_RANGE_CONSTANTS.D3 * mrbar;
  const mrSigma = (uclMr - mrbar) / 3;

  const pointLabels = values.map((_, i) => labels?.[i] ?? String(i + 1));
  const primaryViolations = detectViolations(values, xbar, sigma);
  const secondaryViolations = detectViolations(movingRanges, mrbar, mrSigma).map((v) =>
    v.filter((rule) => rule === 1),
  );

  const violationCount = primaryViolations.filter((v) => v.length > 0).length;

  return {
    chartType: 'I-MR',
    subgroupSize: 1,
    primary: {
      title: 'Individuals (X) Chart',
      centerLine: xbar,
      ucl: uclX,
      lcl: lclX,
      sigma,
      points: values.map((v, i) => ({
        index: i,
        label: pointLabels[i],
        value: v,
        violations: primaryViolations[i],
      })),
    },
    secondary: {
      title: 'Moving Range (MR) Chart',
      centerLine: mrbar,
      ucl: uclMr,
      lcl: Math.max(lclMr, 0),
      sigma: mrSigma,
      points: movingRanges.map((v, i) => ({
        index: i,
        label: pointLabels[i + 1],
        value: v,
        violations: secondaryViolations[i],
      })),
    },
    violationCount,
    inControl: violationCount === 0,
  };
}
