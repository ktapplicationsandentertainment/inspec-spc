import { useMemo, useState } from 'react';
import { DataGrid } from '../components/DataGrid';
import { GageRRGauge } from '../components/GageRRGauge';
import { parseGageRRGrid } from '../lib/gageRR/parseGageRRGrid';
import { calculateGageRRAnova, calculateGageRRRange } from '../lib/gageRR/gageRR';
import { MAX_OPERATORS, MAX_TRIALS, MIN_OPERATORS, MIN_TRIALS } from '../lib/gageRR/constants';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import type { GageRRComponent, GageRRResult } from '../lib/gageRR/types';

type Method = 'anova' | 'range';

const SAMPLE_ROWS = [
  ['10.02', '10.03', '10.01', '10.04', '10.03', '10.02'],
  ['10.05', '10.06', '10.04', '10.07', '10.06', '10.05'],
  ['9.98', '9.99', '9.97', '10.00', '9.99', '9.98'],
  ['10.10', '10.11', '10.09', '10.12', '10.11', '10.10'],
  ['9.95', '9.96', '9.94', '9.97', '9.96', '9.95'],
];

function makeBlankRows(width: number, rowCount = 5): string[][] {
  return Array.from({ length: rowCount }, () => Array(width).fill(''));
}

export function GageRRPage() {
  useDocumentMeta(
    'Gage R&R Calculator (ANOVA & Range Method)',
    'Analyze measurement system variation with a free Gage R&R calculator using the ANOVA method or the classic Average & Range method. Includes %GRR, ndc, and AIAG guidance.',
    '/gage-rr',
  );

  const [operatorCount, setOperatorCount] = useState(3);
  const [trialCount, setTrialCount] = useState(2);
  const [method, setMethod] = useState<Method>('anova');
  const [rows, setRows] = useState<string[][]>(SAMPLE_ROWS);

  const columnLabels = useMemo(
    () =>
      Array.from({ length: operatorCount * trialCount }, (_, idx) => {
        const j = Math.floor(idx / trialCount);
        const m = idx % trialCount;
        return `Op ${String.fromCharCode(65 + j)} - T${m + 1}`;
      }),
    [operatorCount, trialCount],
  );

  function updateOperatorCount(k: number) {
    setOperatorCount(k);
    setRows(makeBlankRows(k * trialCount));
  }

  function updateTrialCount(r: number) {
    setTrialCount(r);
    setRows(makeBlankRows(operatorCount * r));
  }

  const analysis = useMemo((): { error: string | null; result: GageRRResult | null } => {
    const parsed = parseGageRRGrid(rows, operatorCount, trialCount);
    if (parsed.errors.length > 0) return { error: parsed.errors[0], result: null };
    if (parsed.data.length < 2) return { error: null, result: null };
    try {
      const result = method === 'anova' ? calculateGageRRAnova(parsed.data) : calculateGageRRRange(parsed.data);
      return { error: null, result };
    } catch (e) {
      return { error: (e as Error).message, result: null };
    }
  }, [rows, operatorCount, trialCount, method]);

  const result = analysis.result;

  return (
    <div className="tool-page">
      <h1>Gage R&amp;R Calculator</h1>
      <p className="tool-intro">
        Check whether your measurement system itself is trustworthy. Have{' '}
        {operatorCount} operators each measure the same {rows.length} parts {trialCount} times,
        paste the results below, and find out how much of your variation is coming from the gage
        instead of the parts.
      </p>

      <div className="field-row">
        <label htmlFor="op-count">Operators</label>
        <select id="op-count" value={operatorCount} onChange={(e) => updateOperatorCount(Number(e.target.value))}>
          {Array.from({ length: MAX_OPERATORS - MIN_OPERATORS + 1 }, (_, i) => MIN_OPERATORS + i).map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>

        <label htmlFor="trial-count">Trials</label>
        <select id="trial-count" value={trialCount} onChange={(e) => updateTrialCount(Number(e.target.value))}>
          {Array.from({ length: MAX_TRIALS - MIN_TRIALS + 1 }, (_, i) => MIN_TRIALS + i).map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <label htmlFor="method-select">Method</label>
        <select id="method-select" value={method} onChange={(e) => setMethod(e.target.value as Method)}>
          <option value="anova">ANOVA (recommended)</option>
          <option value="range">Average &amp; Range (simpler)</option>
        </select>
      </div>

      <p className="tool-intro">Each row is one part. Columns are grouped by operator, one column per trial.</p>
      <DataGrid rows={rows} onChange={setRows} columnLabels={columnLabels} />

      {analysis.error && <p className="error-banner">{analysis.error}</p>}

      {result && (
        <div className="capability-results">
          <GageRRGauge percentGrr={result.grr.percentStudyVariation} />

          <p
            className={
              result.verdict === 'acceptable'
                ? 'interpretation ok'
                : result.verdict === 'marginal'
                  ? 'warning-banner'
                  : 'error-banner'
            }
          >
            {result.verdict === 'acceptable' &&
              `This measurement system is acceptable — %GRR is ${result.grr.percentStudyVariation.toFixed(1)}%, below the 10% AIAG guideline.`}
            {result.verdict === 'marginal' &&
              `This measurement system is marginal — %GRR is ${result.grr.percentStudyVariation.toFixed(1)}%, between the 10% and 30% AIAG thresholds. May be acceptable depending on the application and cost of improvement.`}
            {result.verdict === 'unacceptable' &&
              `This measurement system needs improvement — %GRR is ${result.grr.percentStudyVariation.toFixed(1)}%, above the 30% AIAG threshold.`}
            {' '}Number of distinct categories (ndc): {Number.isFinite(result.ndc) ? result.ndc : '10+'}
            {Number.isFinite(result.ndc) && result.ndc < 5 ? ' (AIAG recommends at least 5).' : '.'}
          </p>

          <table className="stats-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Std. dev.</th>
                <th>Study var. (5.15σ)</th>
                <th>% Contribution</th>
                <th>% Study var.</th>
              </tr>
            </thead>
            <tbody>
              <ComponentRow label="Repeatability (EV)" c={result.repeatability} />
              <ComponentRow label="Reproducibility (AV)" c={result.reproducibility} />
              {result.interaction && <ComponentRow label="  — Part × Operator interaction" c={result.interaction} />}
              <ComponentRow label="Total Gage R&R (GRR)" c={result.grr} />
              <ComponentRow label="Part variation (PV)" c={result.partVariation} />
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ComponentRow({ label, c }: { label: string; c: GageRRComponent }) {
  return (
    <tr>
      <td>{label}</td>
      <td>{c.stdDev.toFixed(4)}</td>
      <td>{c.studyVariation.toFixed(4)}</td>
      <td>{c.percentContribution.toFixed(2)}%</td>
      <td>{c.percentStudyVariation.toFixed(2)}%</td>
    </tr>
  );
}
