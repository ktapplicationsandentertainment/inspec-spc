import type { ParetoEntry } from './pareto';

export interface ParsedParetoGrid {
  entries: ParetoEntry[];
  errors: string[];
}

export function parseParetoGrid(rawRows: string[][]): ParsedParetoGrid {
  const errors: string[] = [];
  const entries: ParetoEntry[] = [];

  rawRows.forEach((row, i) => {
    const label = (row[0] ?? '').trim();
    const valueStr = (row[1] ?? '').trim();
    if (label === '' && valueStr === '') return;

    if (label === '') {
      errors.push(`Row ${i + 1}: missing a category name.`);
      return;
    }
    if (valueStr === '') {
      errors.push(`Row ${i + 1} ("${label}"): missing a count/cost value.`);
      return;
    }

    const value = Number(valueStr);
    if (Number.isNaN(value)) {
      errors.push(`Row ${i + 1} ("${label}"): "${valueStr}" is not a number.`);
      return;
    }
    if (value <= 0) {
      errors.push(`Row ${i + 1} ("${label}"): value must be greater than 0.`);
      return;
    }

    entries.push({ label, value });
  });

  return { entries, errors };
}
