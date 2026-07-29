export type GageRRMethod = 'anova' | 'range';

export interface GageRRComponent {
  stdDev: number;
  studyVariation: number;
  percentContribution: number;
  percentStudyVariation: number;
}

export interface GageRRResult {
  method: GageRRMethod;
  repeatability: GageRRComponent;
  reproducibility: GageRRComponent;
  /** Part x Operator interaction; only separable under the ANOVA method. */
  interaction: GageRRComponent | null;
  grr: GageRRComponent;
  partVariation: GageRRComponent;
  totalVariation: { stdDev: number; studyVariation: number };
  /** Number of distinct categories the measurement system can reliably distinguish; AIAG wants >= 5. */
  ndc: number;
  verdict: 'acceptable' | 'marginal' | 'unacceptable';
}
