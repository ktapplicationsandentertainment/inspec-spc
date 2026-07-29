/**
 * Control chart constants, sourced from NIST/SEMATECH e-Handbook of Statistical
 * Methods, section 6.3.2.1 "Shewhart X-bar and R and X-bar and S Control Charts"
 * (https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc321.htm), table of
 * factors for calculating limits for Xbar and R charts, n = 2 through 10.
 *
 * A2 gives the Xbar chart limits: UCL/LCL = Xbarbar +/- A2 * Rbar
 * D3/D4 give the R chart limits: UCL = D4 * Rbar, LCL = D3 * Rbar
 */
export interface ChartConstants {
  A2: number;
  D3: number;
  D4: number;
}

export const XBAR_R_CONSTANTS: Record<number, ChartConstants> = {
  2: { A2: 1.88, D3: 0, D4: 3.267 },
  3: { A2: 1.023, D3: 0, D4: 2.575 },
  4: { A2: 0.729, D3: 0, D4: 2.282 },
  5: { A2: 0.577, D3: 0, D4: 2.115 },
  6: { A2: 0.483, D3: 0, D4: 2.004 },
  7: { A2: 0.419, D3: 0.076, D4: 1.924 },
  8: { A2: 0.373, D3: 0.136, D4: 1.864 },
  9: { A2: 0.337, D3: 0.184, D4: 1.816 },
  10: { A2: 0.308, D3: 0.223, D4: 1.777 },
};

export const MIN_XBAR_R_SUBGROUP_SIZE = 2;
export const MAX_XBAR_R_SUBGROUP_SIZE = 10;

/**
 * d2 for n=2, used by the Individuals (I-MR) chart to estimate sigma from the
 * average moving range: sigma-hat = MRbar / d2. Verified against the NIST
 * worked example at https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc322.htm
 * (flow rate data: MRbar = 1.8778 -> UCL = 55.8041, LCL = 45.8159 using 3/d2).
 */
export const INDIVIDUALS_D2 = 1.128;

/** Moving-range chart (n=2) uses the same D3/D4 as the Xbar-R table at n=2. */
export const MOVING_RANGE_CONSTANTS = XBAR_R_CONSTANTS[2];
