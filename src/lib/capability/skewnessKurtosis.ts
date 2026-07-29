import { mean } from '../spc/statUtils';

export interface DistributionShape {
  skewness: number;
  excessKurtosis: number;
  /** True when |skewness| or |excess kurtosis| exceeds the rule-of-thumb threshold. */
  likelyNonNormal: boolean;
}

const SKEW_THRESHOLD = 1;
const KURTOSIS_THRESHOLD = 1;

/**
 * Sample skewness (Fisher-Pearson moment coefficient g1) and excess kurtosis
 * (g2), the same population-moment formulas used by common tools like Excel's
 * SKEW.P/KURT. Used as a quick, client-side-feasible heuristic for whether a
 * dataset is normal enough for standard Cpk/Cp to be reliable, per the design
 * doc's explicit allowance of a skewness/kurtosis heuristic over Shapiro-Wilk.
 */
export function analyzeShape(values: number[]): DistributionShape {
  const n = values.length;
  const m = mean(values);
  const deviations = values.map((v) => v - m);

  const m2 = mean(deviations.map((d) => d ** 2));
  const m3 = mean(deviations.map((d) => d ** 3));
  const m4 = mean(deviations.map((d) => d ** 4));

  const skewness = m2 > 0 ? m3 / m2 ** 1.5 : 0;
  const excessKurtosis = m2 > 0 ? m4 / m2 ** 2 - 3 : 0;

  return {
    skewness,
    excessKurtosis,
    likelyNonNormal: n >= 5 && (Math.abs(skewness) > SKEW_THRESHOLD || Math.abs(excessKurtosis) > KURTOSIS_THRESHOLD),
  };
}
