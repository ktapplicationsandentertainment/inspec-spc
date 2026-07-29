import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataGrid } from '../components/DataGrid';
import { CapabilityGauge } from '../components/CapabilityGauge';
import { parseGrid } from '../lib/parseGrid';
import { calculateCapabilityFromRawData, calculateCapabilityFromSummary } from '../lib/capability/capability';
import { analyzeShape } from '../lib/capability/skewnessKurtosis';
import { takeHandoffRows } from '../lib/dataHandoff';
import type { CapabilityIndexSet, CapabilityResult } from '../lib/capability/types';

type InputMode = 'raw' | 'summary';

const SAMPLE_DATA: string[][] = [
  '49.6', '47.6', '49.9', '51.3', '47.8', '51.2', '52.6', '52.4', '53.6', '52.1',
].map((v) => [v]);

export function CapabilityPage() {
  const [mode, setMode] = useState<InputMode>('raw');
  const [rows, setRows] = useState<string[][]>(() => takeHandoffRows() ?? SAMPLE_DATA);
  const [summaryMean, setSummaryMean] = useState('50.81');
  const [summarySigma, setSummarySigma] = useState('2.0');
  const [sigmaBasis, setSigmaBasis] = useState<'within' | 'overall'>('within');
  const [usl, setUsl] = useState('58');
  const [lsl, setLsl] = useState('42');
  const [stabilityAcknowledged, setStabilityAcknowledged] = useState(false);
  const [threshold, setThreshold] = useState(1.33);

  const parsedLimits = useMemo(() => {
    const u = usl.trim() === '' ? null : Number(usl);
    const l = lsl.trim() === '' ? null : Number(lsl);
    return {
      usl: u != null && !Number.isNaN(u) ? u : null,
      lsl: l != null && !Number.isNaN(l) ? l : null,
    };
  }, [usl, lsl]);

  const rawValues = useMemo(() => {
    if (mode !== 'raw') return [];
    return parseGrid(rows).rows.flat();
  }, [mode, rows]);

  const shape = useMemo(() => (rawValues.length >= 5 ? analyzeShape(rawValues) : null), [rawValues]);

  const analysis = useMemo((): { error: string | null; result: CapabilityResult | null } => {
    try {
      if (mode === 'raw') {
        if (rawValues.length < 2) return { error: null, result: null };
        return { error: null, result: calculateCapabilityFromRawData(rawValues, parsedLimits) };
      } else {
        const m = Number(summaryMean);
        const s = Number(summarySigma);
        if (Number.isNaN(m) || Number.isNaN(s)) return { error: null, result: null };
        return { error: null, result: calculateCapabilityFromSummary(m, s, sigmaBasis, parsedLimits) };
      }
    } catch (e) {
      return { error: (e as Error).message, result: null };
    }
  }, [mode, rawValues, parsedLimits, summaryMean, summarySigma, sigmaBasis]);

  const primary = analysis.result ? (analysis.result.overall ?? analysis.result.within) : null;

  return (
    <div className="tool-page">
      <h1>Process Capability Calculator</h1>
      <p className="tool-intro">
        Find out whether your process can reliably meet spec. Enter summary stats for a quick
        check, or paste raw measurements for a fuller picture (Cp/Cpk from short-term variation
        plus Pp/Ppk from the process's actual long-term spread).
      </p>

      <div className="field-row">
        <label htmlFor="mode-select">Input mode</label>
        <select id="mode-select" value={mode} onChange={(e) => setMode(e.target.value as InputMode)}>
          <option value="raw">Raw data</option>
          <option value="summary">Summary stats</option>
        </select>
      </div>

      {mode === 'raw' ? (
        <DataGrid rows={rows} onChange={setRows} />
      ) : (
        <div className="summary-inputs">
          <label>
            Mean
            <input type="text" inputMode="decimal" value={summaryMean} onChange={(e) => setSummaryMean(e.target.value)} />
          </label>
          <label>
            Standard deviation
            <input type="text" inputMode="decimal" value={summarySigma} onChange={(e) => setSummarySigma(e.target.value)} />
          </label>
          <label>
            This sigma is:
            <select value={sigmaBasis} onChange={(e) => setSigmaBasis(e.target.value as 'within' | 'overall')}>
              <option value="within">Within-subgroup / short-term (gives Cp, Cpk)</option>
              <option value="overall">Overall / long-term, e.g. plain sample std. dev. (gives Pp, Ppk)</option>
            </select>
          </label>
        </div>
      )}

      <div className="spec-limit-inputs">
        <label>
          USL (upper spec limit)
          <input type="text" inputMode="decimal" value={usl} onChange={(e) => setUsl(e.target.value)} placeholder="(none)" />
        </label>
        <label>
          LSL (lower spec limit)
          <input type="text" inputMode="decimal" value={lsl} onChange={(e) => setLsl(e.target.value)} placeholder="(none)" />
        </label>
      </div>

      <label className="stability-check">
        <input
          type="checkbox"
          checked={stabilityAcknowledged}
          onChange={(e) => setStabilityAcknowledged(e.target.checked)}
        />
        I've verified this process is stable (e.g. with a control chart)
      </label>
      {!stabilityAcknowledged && (
        <p className="warning-banner">
          Capability numbers only mean something for a process that's in statistical control. If
          you haven't checked, run your data through the{' '}
          <Link to="/control-chart">Control Chart Generator</Link> first.
        </p>
      )}

      {shape?.likelyNonNormal && (
        <p className="warning-banner">
          This data looks skewed or heavy/light-tailed (skewness {shape.skewness.toFixed(2)}, excess
          kurtosis {shape.excessKurtosis.toFixed(2)}). Standard Cp/Cpk assumes a roughly normal
          distribution — treat these numbers with caution for skewed or bounded data.
        </p>
      )}

      {analysis.error && <p className="error-banner">{analysis.error}</p>}

      {analysis.result && primary && (
        <div className="capability-results">
          <div className="field-row">
            <label htmlFor="threshold-input">Minimum acceptable Cpk/Ppk for your industry</label>
            <input
              id="threshold-input"
              type="number"
              step={0.01}
              min={0}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value) || 1.33)}
            />
          </div>
          <p className="tool-intro">
            Common reference points: 1.0 is a loose general minimum, 1.33 is the typical AIAG
            automotive standard, 1.67 is often required for safety-critical characteristics. Pick
            what your customer or industry requires.
          </p>

          <CapabilityGauge value={primary.cpk} threshold={threshold} />
          <Interpretation indexSet={primary} threshold={threshold} />

          {analysis.result.within && <IndexTable title="Cp / Cpk (within-subgroup, short-term)" indexSet={analysis.result.within} />}
          {analysis.result.overall && <IndexTable title="Pp / Ppk (overall, long-term)" indexSet={analysis.result.overall} />}
        </div>
      )}
    </div>
  );
}

