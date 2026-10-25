import { HistoryItem, RoastResult, BattleResult } from '../types/roast';

const STORAGE_KEY = 'roastie_history_v1';

export function loadHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load roast history from localStorage:', err);
    return [];
  }
}

export function saveRoastToHistory(roast: RoastResult): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = loadHistory();
    const newItem: HistoryItem = {
      id: roast.reportId || `RST-${Date.now()}`,
      type: 'single',
      timestamp: Date.now(),
      single: roast,
    };

    // Filter out if exact same domain and reportId is present
    const filtered = current.filter(
      item => !(item.type === 'single' && item.single?.reportId === roast.reportId)
    );

    const updated = [newItem, ...filtered].slice(0, 30);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save roast to history:', err);
    return [];
  }
}

export function saveBattleToHistory(battle: BattleResult): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = loadHistory();
    const newItem: HistoryItem = {
      id: battle.id || `BTL-${Date.now()}`,
      type: 'battle',
      timestamp: Date.now(),
      battle,
    };

    const filtered = current.filter(
      item => !(item.type === 'battle' && item.battle?.id === battle.id)
    );

    const updated = [newItem, ...filtered].slice(0, 30);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save battle to history:', err);
    return [];
  }
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = loadHistory();
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete history item:', err);
    return [];
  }
}

export function clearAllHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear roast history:', err);
  }
}
