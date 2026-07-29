import { useMemo, useState } from 'react';
import { DataGrid } from '../components/DataGrid';
import { ParetoView } from '../components/ParetoView';
import { parseParetoGrid } from '../lib/pareto/parseParetoGrid';
import { calculateParetoAnalysis } from '../lib/pareto/pareto';
import { useDocumentMeta } from '../lib/useDocumentMeta';

const SAMPLE_DATA: string[][] = [
  ['Scratches', '50'],
  ['Dents', '30'],
  ['Discoloration', '12'],
  ['Missing parts', '5'],
  ['Other', '3'],
];

export function ParetoPage() {
  useDocumentMeta(
    'Pareto Chart Generator',
    'Paste category and count/cost data to generate a Pareto chart with an 80/20 cumulative line and automatic vital-few detection. Free, no signup.',
    '/pareto',
  );

  const [rows, setRows] = useState<string[][]>(SAMPLE_DATA);
  const [threshold, setThreshold] = useState(80);

  const analysis = useMemo(() => {
    const parsed = parseParetoGrid(rows);
    if (parsed.errors.length > 0) return { error: parsed.errors[0], result: null };
    if (parsed.entries.length === 0) return { error: null, result: null };
    try {
      return { error: null, result: calculateParetoAnalysis(parsed.entries, threshold) };
    } catch (e) {
      return { error: (e as Error).message, result: null };
    }
  }, [rows, threshold]);

  const result = analysis.result;

  return (
    <div className="tool-page">
      <h1>Pareto Chart Generator</h1>
      <p className="tool-intro">
        Paste a category in the first column and a count or cost in the second. The chart sorts
        your categories from biggest to smallest and shows the "vital few" that account for most
        of the total.
      </p>

      <DataGrid rows={rows} onChange={setRows} columnLabels={['Category', 'Count / Cost']} />

      <div className="field-row">
        <label htmlFor="pareto-threshold">Vital-few threshold</label>
        <input
          id="pareto-threshold"
          type="number"
          min={1}
          max={99}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value) || 80)}
        />
        <span>%</span>
      </div>

      {analysis.error && <p className="error-banner">{analysis.error}</p>}

      {result && (
        <>
          <ParetoView categories={result.categories} threshold={threshold} />

          <p className="interpretation ok">
            {result.vitalFewCount} of {result.categories.length} categories account for at least{' '}
            {threshold}% of the total — focus improvement effort on{' '}
            {result.categories
              .slice(0, result.vitalFewCount)
              .map((c) => c.label)
              .join(', ')}
            .
          </p>

          <table className="stats-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Value</th>
                <th>% of total</th>
                <th>Cumulative %</th>
                <th>Vital few?</th>
              </tr>
            </thead>
            <tbody>
              {result.categories.map((c) => (
                <tr key={c.label}>
                  <td>{c.label}</td>
                  <td>{c.value}</td>
                  <td>{c.percentOfTotal.toFixed(1)}%</td>
                  <td>{c.cumulativePercent.toFixed(1)}%</td>
                  <td>{c.isVitalFew ? 'Yes' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
