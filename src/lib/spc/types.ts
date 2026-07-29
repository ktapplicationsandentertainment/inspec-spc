export type WesternElectricRule = 1 | 2 | 3 | 4;

export const RULE_DESCRIPTIONS: Record<WesternElectricRule, string> = {
  1: 'A single point fell outside the 3-sigma control limits.',
  2: '2 of 3 consecutive points fell beyond the 2-sigma line on the same side of center.',
  3: '4 of 5 consecutive points fell beyond the 1-sigma line on the same side of center.',
  4: '8 consecutive points fell on the same side of the center line.',
};

export interface ChartPoint {
  index: number;
  label: string;
  value: number;
  violations: WesternElectricRule[];
}

export interface ChartSeries {
  title: string;
  centerLine: number;
  ucl: number;
  lcl: number;
  /** One-sigma distance from the center line, used for Western Electric zone rules. */
  sigma: number;
  points: ChartPoint[];
}

export type ControlChartType = 'I-MR' | 'XBAR-R';

export interface ControlChartResult {
  chartType: ControlChartType;
  subgroupSize: number;
  primary: ChartSeries;
  secondary: ChartSeries;
  violationCount: number;
  inControl: boolean;
}
