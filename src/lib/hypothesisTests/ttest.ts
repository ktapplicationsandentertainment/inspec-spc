import { mean, sampleStdDev } from '../spc/statUtils';
import { tTwoTailedPValue } from '../statFunctions/tDistribution';

export interface TTestResult {
  testType: 'one-sample' | 'two-sample' | 'paired';
  statistic: number;
  df: number;
  pValue: number;
  mean1: number;
  mean2: number;
  meanDifference: number;
}

/** One-sample t-test: is the sample mean different from a hypothesized value? */
export function oneSampleTTest(values: number[], hypothesizedMean: number): TTestResult {
  if (values.length < 2) throw new Error('A t-test needs at least 2 data points.');

  const sampleMean = mean(values);
  const sd = sampleStdDev(values, sampleMean);
  const n = values.length;
  const se = sd / Math.sqrt(n);
  if (se === 0) throw new Error('Standard error is 0 (all values identical) - cannot compute a t-statistic.');

  const t = (sampleMean - hypothesizedMean) / se;
  const df = n - 1;

  return {
    testType: 'one-sample',
    statistic: t,
    df,
    pValue: tTwoTailedPValue(t, df),
    mean1: sampleMean,
    mean2: hypothesizedMean,
    meanDifference: sampleMean - hypothesizedMean,
  };
}

/** Two-sample (independent groups) t-test using Welch's formula (does not assume equal variances). */
export function twoSampleTTest(group1: number[], group2: number[]): TTestResult {
  if (group1.length < 2 || group2.length < 2) throw new Error('Each group needs at least 2 data points.');

  const n1 = group1.length;
  const n2 = group2.length;
  const mean1 = mean(group1);
  const mean2 = mean(group2);
  const sd1 = sampleStdDev(group1, mean1);
  const sd2 = sampleStdDev(group2, mean2);

  const v1 = sd1 ** 2 / n1;
  const v2 = sd2 ** 2 / n2;
  const se = Math.sqrt(v1 + v2);
  if (se === 0) throw new Error('Standard error is 0 (all values identical) - cannot compute a t-statistic.');

  const t = (mean1 - mean2) / se;
  // Welch-Satterthwaite approximation for degrees of freedom.
  const df = (v1 + v2) ** 2 / (v1 ** 2 / (n1 - 1) + v2 ** 2 / (n2 - 1));

  return {
    testType: 'two-sample',
    statistic: t,
    df,
    pValue: tTwoTailedPValue(t, df),
    mean1,
    mean2,
    meanDifference: mean1 - mean2,
  };
}

/** Paired t-test: is the mean difference between matched pairs different from 0? */
export function pairedTTest(group1: number[], group2: number[]): TTestResult {
  if (group1.length !== group2.length) throw new Error('Paired samples must have the same number of observations.');

  const differences = group1.map((v, i) => v - group2[i]);
  const result = oneSampleTTest(differences, 0);

  return { ...result, testType: 'paired', mean1: mean(group1), mean2: mean(group2) };
}
