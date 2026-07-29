/**
 * AIAG MSA-4 "Average and Range method" constants, from the standard
 * published K1/K2/K3 tables (derived from Duncan's d2* tables for a single
 * range, K = 5.15 / d2*). These exact values appear identically across the
 * AIAG manual and essentially every Gage R&R reference/calculator.
 */

/** K1: repeatability constant, indexed by number of trials. AIAG only publishes 2-3 trials. */
export const K1_TABLE: Record<number, number> = {
  2: 4.56,
  3: 3.05,
};

/** K2/K3: reproducibility and part-variation constants, indexed by number of operators or parts. */
export const K2_K3_TABLE: Record<number, number> = {
  2: 3.65,
  3: 2.7,
  4: 2.3,
  5: 2.08,
  6: 1.93,
  7: 1.82,
  8: 1.74,
  9: 1.67,
  10: 1.62,
};

/** AIAG's standard "study variation" multiplier, covering ~99% of a normal distribution. */
export const STUDY_VARIATION_MULTIPLIER = 5.15;

export const MIN_PARTS = 2;
export const MAX_PARTS = 10;
export const MIN_OPERATORS = 2;
export const MAX_OPERATORS = 10;
export const MIN_TRIALS = 2;
export const MAX_TRIALS = 3;
