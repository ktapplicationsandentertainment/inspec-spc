import { describe, expect, it } from 'vitest';
import { calculateIMR } from './imr';

describe('calculateIMR', () => {
  // Reference example from NIST/SEMATECH e-Handbook of Statistical Methods,
  // section 6.3.2.2 "Individuals Control Charts":
  // https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc322.htm
  // Published answer: xbar = 50.81, MRbar = 1.8778, UCL = 55.8041, LCL = 45.8159.
  const nistFlowRateData = [
    49.6, 47.6, 49.9, 51.3, 47.8, 51.2, 52.6, 52.4, 53.6, 52.1,
  ];

  it('matches the NIST published example to 4 decimal places', () => {
    const result = calculateIMR(nistFlowRateData);

    expect(result.primary.centerLine).toBeCloseTo(50.81, 4);
    expect(result.primary.ucl).toBeCloseTo(55.8041, 3);
    expect(result.primary.lcl).toBeCloseTo(45.8159, 3);
  });

  it('computes the moving range center line matching the NIST example', () => {
    const result = calculateIMR(nistFlowRateData);
    expect(result.secondary.centerLine).toBeCloseTo(1.8778, 4);
  });

  it('flags no violations for the in-control NIST example', () => {
    const result = calculateIMR(nistFlowRateData);
    expect(result.inControl).toBe(true);
    expect(result.violationCount).toBe(0);
  });

  it('flags a rule 1 violation for a point beyond the 3-sigma limit', () => {
    const data = [...nistFlowRateData, 100];
    const result = calculateIMR(data);
    const lastPoint = result.primary.points[result.primary.points.length - 1];
    expect(lastPoint.violations).toContain(1);
    expect(result.inControl).toBe(false);
  });

  it('throws on fewer than 2 points', () => {
    expect(() => calculateIMR([5])).toThrow();
  });
});
