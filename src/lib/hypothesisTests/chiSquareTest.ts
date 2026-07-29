import { chiSquarePValue } from '../statFunctions/chiSquareDistribution';

export interface ChiSquareResult {
  statistic: number;
  df: number;
  pValue: number;
  expected: number[][];
  /** True if any expected cell count is below 5, the standard chi-square validity caveat. */
  lowExpectedCountWarning: boolean;
}

/** Chi-square test of independence for a contingency table (rows x columns of observed counts). */
export function chiSquareTestOfIndependence(observed: number[][]): ChiSquareResult {
  const rows = observed.length;
  const cols = observed[0]?.length ?? 0;
  if (rows < 2 || cols < 2) {
    throw new Error('A chi-square test of independence needs at least 2 rows and 2 columns.');
  }
  if (!observed.every((row) => row.length === cols)) {
    throw new Error('Every row must have the same number of columns.');
  }
  if (observed.some((row) => row.some((v) => v < 0))) {
    throw new Error('Counts cannot be negative.');
  }

  const rowTotals = observed.map((row) => row.reduce((a, b) => a + b, 0));
  const colTotals = Array.from({ length: cols }, (_, j) => observed.reduce((sum, row) => sum + row[j], 0));
  const grandTotal = rowTotals.reduce((a, b) => a + b, 0);
  if (grandTotal === 0) throw new Error('Table cannot be all zeros.');

  const expected = observed.map((row, i) => row.map((_, j) => (rowTotals[i] * colTotals[j]) / grandTotal));

  let statistic = 0;
  let lowExpectedCountWarning = false;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (expected[i][j] < 5) lowExpectedCountWarning = true;
      statistic += (observed[i][j] - expected[i][j]) ** 2 / expected[i][j];
    }
  }

  const df = (rows - 1) * (cols - 1);

  return { statistic, df, pValue: chiSquarePValue(statistic, df), expected, lowExpectedCountWarning };
}
