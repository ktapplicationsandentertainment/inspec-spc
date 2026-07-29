import { zCriticalValue } from '../capability/normalDist';
import { tCriticalValue } from '../statFunctions/tDistribution';

function applyFinitePopulationCorrection(n0: number, populationSize?: number): number {
  if (!populationSize || populationSize <= 0) return n0;
  return n0 / (1 + (n0 - 1) / populationSize);
}

/** Sample size needed to estimate a proportion within +/-marginOfError at the given confidence level. */
export function sampleSizeForProportion(
  confidenceLevel: number,
  marginOfError: number,
  estimatedProportion = 0.5,
  populationSize?: number,
): number {
  if (marginOfError <= 0 || marginOfError >= 1) throw new Error('Margin of error must be between 0 and 1.');
  if (estimatedProportion <= 0 || estimatedProportion >= 1) throw new Error('Estimated proportion must be between 0 and 1.');

  const z = zCriticalValue(confidenceLevel);
  const n0 = (z * z * estimatedProportion * (1 - estimatedProportion)) / (marginOfError * marginOfError);
  return Math.ceil(applyFinitePopulationCorrection(n0, populationSize));
}

/** Sample size needed to estimate a mean within +/-marginOfError (same units as the data). */
export function sampleSizeForMean(
  confidenceLevel: number,
  marginOfError: number,
  estimatedStdDev: number,
  populationSize?: number,
): number {
  if (marginOfError <= 0) throw new Error('Margin of error must be greater than 0.');
  if (estimatedStdDev <= 0) throw new Error('Estimated standard deviation must be greater than 0.');

  const z = zCriticalValue(confidenceLevel);
  const n0 = (z * z * estimatedStdDev * estimatedStdDev) / (marginOfError * marginOfError);
  return Math.ceil(applyFinitePopulationCorrection(n0, populationSize));
}

export interface ConfidenceInterval {
  pointEstimate: number;
  marginOfError: number;
  lower: number;
  upper: number;
}

/** Confidence interval for a proportion, given x successes out of n trials (normal/Wald approximation). */
export function confidenceIntervalForProportion(
  successes: number,
  sampleSize: number,
  confidenceLevel: number,
): ConfidenceInterval {
  if (sampleSize <= 0) throw new Error('Sample size must be greater than 0.');
  if (successes < 0 || successes > sampleSize) throw new Error('Successes must be between 0 and the sample size.');

  const pHat = successes / sampleSize;
  const z = zCriticalValue(confidenceLevel);
  const moe = z * Math.sqrt((pHat * (1 - pHat)) / sampleSize);

  return {
    pointEstimate: pHat,
    marginOfError: moe,
    lower: Math.max(0, pHat - moe),
    upper: Math.min(1, pHat + moe),
  };
}

/** Confidence interval for a mean, given sample mean/std dev/size (uses the t-distribution). */
export function confidenceIntervalForMean(
  mean: number,
  stdDev: number,
  sampleSize: number,
  confidenceLevel: number,
): ConfidenceInterval {
  if (sampleSize < 2) throw new Error('Sample size must be at least 2.');
  if (stdDev < 0) throw new Error('Standard deviation cannot be negative.');

  const df = sampleSize - 1;
  const t = tCriticalValue(df, confidenceLevel);
  const moe = t * (stdDev / Math.sqrt(sampleSize));

  return { pointEstimate: mean, marginOfError: moe, lower: mean - moe, upper: mean + moe };
}
