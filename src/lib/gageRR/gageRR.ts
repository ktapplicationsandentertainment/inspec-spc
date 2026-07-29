import { mean } from '../spc/statUtils';
import {
  K1_TABLE,
  K2_K3_TABLE,
  MAX_OPERATORS,
  MAX_PARTS,
  MAX_TRIALS,
  MIN_OPERATORS,
  MIN_PARTS,
  MIN_TRIALS,
  STUDY_VARIATION_MULTIPLIER,
} from './constants';
import type { GageRRComponent, GageRRResult } from './types';

/** data[partIndex][operatorIndex][trialIndex] */
export type GageRRData = number[][][];

function validate(data: GageRRData): { n: number; k: number; r: number } {
  const n = data.length;
  if (n < MIN_PARTS || n > MAX_PARTS) {
    throw new Error(`Gage R&R needs ${MIN_PARTS}-${MAX_PARTS} parts (got ${n}).`);
  }
  const k = data[0]?.length ?? 0;
  if (k < MIN_OPERATORS || k > MAX_OPERATORS) {
    throw new Error(`Gage R&R needs ${MIN_OPERATORS}-${MAX_OPERATORS} operators (got ${k}).`);
  }
  const r = data[0]?.[0]?.length ?? 0;
  if (r < MIN_TRIALS || r > MAX_TRIALS) {
    throw new Error(`Gage R&R needs ${MIN_TRIALS}-${MAX_TRIALS} trials per operator (got ${r}).`);
  }
  for (const part of data) {
    if (part.length !== k) throw new Error('Every part must have the same number of operators filled in.');
    for (const trials of part) {
      if (trials.length !== r) throw new Error('Every operator must have the same number of trials filled in.');
    }
  }
  return { n, k, r };
}

function buildComponent(stdDev: number, totalStdDev: number, totalVariance: number): GageRRComponent {
  const variance = stdDev ** 2;
  return {
    stdDev,
    studyVariation: STUDY_VARIATION_MULTIPLIER * stdDev,
    percentContribution: totalVariance > 0 ? (100 * variance) / totalVariance : 0,
    percentStudyVariation: totalStdDev > 0 ? (100 * stdDev) / totalStdDev : 0,
  };
}

function verdictFromPercentGrr(percentStudyVariationGrr: number): GageRRResult['verdict'] {
  if (percentStudyVariationGrr < 10) return 'acceptable';
  if (percentStudyVariationGrr <= 30) return 'marginal';
  return 'unacceptable';
}

function finalize(
  sigmaRepeatability: number,
  sigmaReproducibility: number,
  sigmaInteraction: number | null,
  sigmaPart: number,
  method: GageRRResult['method'],
): GageRRResult {
  const varGrr = sigmaRepeatability ** 2 + sigmaReproducibility ** 2;
  const sigmaGrr = Math.sqrt(varGrr);
  const varTotal = varGrr + sigmaPart ** 2;
  const sigmaTotal = Math.sqrt(varTotal);

  const comp = (s: number) => buildComponent(s, sigmaTotal, varTotal);

  return {
    method,
    repeatability: comp(sigmaRepeatability),
    reproducibility: comp(sigmaReproducibility),
    interaction: sigmaInteraction != null ? comp(sigmaInteraction) : null,
    grr: comp(sigmaGrr),
    partVariation: comp(sigmaPart),
    totalVariation: { stdDev: sigmaTotal, studyVariation: STUDY_VARIATION_MULTIPLIER * sigmaTotal },
    ndc: sigmaGrr > 0 ? Math.floor(1.41 * (sigmaPart / sigmaGrr)) : Infinity,
    verdict: verdictFromPercentGrr(sigmaTotal > 0 ? (100 * sigmaGrr) / sigmaTotal : 0),
  };
}

/**
 * ANOVA method (AIAG MSA-4 preferred method). Decomposes total sum of
 * squares into Part, Operator, Part*Operator interaction, and Equipment
 * (repeatability/error) terms. Negative variance component estimates -
 * a known, expected artifact of the method when a true effect is near zero -
 * are clipped to 0, the standard treatment used throughout the MSA literature.
 */
