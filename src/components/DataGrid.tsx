import { useRef } from 'react';
import './DataGrid.css';

interface DataGridProps {
  rows: string[][];
  onChange: (rows: string[][]) => void;
  columnLabels?: string[];
}

/**
 * A minimal spreadsheet-like grid: type into any cell, or paste a
 * tab/newline-delimited block (copied straight from Excel/Sheets) starting
 * at any cell to fill many cells at once.
 */
export function DataGrid({ rows, onChange, columnLabels }: DataGridProps) {
  const colCount = Math.max(1, ...rows.map((r) => r.length));

  function setCell(rowIndex: number, colIndex: number, value: string) {
    const next = rows.map((r) => [...r]);
    while (next[rowIndex].length <= colIndex) next[rowIndex].push('');
    next[rowIndex][colIndex] = value;
    onChange(next);
  }

  function handlePaste(rowIndex: number, colIndex: number, e: React.ClipboardEvent) {
    const text = e.clipboardData.getData('text/plain');
    if (!text.includes('\t') && !text.includes('\n')) return; // let default single-cell paste happen
    e.preventDefault();

    const pastedRows = text
      .replace(/\r/g, '')
      .split('\n')
      .filter((line, i, arr) => !(i === arr.length - 1 && line === ''))
      .map((line) => line.split('\t'));

    const next = rows.map((r) => [...r]);
    pastedRows.forEach((pastedRow, dr) => {
      const targetRow = rowIndex + dr;
      while (next.length <= targetRow) next.push([]);
      pastedRow.forEach((val, dc) => {
        const targetCol = colIndex + dc;
        while (next[targetRow].length <= targetCol) next[targetRow].push('');
        next[targetRow][targetCol] = val.trim();
      });
    });
    onChange(next);
  }

  function addRow() {
    onChange([...rows, Array(colCount).fill('')]);
  }

  function addColumn() {
    onChange(rows.map((r) => [...r, '']));
  }

  function removeRow(index: number) {
    onChange(rows.filter((_, i) => i !== index));
  }

  function clearAll() {
    onChange([Array(colCount).fill('')]);
  }

  return (
    <div className="data-grid">
      <table>
        <thead>
          <tr>
            <th className="row-handle" />
            {Array.from({ length: colCount }, (_, c) => (
              <th key={c}>{columnLabels?.[c] ?? `Col ${c + 1}`}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              <td className="row-handle">
                <button
                  type="button"
                  aria-label={`Remove row ${r + 1}`}
                  onClick={() => removeRow(r)}
                  disabled={rows.length <= 1}
                >
                  ×
                </button>
              </td>
              {Array.from({ length: colCount }, (_, c) => (
                <Cell
                  key={c}
                  value={row[c] ?? ''}
                  onChange={(v) => setCell(r, c, v)}
                  onPaste={(e) => handlePaste(r, c, e)}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="data-grid-actions">
        <button type="button" onClick={addRow}>
          + Add row
        </button>
        <button type="button" onClick={addColumn}>
          + Add column
        </button>
        <button type="button" onClick={clearAll} className="danger">
          Clear all
        </button>
      </div>
    </div>
  );
}

function Cell({
  value,
  onChange,
  onPaste,
}: {
  value: string;
  onChange: (v: string) => void;
  onPaste: (e: React.ClipboardEvent) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <td>
      <input
        ref={ref}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={onPaste}
      />
    </td>
  );
}
