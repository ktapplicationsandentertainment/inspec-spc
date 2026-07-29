const HANDOFF_KEY = 'inspecspc:handoff-rows';

/** Stash grid data in sessionStorage so another tool page can pick it up next navigation. */
export function setHandoffRows(rows: string[][]): void {
  sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(rows));
}

/** Reads and clears any pending handoff data. Returns null if none is waiting. */
export function takeHandoffRows(): string[][] | null {
  const raw = sessionStorage.getItem(HANDOFF_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(HANDOFF_KEY);
  try {
    return JSON.parse(raw) as string[][];
  } catch {
    return null;
  }
}
