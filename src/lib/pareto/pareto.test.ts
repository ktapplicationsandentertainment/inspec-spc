import { describe, expect, it } from 'vitest';
import { calculateParetoAnalysis } from './pareto';

describe('calculateParetoAnalysis', () => {
  const classicDefectData = [
    { label: 'Scratches', value: 50 },
    { label: 'Dents', value: 30 },
    { label: 'Discoloration', value: 12 },
    { label: 'Missing parts', value: 5 },
    { label: 'Other', value: 3 },
  ];

  it('sorts descending and computes cumulative percentages', () => {
    const result = calculateParetoAnalysis(classicDefectData);
    expect(result.total).toBe(100);
    expect(result.categories.map((c) => c.label)).toEqual([
      'Scratches',
      'Dents',
      'Discoloration',
      'Missing parts',
      'Other',
    ]);
    expect(result.categories.map((c) => c.cumulativePercent)).toEqual([50, 80, 92, 97, 100]);
  });

  it('flags exactly the vital few that reach the 80% threshold', () => {
    const result = calculateParetoAnalysis(classicDefectData);
    // Scratches (50%) + Dents (cumulative 80%) together hit the threshold.
    expect(result.vitalFewCount).toBe(2);
    expect(result.categories[0].isVitalFew).toBe(true);
    expect(result.categories[1].isVitalFew).toBe(true);
    expect(result.categories[2].isVitalFew).toBe(false);
  });

  it('aggregates duplicate category labels by summing their values', () => {
    const result = calculateParetoAnalysis([
      { label: 'Scratches', value: 30 },
      { label: 'Dents', value: 30 },
      { label: 'Scratches', value: 20 },
    ]);
    expect(result.categories).toHaveLength(2);
    const scratches = result.categories.find((c) => c.label === 'Scratches')!;
    expect(scratches.value).toBe(50);
  });

  it('respects a custom vital-few threshold', () => {
    const result = calculateParetoAnalysis(classicDefectData, 95);
    // Need Scratches+Dents+Discoloration (92%) then Missing parts (97%) to reach 95%.
    expect(result.vitalFewCount).toBe(4);
  });

  it('throws on empty input', () => {
    expect(() => calculateParetoAnalysis([])).toThrow();
  });
});
