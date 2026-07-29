export interface ParsedGrid {
  /** Non-empty numeric rows, in original order. Row length varies until validated by a chart calculator. */
  rows: number[][];
  /** Highest number of populated cells found in any row. */
  maxColumns: number;
  errors: string[];
}

export function parseGrid(rawRows: string[][]): ParsedGrid {
  const errors: string[] = [];
  const rows: number[][] = [];

  rawRows.forEach((rawRow, rowIndex) => {
    const trimmed = rawRow.map((c) => c.trim());
    const populated = trimmed.filter((c) => c !== '');
    if (populated.length === 0) return;

    const parsedRow: number[] = [];
    trimmed.forEach((cell, colIndex) => {
      if (cell === '') return;
      const n = Number(cell);
      if (Number.isNaN(n)) {
        errors.push(`Row ${rowIndex + 1}, column ${colIndex + 1}: "${cell}" is not a number.`);
        return;
      }
      parsedRow.push(n);
    });
    if (parsedRow.length > 0) rows.push(parsedRow);
  });

  const maxColumns = rows.reduce((max, r) => Math.max(max, r.length), 0);
  return { rows, maxColumns, errors };
}
