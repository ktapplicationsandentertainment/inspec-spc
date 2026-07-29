export interface SpecLimits {
  usl: number | null;
  lsl: number | null;
}

export interface CapabilityIndexSet {
  /** 'within' -> Cp/Cpk (short-term), 'overall' -> Pp/Ppk (long-term). */
  basis: 'within' | 'overall';
  sigma: number;
  cp: number | null;
  cpu: number | null;
  cpl: number | null;
  cpk: number;
  ppmBelowLsl: number | null;
  ppmAboveUsl: number | null;
  ppmTotal: number;
  /** Approximate "sigma level", the common shorthand 3 * Cpk (or Ppk). */
  sigmaLevel: number;
}

export interface CapabilityResult {
  mean: number;
  usl: number | null;
  lsl: number | null;
  /** Cp/Cpk, estimated from short-term (within-subgroup) variation. */
  within: CapabilityIndexSet | null;
  /** Pp/Ppk, estimated from overall (long-term) variation. */
  overall: CapabilityIndexSet | null;
}
