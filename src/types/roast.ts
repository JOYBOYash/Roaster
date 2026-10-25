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
}

export type PosterTheme = 'certified-cooked' | 'crime-scene' | 'cold-verdict';

export interface RoastResponse {
  success: boolean;
  data?: RoastResult;
  error?: string;
  canPasteFallback?: boolean;
}
