export interface RoastResult {
  domain: string;
  score: number;
  verdict: string;
  roast: string;
  punchline: string;
  reportId: string;
  createdAt: string;
  inputMethod: 'url' | 'pasted';
  pastedTextSnippet?: string;
  wordCount?: number;
}

export type PosterTheme = 'certified-cooked' | 'crime-scene' | 'cold-verdict';

export interface TrendingRoast {
  domain: string;
  score: number;
  verdict: string;
  roast: string;
  punchline: string;
  reportId: string;
  roastCount: number;
  category?: string;
  createdAt: string;
  inputMethod: 'url' | 'pasted';
}

export interface RoastResponse {
  success: boolean;
  data?: RoastResult;
  error?: string;
  canPasteFallback?: boolean;
}

export interface BattleSiteInfo {
  domain: string;
  score: number;
  verdict: string;
  title?: string;
}

export interface BattleResult {
  id: string;
  siteA: BattleSiteInfo;
  siteB: BattleSiteInfo;
  loserDomain: string; // The worse website
  winnerDomain: string; // The slightly better website
  comparativeRoast: string;
  punchline: string;
  createdAt: string;
}

export interface BattleResponse {
  success: boolean;
  data?: BattleResult;
  error?: string;
}

export interface HistoryItem {
  id: string;
  type: 'single' | 'battle';
  timestamp: number;
  single?: RoastResult;
  battle?: BattleResult;
}