export function calculateGageRRAnova(data: GageRRData): GageRRResult {
  const { n, k, r } = validate(data);

  const partMeans = data.map((part) => mean(part.flat()));
  const operatorMeans = Array.from({ length: k }, (_, j) => mean(data.map((part) => part[j]).flat()));
  const cellMeans = data.map((part) => part.map((trials) => mean(trials)));
  const grandMean = mean(data.flat(2));

  const ssTotal = data.flat(2).reduce((sum, v) => sum + (v - grandMean) ** 2, 0);
  const ssPart = k * r * partMeans.reduce((sum, m) => sum + (m - grandMean) ** 2, 0);
  const ssOperator = n * r * operatorMeans.reduce((sum, m) => sum + (m - grandMean) ** 2, 0);

  let ssInteraction = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < k; j++) {
      ssInteraction += (cellMeans[i][j] - partMeans[i] - operatorMeans[j] + grandMean) ** 2;
    }
  }
  ssInteraction *= r;

  const ssEquipment = ssTotal - ssPart - ssOperator - ssInteraction;

  const dfPart = n - 1;
  const dfOperator = k - 1;
  const dfInteraction = (n - 1) * (k - 1);
  const dfEquipment = n * k * (r - 1);

  const msPart = ssPart / dfPart;
  const msOperator = ssOperator / dfOperator;
  const msInteraction = ssInteraction / dfInteraction;
  const msEquipment = ssEquipment / dfEquipment;

  const varEquipment = msEquipment;
  const varInteraction = Math.max(0, (msInteraction - msEquipment) / r);
  const varOperator = Math.max(0, (msOperator - msInteraction) / (n * r));
  const varPart = Math.max(0, (msPart - msInteraction) / (k * r));
  const varReproducibility = varOperator + varInteraction;

  return finalize(
    Math.sqrt(varEquipment),
    Math.sqrt(varReproducibility),
    Math.sqrt(varInteraction),
    Math.sqrt(varPart),
    'anova',
  );
}

/**
 * Average and Range method (AIAG's traditional, simpler fallback). Uses the
 * published K1 (repeatability) and K2/K3 (reproducibility/part) constants,
 * derived from Duncan's d2* tables, instead of a full ANOVA decomposition.
 * Cannot separate a part x operator interaction effect.
 */
export function calculateGageRRRange(data: GageRRData): GageRRResult {
  const { n, k, r } = validate(data);
  if (!(r in K1_TABLE)) throw new Error(`Range method only supports 2-3 trials (got ${r}).`);
  if (!(k in K2_K3_TABLE)) throw new Error(`Range method supports 2-${Object.keys(K2_K3_TABLE).length + 1} operators (got ${k}).`);
  if (!(n in K2_K3_TABLE)) throw new Error(`Range method supports 2-${Object.keys(K2_K3_TABLE).length + 1} parts (got ${n}).`);

  const cellRanges: number[] = [];
  for (const part of data) {
    for (const trials of part) {
      cellRanges.push(Math.max(...trials) - Math.min(...trials));
    }
  }
  const rBar = mean(cellRanges);
  const ev = rBar * K1_TABLE[r];

  const operatorMeans = Array.from({ length: k }, (_, j) => mean(data.map((part) => part[j]).flat()));
  const xDiff = Math.max(...operatorMeans) - Math.min(...operatorMeans);
  const av = Math.sqrt(Math.max(0, (xDiff * K2_K3_TABLE[k]) ** 2 - ev ** 2 / (n * r)));

  const partMeans = data.map((part) => mean(part.flat()));
  const rp = Math.max(...partMeans) - Math.min(...partMeans);
  const pv = rp * K2_K3_TABLE[n];

  return finalize(ev / STUDY_VARIATION_MULTIPLIER, av / STUDY_VARIATION_MULTIPLIER, null, pv / STUDY_VARIATION_MULTIPLIER, 'range');
}
