export interface ParsedColumns {
  group1: number[];
  group2: number[];
  errors: string[];
}

/** Parses two columns independently - each column's non-empty cells don't need to line up row-by-row. */
export function parseIndependentColumns(rows: string[][]): ParsedColumns {
  const errors: string[] = [];
  const group1: number[] = [];
  const group2: number[] = [];

  rows.forEach((row, i) => {
    [row[0], row[1]].forEach((cell, col) => {
      const trimmed = (cell ?? '').trim();
      if (trimmed === '') return;
      const n = Number(trimmed);
      if (Number.isNaN(n)) {
        errors.push(`Row ${i + 1}, column ${col + 1}: "${trimmed}" is not a number.`);
        return;
      }
      (col === 0 ? group1 : group2).push(n);
    });
  });

  return { group1, group2, errors };
}

/** Parses two columns as matched pairs - every non-blank row must have both values. */
export function parsePairedColumns(rows: string[][]): ParsedColumns {
  const errors: string[] = [];
  const group1: number[] = [];
  const group2: number[] = [];

  rows.forEach((row, i) => {
    const a = (row[0] ?? '').trim();
    const b = (row[1] ?? '').trim();
    if (a === '' && b === '') return;
    if (a === '' || b === '') {
      errors.push(`Row ${i + 1}: paired data needs a value in both columns.`);
      return;
    }
    const n1 = Number(a);
    const n2 = Number(b);
    if (Number.isNaN(n1) || Number.isNaN(n2)) {
      errors.push(`Row ${i + 1}: "${a}" or "${b}" is not a number.`);
      return;
    }
    group1.push(n1);
    group2.push(n2);
  });

  return { group1, group2, errors };
}
