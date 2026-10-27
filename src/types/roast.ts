export interface RoastResult {
  domain: string;
  headline: string;
  roast: string;
  inputMethod: 'url' | 'pasted';
}

export type PosterTheme = 'certified-cooked' | 'crime-scene' | 'cold-verdict';

export interface RoastResponse {
  success: boolean;
  data?: RoastResult;
  error?: string;
  canPasteFallback?: boolean;
}
