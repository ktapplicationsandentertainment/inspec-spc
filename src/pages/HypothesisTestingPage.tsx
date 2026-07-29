import { useMemo, useState } from 'react';
import { DataGrid } from '../components/DataGrid';
import { parseGrid } from '../lib/parseGrid';
import { parseIndependentColumns, parsePairedColumns } from '../lib/hypothesisTests/parseColumns';
import { oneSampleTTest, pairedTTest, twoSampleTTest } from '../lib/hypothesisTests/ttest';
import { chiSquareTestOfIndependence } from '../lib/hypothesisTests/chiSquareTest';
import type { TTestResult } from '../lib/hypothesisTests/ttest';
import type { ChiSquareResult } from '../lib/hypothesisTests/chiSquareTest';
import { useDocumentMeta } from '../lib/useDocumentMeta';

type TestType = 'one-sample' | 'two-sample' | 'paired' | 'chi-square';

const SAMPLE_ROWS: Record<TestType, string[][]> = {
  'one-sample': ['10.2', '9.8', '10.5', '10.1', '9.9', '10.3', '10.0', '9.7'].map((v) => [v]),
  'two-sample': [
    ['22.1', '19.8'],
    ['21.4', '20.5'],
    ['23.0', '18.9'],
    ['22.6', '20.1'],
    ['21.9', '19.4'],
  ],
  paired: [
    ['85', '88'],
    ['90', '94'],
    ['78', '82'],
    ['92', '95'],
    ['88', '90'],
  ],
  'chi-square': [
    ['30', '10'],
    ['20', '40'],
  ],
};

export function HypothesisTestingPage() {
  useDocumentMeta(
    'Hypothesis Testing Calculator (t-test, Chi-Square)',
    'Run a one-sample, two-sample, or paired t-test, or a chi-square test of independence, with plain-language significance interpretation. Free, no signup.',
    '/hypothesis-testing',
  );

  const [testType, setTestType] = useState<TestType>('one-sample');
  const [rows, setRows] = useState<string[][]>(SAMPLE_ROWS['one-sample']);
  const [hypothesizedMean, setHypothesizedMean] = useState('10');

  function changeTestType(next: TestType) {
    setTestType(next);
    setRows(SAMPLE_ROWS[next]);
  }

  const analysis = useMemo((): { error: string | null; t?: TTestResult; chi?: ChiSquareResult } => {
    try {
      if (testType === 'one-sample') {
        const parsed = parseGrid(rows);
        if (parsed.errors.length > 0) return { error: parsed.errors[0] };
        const values = parsed.rows.flat();
        if (values.length < 2) return { error: null };
        return { error: null, t: oneSampleTTest(values, Number(hypothesizedMean)) };
      }
      if (testType === 'two-sample') {
        const parsed = parseIndependentColumns(rows);
        if (parsed.errors.length > 0) return { error: parsed.errors[0] };
        if (parsed.group1.length < 2 || parsed.group2.length < 2) return { error: null };
        return { error: null, t: twoSampleTTest(parsed.group1, parsed.group2) };
      }
      if (testType === 'paired') {
        const parsed = parsePairedColumns(rows);
        if (parsed.errors.length > 0) return { error: parsed.errors[0] };
        if (parsed.group1.length < 2) return { error: null };
        return { error: null, t: pairedTTest(parsed.group1, parsed.group2) };
      }
      // chi-square
      const parsed = parseGrid(rows);
      if (parsed.errors.length > 0) return { error: parsed.errors[0] };
      if (parsed.rows.length < 2) return { error: null };
      return { error: null, chi: chiSquareTestOfIndependence(parsed.rows) };
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [testType, rows, hypothesizedMean]);

  return (
    <div className="tool-page">
      <h1>Hypothesis Testing</h1>
      <p className="tool-intro">
        Compare a sample (or two) and see whether the difference you're seeing is likely real or
        just noise.
      </p>

      <div className="field-row">
        <label htmlFor="test-type-select">Test</label>
        <select id="test-type-select" value={testType} onChange={(e) => changeTestType(e.target.value as TestType)}>
          <option value="one-sample">One-sample t-test (vs. a target value)</option>
          <option value="two-sample">Two-sample t-test (two independent groups)</option>
          <option value="paired">Paired t-test (before/after, matched pairs)</option>
          <option value="chi-square">Chi-square test of independence (a table of counts)</option>
        </select>
      </div>

      {testType === 'one-sample' && (
        <div className="field-row">
          <label htmlFor="hyp-mean">Hypothesized (target) value</label>
          <input id="hyp-mean" type="text" inputMode="decimal" value={hypothesizedMean} onChange={(e) => setHypothesizedMean(e.target.value)} />
        </div>
      )}

      <DataGrid
        rows={rows}
        onChange={setRows}
        columnLabels={
          testType === 'one-sample'
            ? ['Value']
            : testType === 'two-sample'
              ? ['Group 1', 'Group 2']
              : testType === 'paired'
                ? ['Before', 'After']
                : undefined
        }
      />

      {analysis.error && <p className="error-banner">{analysis.error}</p>}

      {analysis.t && <TTestResultView result={analysis.t} />}
      {analysis.chi && <ChiSquareResultView result={analysis.chi} />}
    </div>
  );
}

function TTestResultView({ result }: { result: TTestResult }) {
  const significant = result.pValue < 0.05;
  return (
    <div className="results-panel">
      <p className={`interpretation ${significant ? 'warn' : 'ok'}`}>
        {significant
          ? `The difference is statistically significant (p = ${result.pValue.toFixed(4)} < 0.05) — likely a real effect, not just noise.`
          : `The difference is not statistically significant (p = ${result.pValue.toFixed(4)} ≥ 0.05) — consistent with no real difference.`}
      </p>
      <table className="stats-table">
        <thead>
          <tr>
            <th>t-statistic</th>
            <th>df</th>
            <th>p-value</th>
            <th>Mean 1</th>
            <th>Mean 2 / target</th>
            <th>Difference</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{result.statistic.toFixed(4)}</td>
            <td>{result.df.toFixed(2)}</td>
            <td>{result.pValue.toFixed(4)}</td>
            <td>{result.mean1.toFixed(4)}</td>
            <td>{result.mean2.toFixed(4)}</td>
            <td>{result.meanDifference.toFixed(4)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function ChiSquareResultView({ result }: { result: ChiSquareResult }) {
  const significant = result.pValue < 0.05;
  return (
    <div className="results-panel">
      <p className={`interpretation ${significant ? 'warn' : 'ok'}`}>
        {significant
          ? `The rows and columns are not independent (p = ${result.pValue.toFixed(4)} < 0.05) — there's a real association.`
          : `No significant association found (p = ${result.pValue.toFixed(4)} ≥ 0.05).`}
      </p>
      {result.lowExpectedCountWarning && (
        <p className="warning-banner">
          One or more expected cell counts are below 5 — the chi-square approximation may be
          unreliable for this table. Consider combining categories or collecting more data.
        </p>
      )}
      <table className="stats-table">
        <thead>
          <tr>
            <th>Chi-square</th>
            <th>df</th>
            <th>p-value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{result.statistic.toFixed(4)}</td>
            <td>{result.df}</td>
            <td>{result.pValue.toFixed(4)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
