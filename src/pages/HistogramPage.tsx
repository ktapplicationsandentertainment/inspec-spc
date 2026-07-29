import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '../components/DataGrid';
import { HistogramView } from '../components/HistogramView';
import { parseGrid } from '../lib/parseGrid';
import { calculateHistogram } from '../lib/histogram/histogram';
import { setHandoffRows, takeHandoffRows } from '../lib/dataHandoff';

const SAMPLE_DATA: string[][] = [
  '49.6', '47.6', '49.9', '51.3', '47.8', '51.2', '52.6', '52.4', '53.6', '52.1',
].map((v) => [v]);

export function HistogramPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<string[][]>(() => takeHandoffRows() ?? SAMPLE_DATA);
  const [showNormalCurve, setShowNormalCurve] = useState(true);

  const values = useMemo(() => parseGrid(rows).rows.flat(), [rows]);

  const result = useMemo(() => {
    if (values.length < 2) return null;
    try {
      return calculateHistogram(values);
    } catch {
      return null;
    }
  }, [values]);

  function sendToCapability() {
    setHandoffRows(rows);
    navigate('/capability');
  }

  return (
    <div className="tool-page">
      <h1>Histogram + Normality Check</h1>
      <p className="tool-intro">
        Paste your measurements to see the shape of your data, with a normality flag based on
        skewness and kurtosis — useful on its own, and worth checking before trusting a Cpk
        number.
      </p>

      <DataGrid rows={rows} onChange={setRows} />

      <label className="stability-check">
        <input type="checkbox" checked={showNormalCurve} onChange={(e) => setShowNormalCurve(e.target.checked)} />
        Show fitted normal curve overlay
      </label>

      {result && (
        <>
          <HistogramView result={result} showNormalCurve={showNormalCurve} />

          {result.shape.likelyNonNormal ? (
            <p className="warning-banner">
              This data looks skewed or heavy/light-tailed (skewness{' '}
              {result.shape.skewness.toFixed(2)}, excess kurtosis {result.shape.excessKurtosis.toFixed(2)}
              ). Treat Cp/Cpk from this data with caution — standard capability formulas assume a
              roughly normal distribution.
            </p>
          ) : (
            <p className="interpretation ok">
              This data looks reasonably close to normal (skewness {result.shape.skewness.toFixed(2)},
              excess kurtosis {result.shape.excessKurtosis.toFixed(2)}).
            </p>
          )}

          <table className="stats-table">
            <thead>
              <tr>
                <th>n</th>
                <th>Mean</th>
                <th>Std. dev.</th>
                <th>Skewness</th>
                <th>Excess kurtosis</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{result.n}</td>
                <td>{result.mean.toFixed(4)}</td>
                <td>{result.stdDev.toFixed(4)}</td>
                <td>{result.shape.skewness.toFixed(3)}</td>
                <td>{result.shape.excessKurtosis.toFixed(3)}</td>
              </tr>
            </tbody>
          </table>

          <button type="button" onClick={sendToCapability} className="handoff-cta">
            Use this data in the Process Capability Calculator →
          </button>
        </>
      )}
    </div>
  );
}
