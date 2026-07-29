import { useMemo, useState } from 'react';
import {
  confidenceIntervalForMean,
  confidenceIntervalForProportion,
  sampleSizeForMean,
  sampleSizeForProportion,
} from '../lib/sampleSize/sampleSize';
import { useDocumentMeta } from '../lib/useDocumentMeta';

type Goal = 'sample-size' | 'confidence-interval';
type DataType = 'proportion' | 'mean';

export function SampleSizePage() {
  useDocumentMeta(
    'Sample Size & Confidence Interval Calculator',
    'Calculate the sample size you need for a proportion or mean, or compute a confidence interval from your data. Free, no signup.',
    '/sample-size',
  );

  const [goal, setGoal] = useState<Goal>('sample-size');
  const [dataType, setDataType] = useState<DataType>('proportion');
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);

  // Sample size inputs
  const [marginOfError, setMarginOfError] = useState('5');
  const [estimatedProportion, setEstimatedProportion] = useState('50');
  const [estimatedStdDev, setEstimatedStdDev] = useState('10');
  const [populationSize, setPopulationSize] = useState('');

  // Confidence interval inputs
  const [successes, setSuccesses] = useState('50');
  const [ciSampleSize, setCiSampleSize] = useState('200');
  const [sampleMean, setSampleMean] = useState('100');
  const [sampleStdDev, setSampleStdDev] = useState('15');
  const [meanSampleSize, setMeanSampleSize] = useState('25');

  const result = useMemo(() => {
    try {
      if (goal === 'sample-size') {
        const moe = Number(marginOfError) / 100;
        const pop = populationSize.trim() === '' ? undefined : Number(populationSize);
        if (dataType === 'proportion') {
          const p = Number(estimatedProportion) / 100;
          return { error: null, n: sampleSizeForProportion(confidenceLevel, moe, p, pop) };
        }
        const sigma = Number(estimatedStdDev);
        const marginAbs = Number(marginOfError);
        return { error: null, n: sampleSizeForMean(confidenceLevel, marginAbs, sigma, pop) };
      } else {
        if (dataType === 'proportion') {
          const ci = confidenceIntervalForProportion(Number(successes), Number(ciSampleSize), confidenceLevel);
          return { error: null, ci };
        }
        const ci = confidenceIntervalForMean(Number(sampleMean), Number(sampleStdDev), Number(meanSampleSize), confidenceLevel);
        return { error: null, ci };
      }
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [
    goal,
    dataType,
    confidenceLevel,
    marginOfError,
    estimatedProportion,
    estimatedStdDev,
    populationSize,
    successes,
    ciSampleSize,
    sampleMean,
    sampleStdDev,
    meanSampleSize,
  ]);

  return (
    <div className="tool-page">
      <h1>Sample Size / Confidence Interval Calculator</h1>
      <p className="tool-intro">
        Figure out how many samples you need before you collect data, or how much confidence to
        put in the data you already have.
      </p>

      <div className="field-row">
        <label htmlFor="goal-select">I want to</label>
        <select id="goal-select" value={goal} onChange={(e) => setGoal(e.target.value as Goal)}>
          <option value="sample-size">Find the sample size I need</option>
          <option value="confidence-interval">Compute a confidence interval from my data</option>
        </select>
      </div>

      <div className="field-row">
        <label htmlFor="data-type-select">Data type</label>
        <select id="data-type-select" value={dataType} onChange={(e) => setDataType(e.target.value as DataType)}>
          <option value="proportion">Proportion (%, pass/fail, yes/no)</option>
          <option value="mean">Mean (a measured value)</option>
        </select>

        <label htmlFor="confidence-select">Confidence level</label>
        <select id="confidence-select" value={confidenceLevel} onChange={(e) => setConfidenceLevel(Number(e.target.value))}>
          <option value={0.9}>90%</option>
          <option value={0.95}>95%</option>
          <option value={0.99}>99%</option>
        </select>
      </div>

      {goal === 'sample-size' ? (
        <div className="summary-inputs">
          <label>
            Margin of error {dataType === 'proportion' ? '(percentage points)' : '(same units as your data)'}
            <input type="text" inputMode="decimal" value={marginOfError} onChange={(e) => setMarginOfError(e.target.value)} />
          </label>
          {dataType === 'proportion' ? (
            <label>
              Estimated proportion (%, use 50 if unknown)
              <input type="text" inputMode="decimal" value={estimatedProportion} onChange={(e) => setEstimatedProportion(e.target.value)} />
            </label>
          ) : (
            <label>
              Estimated standard deviation
              <input type="text" inputMode="decimal" value={estimatedStdDev} onChange={(e) => setEstimatedStdDev(e.target.value)} />
            </label>
          )}
          <label>
            Population size (optional, for a small/finite population)
            <input type="text" inputMode="decimal" value={populationSize} onChange={(e) => setPopulationSize(e.target.value)} placeholder="(unlimited)" />
          </label>
        </div>
      ) : dataType === 'proportion' ? (
        <div className="summary-inputs">
          <label>
            Successes
            <input type="text" inputMode="decimal" value={successes} onChange={(e) => setSuccesses(e.target.value)} />
          </label>
          <label>
            Sample size
            <input type="text" inputMode="decimal" value={ciSampleSize} onChange={(e) => setCiSampleSize(e.target.value)} />
          </label>
        </div>
      ) : (
        <div className="summary-inputs">
          <label>
            Sample mean
            <input type="text" inputMode="decimal" value={sampleMean} onChange={(e) => setSampleMean(e.target.value)} />
          </label>
          <label>
            Sample standard deviation
            <input type="text" inputMode="decimal" value={sampleStdDev} onChange={(e) => setSampleStdDev(e.target.value)} />
          </label>
          <label>
            Sample size
            <input type="text" inputMode="decimal" value={meanSampleSize} onChange={(e) => setMeanSampleSize(e.target.value)} />
          </label>
        </div>
      )}

      {result?.error && <p className="error-banner">{result.error}</p>}

      {result && !result.error && 'n' in result && (
        <p className="interpretation ok">
          You need at least <strong>{result.n}</strong> samples for a {(confidenceLevel * 100).toFixed(0)}% confidence
          level at your stated margin of error.
        </p>
      )}

      {result && !result.error && 'ci' in result && result.ci && (
        <p className="interpretation ok">
          {dataType === 'proportion'
            ? `Estimated proportion: ${(result.ci.pointEstimate * 100).toFixed(2)}%. `
            : `Sample mean: ${result.ci.pointEstimate.toFixed(4)}. `}
          {(confidenceLevel * 100).toFixed(0)}% confidence interval:{' '}
          {dataType === 'proportion'
            ? `${(result.ci.lower * 100).toFixed(2)}% to ${(result.ci.upper * 100).toFixed(2)}%`
            : `${result.ci.lower.toFixed(4)} to ${result.ci.upper.toFixed(4)}`}{' '}
          (margin of error {dataType === 'proportion' ? `${(result.ci.marginOfError * 100).toFixed(2)}%` : result.ci.marginOfError.toFixed(4)}).
        </p>
      )}
    </div>
  );
}
