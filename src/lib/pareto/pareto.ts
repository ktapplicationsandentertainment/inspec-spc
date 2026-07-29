export interface ParetoEntry {
  label: string;
  value: number;
}

export interface ParetoCategory extends ParetoEntry {
  percentOfTotal: number;
  cumulativePercent: number;
  /** True for the leading categories that together first reach the vital-few threshold. */
  isVitalFew: boolean;
}

export interface ParetoResult {
  categories: ParetoCategory[];
  total: number;
  vitalFewCount: number;
}

/**
 * Classic Pareto analysis: aggregate duplicate category labels, sort
 * descending by value, and flag the leading "vital few" categories that
 * together account for at least `vitalFewThreshold` percent of the total
 * (80 by default, the traditional 80/20 rule).
 */
export function calculateParetoAnalysis(entries: ParetoEntry[], vitalFewThreshold = 80): ParetoResult {
  if (entries.length === 0) {
    throw new Error('Enter at least one category and value.');
  }

  const totals = new Map<string, number>();
  for (const e of entries) {
    totals.set(e.label, (totals.get(e.label) ?? 0) + e.value);
  }

  const sorted = [...totals.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const total = sorted.reduce((sum, c) => sum + c.value, 0);

  let running = 0;
  let crossed = false;
  let vitalFewCount = 0;

  const categories: ParetoCategory[] = sorted.map((c) => {
    running += c.value;
    const cumulativePercent = (running / total) * 100;
    const isVitalFew = !crossed;
    if (!crossed) {
      vitalFewCount += 1;
      if (cumulativePercent >= vitalFewThreshold) crossed = true;
    }
    return {
      ...c,
      percentOfTotal: (c.value / total) * 100,
      cumulativePercent,
      isVitalFew,
    };
  });

  return { categories, total, vitalFewCount };
}
