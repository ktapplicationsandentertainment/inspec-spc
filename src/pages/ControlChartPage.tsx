import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '../components/DataGrid';
import { ControlChartView } from '../components/ControlChartView';
import { ResultsPanel } from '../components/ResultsPanel';
import { parseGrid } from '../lib/parseGrid';
import { calculateIMR } from '../lib/spc/imr';
import { calculateXbarR } from '../lib/spc/xbarR';
import { MAX_XBAR_R_SUBGROUP_SIZE, MIN_XBAR_R_SUBGROUP_SIZE } from '../lib/spc/constants';
import { setHandoffRows } from '../lib/dataHandoff';
import type { ControlChartResult } from '../lib/spc/types';

type ChartTypeChoice = 'auto' | 'individuals' | 'subgrouped';

const SAMPLE_INDIVIDUALS: string[][] = [
  '49.6', '47.6', '49.9', '51.3', '47.8', '51.2', '52.6', '52.4', '53.6', '52.1',
].map((v) => [v]);

export function ControlChartPage({ initialMode = 'auto' }: { initialMode?: ChartTypeChoice }) {
  const navigate = useNavigate();
  const [rows, setRows] = useState<string[][]>(SAMPLE_INDIVIDUALS);
  const [chartTypeChoice, setChartTypeChoice] = useState<ChartTypeChoice>(initialMode);

  function sendToCapability() {
    setHandoffRows(rows);
    navigate('/capability');
  }

  const analysis = useMemo(() => {
    const parsed = parseGrid(rows);
    if (parsed.errors.length > 0) {
      return { error: parsed.errors[0], result: null as ControlChartResult | null };
    }
    if (parsed.rows.length === 0) {
      return { error: null, result: null };
    }

    const effectiveType: 'individuals' | 'subgrouped' =
      chartTypeChoice === 'auto' ? (parsed.maxColumns <= 1 ? 'individuals' : 'subgrouped') : chartTypeChoice;

    try {
      if (effectiveType === 'individuals') {
        const values = parsed.rows.map((r) => r[0]);
        return { error: null, result: calculateIMR(values) };
      } else {
        if (parsed.maxColumns < MIN_XBAR_R_SUBGROUP_SIZE || parsed.maxColumns > MAX_XBAR_R_SUBGROUP_SIZE) {
          return {
            error: `Subgrouped (X̄-R) charts need 2-${MAX_XBAR_R_SUBGROUP_SIZE} measurements per row. This data has up to ${parsed.maxColumns}.`,
            result: null,
          };
        }
        return { error: null, result: calculateXbarR(parsed.rows) };
      }
    } catch (e) {
      return { error: (e as Error).message, result: null };
    }
  }, [rows, chartTypeChoice]);

  return (
    <div className="tool-page">
      <h1>Control Chart Generator</h1>
      <p className="tool-intro">
        Paste your measurements below (straight from Excel works fine). One column of individual
        readings makes an Individuals (I-MR) chart; multiple columns per row makes an X̄-R chart,
        one subgroup per row.
      </p>

      <div className="field-row">
        <label htmlFor="chart-type-select">Chart type</label>
        <select
          id="chart-type-select"
          value={chartTypeChoice}
          onChange={(e) => setChartTypeChoice(e.target.value as ChartTypeChoice)}
        >
          <option value="auto">Auto-detect</option>
          <option value="individuals">Individuals (I-MR)</option>
          <option value="subgrouped">Subgrouped (X̄-R)</option>
        </select>
      </div>

      <DataGrid rows={rows} onChange={setRows} />

      {analysis.error && <p className="error-banner">{analysis.error}</p>}

      {analysis.result && (
        <>
          <ControlChartView series={analysis.result.primary} />
          <ControlChartView series={analysis.result.secondary} />
          <ResultsPanel result={analysis.result} />
          <button type="button" onClick={sendToCapability} className="handoff-cta">
            Use this data in the Process Capability Calculator →
          </button>
        </>
      )}
    </div>
  );
}