function Interpretation({ indexSet, threshold }: { indexSet: CapabilityIndexSet; threshold: number }) {
  const { cpk, cpu, cpl } = indexSet;
  let verdict: string;
  if (cpk >= threshold) {
    verdict = `Your process meets the ${threshold.toFixed(2)} capability threshold you set.`;
  } else if (cpk >= 1.0) {
    verdict = `Your process is marginal — it's within spec but has little margin for drift, and doesn't meet the ${threshold.toFixed(2)} threshold you set.`;
  } else {
    verdict = 'Your process is not capable — expect a meaningful defect rate at current performance.';
  }

  let sideNote = '';
  if (cpu != null && cpl != null) {
    if (cpu < cpl) sideNote = ' It is limited more by how close it runs to the upper spec limit.';
    else if (cpl < cpu) sideNote = ' It is limited more by how close it runs to the lower spec limit.';
    else sideNote = ' It is equally centered between both spec limits.';
  }

  return <p className={`interpretation ${cpk >= threshold ? 'ok' : 'warn'}`}>{verdict}{sideNote}</p>;
}

function IndexTable({ title, indexSet }: { title: string; indexSet: CapabilityIndexSet }) {
  const fmt = (v: number | null) => (v == null ? '—' : v.toFixed(3));
  const p = indexSet.basis === 'within' ? 'C' : 'P';
  return (
    <div className="results-panel">
      <h3>{title}</h3>
      <table className="stats-table">
        <thead>
          <tr>
            <th>{p}p</th>
            <th>{p}pu</th>
            <th>{p}pl</th>
            <th>{p}pk</th>
            <th>PPM (total)</th>
            <th>Approx. sigma level</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{fmt(indexSet.cp)}</td>
            <td>{fmt(indexSet.cpu)}</td>
            <td>{fmt(indexSet.cpl)}</td>
            <td>{fmt(indexSet.cpk)}</td>
            <td>{indexSet.ppmTotal.toFixed(1)}</td>
            <td>{indexSet.sigmaLevel.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
