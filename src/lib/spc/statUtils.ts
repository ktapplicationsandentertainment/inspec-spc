export function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function range(values: number[]): number {
  return Math.max(...values) - Math.min(...values);
}

/** Sample standard deviation with Bessel's correction (n-1 denominator). */
export function sampleStdDev(values: number[], knownMean: number = mean(values)): number {
  const sumSquares = values.reduce((acc, v) => acc + (v - knownMean) ** 2, 0);
  return Math.sqrt(sumSquares / (values.length - 1));
}
