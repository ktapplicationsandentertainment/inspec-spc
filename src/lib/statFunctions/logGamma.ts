/**
 * Lanczos approximation (g=7, n=9) for ln(Gamma(x)), the standard published
 * coefficient set used throughout numerical computing (e.g. Numerical
 * Recipes). Needed as a building block for the incomplete gamma/beta
 * functions used by the chi-square and t-distributions.
 */
const G = 7;
const COEFFICIENTS = [
  0.99999999999980993, 676.5203681218851, -1259.1392167224028,
  771.32342877765313, -176.61502916214059, 12.507343278686905,
  -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
];

export function logGamma(x: number): number {
  if (x < 0.5) {
    // Reflection formula for x < 0.5.
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  }

  x -= 1;
  let a = COEFFICIENTS[0];
  const t = x + G + 0.5;
  for (let i = 1; i < G + 2; i++) {
    a += COEFFICIENTS[i] / (x + i);
  }
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}
