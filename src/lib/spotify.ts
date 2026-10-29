export type SpotifyMusicSource = 'top' | 'saved';

export interface SpotifyAuthorizationResult {
  source: SpotifyMusicSource;
  roastStyleId: string;
}

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

interface SpotifyTrack {
  name?: string;
  artists?: Array<{ name?: string }>;
}

interface SpotifySavedTrack {
  track?: SpotifyTrack | null;
}

interface SpotifyItemsResponse {
  items?: Array<SpotifyTrack | SpotifySavedTrack | null>;
  error?: { status?: number; message?: string };
}

interface SpotifySession {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scopes: string[];
}

const STORAGE_KEYS = {
  verifier: 'roastie.spotify.pkce_verifier',
  state: 'roastie.spotify.oauth_state',
  source: 'roastie.spotify.source',
  style: 'roastie.spotify.roast_style',
} as const;

let spotifySession: SpotifySession | null = null;

function getClientId(): string {
  return (import.meta.env.VITE_SPOTIFY_CLIENT_ID || '').trim();
}

function getRedirectUri(): string {
  return (import.meta.env.VITE_SPOTIFY_REDIRECT_URI || `${window.location.origin}/`).trim();
}

function randomUrlSafeString(byteLength = 64): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function createCodeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  let binary = '';
  new Uint8Array(digest).forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function requiredScope(source: SpotifyMusicSource): string {
  return source === 'top' ? 'user-top-read' : 'user-library-read';
}

function parseScopes(scope: string | undefined): string[] {
  return (scope || '').split(/\s+/).filter(Boolean);
}

function clearOAuthTransaction(): void {
  Object.values(STORAGE_KEYS).forEach((key) => sessionStorage.removeItem(key));
}

function cleanOAuthQueryFromUrl(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('code');
  url.searchParams.delete('state');
  url.searchParams.delete('error');
  url.searchParams.delete('error_description');
  const remaining = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState({}, document.title, remaining);
}

function friendlySpotifyError(status: number, message?: string): Error {
  if (status === 401) return new Error('Spotify authorization expired. Connect Spotify again to continue.');
  if (status === 403) return new Error('Spotify denied this request. Check the requested permission and your app access in Spotify for Developers.');
  if (status === 429) return new Error('Spotify is rate-limiting requests. Wait a moment and try again.');
  return new Error(message || `Spotify request failed (HTTP ${status}).`);
}

/**
 * Uses Spotify Authorization Code with PKCE. The client ID is public, no client
 * secret is used, and the code verifier is temporary sessionStorage state only.
 */
export async function beginSpotifyAuthorization(
  source: SpotifyMusicSource,
  roastStyleId: string
): Promise<void> {
  const clientId = getClientId();
  if (!clientId) {
    throw new Error('Spotify is not configured yet. Add VITE_SPOTIFY_CLIENT_ID to the hosting environment and register this site’s exact redirect URL in Spotify for Developers.');
  }

  const verifier = randomUrlSafeString(64);
  const state = randomUrlSafeString(32);
  const challenge = await createCodeChallenge(verifier);

  sessionStorage.setItem(STORAGE_KEYS.verifier, verifier);
  sessionStorage.setItem(STORAGE_KEYS.state, state);
  sessionStorage.setItem(STORAGE_KEYS.source, source);
  sessionStorage.setItem(STORAGE_KEYS.style, roastStyleId);

  const url = new URL('https://accounts.spotify.com/authorize');
  url.search = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: getRedirectUri(),
    scope: requiredScope(source),
    code_challenge_method: 'S256',
    code_challenge: challenge,
    state,
  }).toString();

  window.location.assign(url.toString());
}

export function hasSpotifyScope(source: SpotifyMusicSource): boolean {
  return Boolean(spotifySession?.scopes.includes(requiredScope(source)));
}

export function hasSpotifySession(): boolean {
  return Boolean(spotifySession);
}

export function disconnectSpotify(): void {
  // All bearer credentials exist in JS memory only, never in localStorage.
  spotifySession = null;
}

async function exchangeAuthorizationCode(code: string, verifier: string): Promise<void> {
  const clientId = getClientId();
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: getRedirectUri(),
      code_verifier: verifier,
    }),
  });

  const payload = await response.json() as Partial<SpotifyTokenResponse> & { error?: string; error_description?: string };
  if (!response.ok || !payload.access_token || !payload.expires_in) {
    throw new Error(payload.error_description || payload.error || 'Spotify could not complete authorization.');
  }

  spotifySession = {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresAt: Date.now() + payload.expires_in * 1000,
    scopes: parseScopes(payload.scope),
  };
}

