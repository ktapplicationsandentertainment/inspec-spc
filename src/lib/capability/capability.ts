import { INDIVIDUALS_D2 } from '../spc/constants';
import { mean, sampleStdDev } from '../spc/statUtils';
import { normalCdf } from './normalDist';
import type { CapabilityIndexSet, CapabilityResult, SpecLimits } from './types';

function buildIndexSet(
  basis: 'within' | 'overall',
  processMean: number,
  sigma: number,
  limits: SpecLimits,
): CapabilityIndexSet {
  const { usl, lsl } = limits;
  const cp = usl != null && lsl != null && sigma > 0 ? (usl - lsl) / (6 * sigma) : null;
  const cpu = usl != null && sigma > 0 ? (usl - processMean) / (3 * sigma) : null;
  const cpl = lsl != null && sigma > 0 ? (processMean - lsl) / (3 * sigma) : null;

  const sided = [cpu, cpl].filter((v): v is number => v != null);
  const cpk = sided.length > 0 ? Math.min(...sided) : NaN;

  const ppmBelowLsl = lsl != null ? normalCdf(lsl, processMean, sigma) * 1e6 : null;
  const ppmAboveUsl = usl != null ? (1 - normalCdf(usl, processMean, sigma)) * 1e6 : null;
  const ppmTotal = (ppmBelowLsl ?? 0) + (ppmAboveUsl ?? 0);

  return {
    basis,
    sigma,
    cp,
    cpu,
    cpl,
    cpk,
    ppmBelowLsl,
    ppmAboveUsl,
    ppmTotal,
    sigmaLevel: 3 * cpk,
  };
}

function validateLimits(limits: SpecLimits) {
  if (limits.usl == null && limits.lsl == null) {
    throw new Error('At least one spec limit (USL or LSL) is required.');
  }
  if (limits.usl != null && limits.lsl != null && limits.usl <= limits.lsl) {
    throw new Error('USL must be greater than LSL.');
  }
}

/**
 * Capability from raw individual measurements (no subgroup structure).
 * Estimates both:
 *  - short-term ("within") sigma via the average moving range / d2, the same
 *    technique used by the Individuals (I-MR) control chart, feeding Cp/Cpk.
 *  - long-term ("overall") sigma via the plain sample standard deviation
 *    (Bessel-corrected), feeding Pp/Ppk.
 */
export function calculateCapabilityFromRawData(values: number[], limits: SpecLimits): CapabilityResult {
  if (values.length < 2) {
    throw new Error('Capability analysis needs at least 2 data points.');
  }
  validateLimits(limits);

  const processMean = mean(values);

  const overallSigma = sampleStdDev(values);
  const movingRanges = values.slice(1).map((v, i) => Math.abs(v - values[i]));
  const withinSigma = mean(movingRanges) / INDIVIDUALS_D2;

  return {
    mean: processMean,
    usl: limits.usl,
    lsl: limits.lsl,
    within: buildIndexSet('within', processMean, withinSigma, limits),
    overall: buildIndexSet('overall', processMean, overallSigma, limits),
  };
}

/** Capability from user-supplied summary statistics and a single sigma estimate. */
export function calculateCapabilityFromSummary(
  processMean: number,
  sigma: number,
  sigmaBasis: 'within' | 'overall',
  limits: SpecLimits,
): CapabilityResult {
  if (sigma <= 0) {
    throw new Error('Standard deviation must be greater than 0.');
  }
  validateLimits(limits);

  const indexSet = buildIndexSet(sigmaBasis, processMean, sigma, limits);

  return {
    mean: processMean,
    usl: limits.usl,
    lsl: limits.lsl,
    within: sigmaBasis === 'within' ? indexSet : null,
    overall: sigmaBasis === 'overall' ? indexSet : null,
  };
}
