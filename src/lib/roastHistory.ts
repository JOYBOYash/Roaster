import { RoastResult } from '../types/roast';

const HISTORY_KEY = 'roastie.roast-history.v1';
export const MAX_ROAST_HISTORY = 10;

export interface RoastHistoryEntry {
  id: string;
  savedAt: string;
  styleId: string;
  result: RoastResult;
}

function isHistoryEntry(value: unknown): value is RoastHistoryEntry {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<RoastHistoryEntry>;
  const result = candidate.result as RoastResult | undefined;

  return typeof candidate.id === 'string'
    && typeof candidate.savedAt === 'string'
    && typeof candidate.styleId === 'string'
    && Boolean(result && typeof result === 'object')
    && typeof result?.domain === 'string'
    && typeof result?.headline === 'string'
    && typeof result?.roast === 'string';
}

export function readRoastHistory(): RoastHistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isHistoryEntry).slice(0, MAX_ROAST_HISTORY);
  } catch {
    return [];
  }
}

export function saveRoastToHistory(
  result: RoastResult,
  styleId: string
): RoastHistoryEntry[] {
  const entries = readRoastHistory();
  const entry: RoastHistoryEntry = {
    id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `roast-${Date.now()}`,
    savedAt: new Date().toISOString(),
    styleId,
    result,
  };
  const updated = [entry, ...entries].slice(0, MAX_ROAST_HISTORY);

  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // The current roast should still work when storage is full or disabled.
  }
  return updated;
}

export function exportRoastHistory(entries: RoastHistoryEntry[]): void {
  if (!entries.length) return;

  const exportPayload = {
    product: 'Roastie',
    exportedAt: new Date().toISOString(),
    storage: 'This export was generated from this browser device only.',
    roasts: entries.map((entry) => ({
      savedAt: entry.savedAt,
      styleId: entry.styleId,
      inputMethod: entry.result.inputMethod,
      sourceLabel: entry.result.sourceLabel || entry.result.domain,
      sourceItems: entry.result.sourceItems || [],
      headline: entry.result.headline,
      roast: entry.result.roast,
    })),
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `roastie-history-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function clearRoastHistory(): void {
  try {
    window.localStorage.removeItem(HISTORY_KEY);
  } catch {
    // Ignore browser storage restrictions.
  }
}