/** Called once on app start. It consumes and scrubs OAuth parameters immediately. */
export async function completeSpotifyCallback(): Promise<SpotifyAuthorizationResult | null> {
  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');
  const providerError = url.searchParams.get('error');
  if (!code && !providerError) return null;

  const returnedState = url.searchParams.get('state');
  const savedState = sessionStorage.getItem(STORAGE_KEYS.state);
  const verifier = sessionStorage.getItem(STORAGE_KEYS.verifier);
  const rawSource = sessionStorage.getItem(STORAGE_KEYS.source);
  const roastStyleId = sessionStorage.getItem(STORAGE_KEYS.style) || 'roast-master';
  const source: SpotifyMusicSource = rawSource === 'saved' ? 'saved' : 'top';

  cleanOAuthQueryFromUrl();
  clearOAuthTransaction();

  if (providerError) {
    throw new Error(providerError === 'access_denied' ? 'Spotify connection was cancelled.' : 'Spotify authorization was not completed.');
  }

  if (!code || !returnedState || !savedState || returnedState !== savedState || !verifier || !rawSource) {
    throw new Error('Spotify authorization could not be verified. Please connect again.');
  }

  await exchangeAuthorizationCode(code, verifier);
  if (!hasSpotifyScope(source)) {
    disconnectSpotify();
    throw new Error('Spotify did not grant the permission required for this selection. Please connect again and approve the requested access.');
  }

  return { source, roastStyleId };
}

async function refreshAccessToken(): Promise<void> {
  if (!spotifySession?.refreshToken) {
    disconnectSpotify();
    throw new Error('Spotify authorization expired. Connect Spotify again to continue.');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: spotifySession.refreshToken,
      client_id: getClientId(),
    }),
  });

  const payload = await response.json() as Partial<SpotifyTokenResponse> & { error?: string; error_description?: string };
  if (!response.ok || !payload.access_token || !payload.expires_in) {
    disconnectSpotify();
    throw new Error(payload.error === 'invalid_grant'
      ? 'Your Spotify session expired. Connect Spotify again.'
      : (payload.error_description || 'Could not refresh Spotify authorization. Connect again.'));
  }

  spotifySession = {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token || spotifySession.refreshToken,
    expiresAt: Date.now() + payload.expires_in * 1000,
    scopes: payload.scope ? parseScopes(payload.scope) : spotifySession.scopes,
  };
}

async function validAccessToken(source: SpotifyMusicSource): Promise<string> {
  if (!spotifySession || !hasSpotifyScope(source)) {
    throw new Error('Connect Spotify for the selected music source first.');
  }

  if (spotifySession.expiresAt <= Date.now() + 30_000) {
    await refreshAccessToken();
  }

  if (!spotifySession?.accessToken || !hasSpotifyScope(source)) {
    throw new Error('Spotify authorization expired or missing the required permission. Connect Spotify again.');
  }

  return spotifySession.accessToken;
}

export async function fetchSpotifyMusic(source: SpotifyMusicSource): Promise<string[]> {
  const accessToken = await validAccessToken(source);
  const endpoint = source === 'top'
    ? 'https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=5'
    : 'https://api.spotify.com/v1/me/tracks?limit=5&offset=0';

  const response = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    let message = '';
    try {
      const payload = await response.json() as { error?: { message?: string } };
      message = payload.error?.message || '';
    } catch {
      // Use the status-based message if Spotify did not return JSON.
    }
    if (response.status === 401) {
      disconnectSpotify();
    }
    throw friendlySpotifyError(response.status, message);
  }

  const payload = await response.json() as SpotifyItemsResponse;
  const items = (payload.items || []).map((item) => {
    if (!item) return null;
    const candidate = 'track' in item ? item.track : item;
    if (!candidate || !candidate.name) return null;
    const artists = (candidate.artists || []).map((artist) => artist.name).filter(Boolean).join(', ');
    return artists ? `${candidate.name} by ${artists}` : candidate.name;
  }).filter((item): item is string => Boolean(item));

  if (items.length === 0) {
    throw new Error(source === 'top'
      ? 'Spotify did not return any top tracks for this account. Try the saved tracks option.'
      : 'No saved tracks were returned by Spotify for this account.');
  }

  return items.slice(0, 5);
}
