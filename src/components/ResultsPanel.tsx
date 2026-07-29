import type { ControlChartResult } from '../lib/spc/types';
import { RULE_DESCRIPTIONS } from '../lib/spc/types';
import './ResultsPanel.css';

export function ResultsPanel({ result }: { result: ControlChartResult }) {
  const flaggedLabels = result.primary.points
    .filter((p) => p.violations.length > 0)
    .map((p) => p.label);

  return (
    <div className="results-panel">
      <p className={`interpretation ${result.inControl ? 'ok' : 'warn'}`}>
        {result.inControl
          ? 'Your process appears stable — no out-of-control signals were detected.'
          : `${flaggedLabels.length} point(s) indicate the process may be out of control — investigate: ${flaggedLabels.join(', ')}.`}
      </p>

      <table className="stats-table">
        <thead>
          <tr>
            <th />
            <th>Center line</th>
            <th>UCL</th>
            <th>LCL</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{result.primary.title}</td>
            <td>{result.primary.centerLine.toFixed(4)}</td>
            <td>{result.primary.ucl.toFixed(4)}</td>
            <td>{result.primary.lcl.toFixed(4)}</td>
          </tr>
          <tr>
            <td>{result.secondary.title}</td>
            <td>{result.secondary.centerLine.toFixed(4)}</td>
            <td>{result.secondary.ucl.toFixed(4)}</td>
            <td>{result.secondary.lcl.toFixed(4)}</td>
          </tr>
        </tbody>
      </table>

      {flaggedLabels.length > 0 && (
        <>
          <h3>Rule violations</h3>
          <table className="violations-table">
            <thead>
              <tr>
                <th>Point</th>
                <th>Value</th>
                <th>Rule(s) triggered</th>
              </tr>
            </thead>
            <tbody>
              {result.primary.points
                .filter((p) => p.violations.length > 0)
                .map((p) => (
                  <tr key={p.index}>
                    <td>{p.label}</td>
                    <td>{p.value.toFixed(4)}</td>
                    <td>{p.violations.map((r) => RULE_DESCRIPTIONS[r]).join(' ')}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
