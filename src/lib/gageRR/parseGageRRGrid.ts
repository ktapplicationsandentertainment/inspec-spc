import type { GageRRData } from './gageRR';

export interface ParsedGageRRGrid {
  data: GageRRData;
  errors: string[];
}

/** Parses part rows where columns are grouped as [operator][trial], k operators x r trials wide. */
export function parseGageRRGrid(rows: string[][], operatorCount: number, trialCount: number): ParsedGageRRGrid {
  const errors: string[] = [];
  const data: GageRRData = [];

  rows.forEach((row, partIndex) => {
    const trimmed = row.map((c) => c.trim());
    if (trimmed.every((c) => c === '')) return; // skip fully blank rows

    const part: number[][] = [];
    let rowHasError = false;
    for (let j = 0; j < operatorCount; j++) {
      const trials: number[] = [];
      for (let m = 0; m < trialCount; m++) {
        const cell = trimmed[j * trialCount + m] ?? '';
        if (cell === '') {
          errors.push(`Part ${partIndex + 1}: missing a value for operator ${j + 1}, trial ${m + 1}.`);
          rowHasError = true;
          continue;
        }
        const n = Number(cell);
        if (Number.isNaN(n)) {
          errors.push(`Part ${partIndex + 1}, operator ${j + 1}, trial ${m + 1}: "${cell}" is not a number.`);
          rowHasError = true;
          continue;
        }
        trials.push(n);
      }
      part.push(trials);
    }
    if (!rowHasError) data.push(part);
  });

  return { data, errors };
}
