import { useEffect, useRef, useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { RoastResults } from './components/RoastResults';
import { RoastHistory } from './components/RoastHistory';
import { DonationSupport } from './components/DonationSupport';
import { Footer } from './components/Footer';
import { RoastResult, RoastResponse } from './types/roast';
import {
  clearRoastHistory,
  exportRoastHistory,
  readRoastHistory,
  RoastHistoryEntry,
  saveRoastToHistory,
} from './lib/roastHistory';
import {
  beginSpotifyAuthorization,
  completeSpotifyCallback,
  disconnectSpotify,
  fetchSpotifyMusic,
  hasSpotifyScope,
  hasSpotifySession,
  SpotifyMusicSource,
} from './lib/spotify';

type ApiHealth = {
  ok?: boolean;
  service?: string;
  aiConfigured?: boolean;
};

type RoastSubmitInput = {
  url?: string;
  pastedText?: string;
  mode?: 'music';
  musicText?: string;
  roastStyleId?: string;
  sourceItems?: string[];
  sourceLabel?: string;
};

async function diagnoseApiFailure(status: number | null, route: string, headers?: Headers): Promise<string> {
  const statusSuffix = status === null ? '' : ` (HTTP ${status})`;
  const vercelCode = headers?.get('x-vercel-error');
  const vercelRequestId = headers?.get('x-vercel-id');
  const platformDetails = [
    vercelCode ? `Vercel: ${vercelCode}.` : '',
    vercelRequestId ? `Vercel request: ${vercelRequestId}.` : '',
  ].filter(Boolean).join(' ');

  if (status === 504) {
    return 'The request timed out before Roastie finished. No roast was generated. Check /api/health and the server logs.';
  }

  try {
    const healthResponse = await fetch('/api/health', { cache: 'no-store' });
    const contentType = healthResponse.headers.get('content-type') || '';

    if (!healthResponse.ok || !contentType.includes('application/json')) {
      return `Could not confirm that the Roastie API is running${statusSuffix}. ${platformDetails}Open /api/health on this site and check the deployment logs.`;
    }

    const health: ApiHealth = await healthResponse.json();
    if (!health.ok) {
      const checks = health.checks as Record<string, { ok?: boolean; error?: string }> | undefined;
      const failedChecks = checks
        ? Object.entries(checks)
            .filter(([, check]) => check && check.ok === false)
            .map(([name, check]) => `${name}: ${check.error || 'failed'}`)
        : [];
      const diagnostic = failedChecks.length
        ? ` Failed checks: ${failedChecks.join('; ')}.`
        : '';
      return `The Roastie API health check failed${statusSuffix}.${diagnostic} ${platformDetails}Check the deployment logs.`;
    }

    if (health.aiConfigured === false) {
      return 'The Roastie server is running, but Gemini is not configured. Set GEMINI_API_KEY in the hosting platform’s server secrets.';
    }

    if (status === null) {
      return `The API health check passed, but the ${route} request could not complete. Check the host’s proxy and server logs.`;
    }

    return `The Roastie API is reachable, but ${route} returned a non-JSON response${statusSuffix}. ${platformDetails}Check API routing and server logs.`;
  } catch {
    return `Could not reach the Roastie API${statusSuffix}. ${platformDetails}Check /api/health and confirm the API function is deployed.`;
  }
}

const pause = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState<number | 'ROAST' | null>(null);
  const [roastData, setRoastData] = useState<RoastResult | null>(null);
  const [roastHistory, setRoastHistory] = useState<RoastHistoryEntry[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [canPasteFallback, setCanPasteFallback] = useState(false);
  const [hasExported, setHasExported] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [isSpotifyFetching, setIsSpotifyFetching] = useState(false);
  const spotifyCallbackHandled = useRef(false);

  useEffect(() => {
    setRoastHistory(readRoastHistory());
  }, []);

  const handleRoastSubmit = async (input: RoastSubmitInput) => {
    setErrorMessage(null);
    setCanPasteFallback(false);

    // Brief "ready, set, roast" moment before a request is sent.
    setCountdown(3);
    await pause(550);
    setCountdown(2);
    await pause(550);
    setCountdown(1);
    await pause(550);
    setCountdown('ROAST');
    await pause(350);
    setCountdown(null);

    setIsLoading(true);
    try {
      const requestBody = {
        ...(input.url ? { url: input.url } : {}),
        ...(input.pastedText ? { pastedText: input.pastedText } : {}),
        ...(input.mode === 'music' ? { mode: 'music', musicText: input.musicText } : {}),
        roastStyleId: input.roastStyleId || 'roast-master',
      };
      const response = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!response.ok) {
        let message: string;
        if (contentType.includes('application/json')) {
          try {
            const errorPayload = await response.json();
            const baseMessage = typeof errorPayload?.error === 'string'
              ? errorPayload.error
              : await diagnoseApiFailure(response.status, '/api/roast');
            const reference = typeof errorPayload?.requestId === 'string'
              ? ` Reference: ${errorPayload.requestId}`
              : '';
            const stage = typeof errorPayload?.stage === 'string'
              ? ` Stage: ${errorPayload.stage}.`
              : '';
            const code = typeof errorPayload?.code === 'string'
              ? ` Code: ${errorPayload.code}.`
              : '';
            message = `${baseMessage}${stage}${code}${reference}`;
          } catch {
            message = await diagnoseApiFailure(response.status, '/api/roast', response.headers);
          }
        } else {
          message = await diagnoseApiFailure(response.status, '/api/roast');
        }
        setErrorMessage(message);
        return;
      }

      if (!contentType.includes('application/json')) {
        setErrorMessage(await diagnoseApiFailure(response.status, '/api/roast'));
        return;
      }

      const responseData: RoastResponse = await response.json();
      if (!responseData.success || !responseData.data) {
        setErrorMessage(responseData.error || 'No roast was generated. Please try again.');
        setCanPasteFallback(Boolean(responseData.canPasteFallback && input.mode !== 'music'));
        return;
      }

      const styleId = input.roastStyleId || responseData.data.roastStyleId || 'roast-master';
      const result: RoastResult = {
        ...responseData.data,
        roastStyleId: styleId,
        sourceLabel: input.sourceLabel || (input.mode === 'music'
          ? 'Spotify top tracks'
          : input.pastedText ? 'Pasted website copy' : responseData.data.domain),
        sourceItems: input.sourceItems,
        createdAt: new Date().toISOString(),
      };

      setRoastData(result);
      setHasExported(false);
      setRoastHistory(saveRoastToHistory(result, styleId));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Roast request failed:', error);
      setErrorMessage(await diagnoseApiFailure(null, '/api/roast'));
      setCanPasteFallback(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpotifyAction = async (source: SpotifyMusicSource, roastStyleId: string) => {
    setErrorMessage(null);
    setCanPasteFallback(false);

    try {
      if (!hasSpotifyScope(source)) {
        await beginSpotifyAuthorization(source, roastStyleId);
        return;
      }

      setIsSpotifyFetching(true);
      setIsLoading(true);
      const tracks = await fetchSpotifyMusic(source);
      setSpotifyConnected(hasSpotifySession());
      setIsLoading(false);
      setIsSpotifyFetching(false);

      await handleRoastSubmit({
        mode: 'music',
        musicText: tracks.join('\n'),
        roastStyleId,
        sourceItems: tracks,
        sourceLabel: source === 'top' ? 'Spotify top 5 tracks' : 'Spotify saved tracks',
      });
    } catch (error) {
      setIsLoading(false);
      setIsSpotifyFetching(false);
      setSpotifyConnected(hasSpotifySession());
      setErrorMessage(error instanceof Error ? error.message : 'Could not retrieve tracks from Spotify.');
    }
  };

  const handleDisconnectSpotify = () => {
    disconnectSpotify();
    setSpotifyConnected(false);
    setErrorMessage(null);
  };

  useEffect(() => {
    if (spotifyCallbackHandled.current) return;
    spotifyCallbackHandled.current = true;
    let active = true;

    const finishSpotifyConnection = async () => {
      try {
        const authorization = await completeSpotifyCallback();
        if (!authorization || !active) return;

        setSpotifyConnected(true);
        setIsSpotifyFetching(true);
        setIsLoading(true);
        const tracks = await fetchSpotifyMusic(authorization.source);
        if (!active) return;

        setIsSpotifyFetching(false);
        setIsLoading(false);
        await handleRoastSubmit({
          mode: 'music',
          musicText: tracks.join('\n'),
          roastStyleId: authorization.roastStyleId,
          sourceItems: tracks,
          sourceLabel: authorization.source === 'top' ? 'Spotify top 5 tracks' : 'Spotify saved favourites',
        });
      } catch (error) {
        if (!active) return;
        setIsSpotifyFetching(false);
        setIsLoading(false);
        setSpotifyConnected(hasSpotifySession());
        setErrorMessage(error instanceof Error ? error.message : 'Spotify connection failed.');
      }
    };

    void finishSpotifyConnection();
    return () => { active = false; };
  }, []);

  const handleReset = () => {
    setRoastData(null);
    setErrorMessage(null);
    setCanPasteFallback(false);
    setHasExported(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShowHowItWorks = () => {
    if (roastData) {
      setRoastData(null);
      window.setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 80);
    } else {
      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShowHistory = () => {
    if (roastData) {
      setRoastData(null);
      window.setTimeout(() => document.getElementById('roast-history')?.scrollIntoView({ behavior: 'smooth' }), 80);
    } else {
      document.getElementById('roast-history')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenHistory = (entry: RoastHistoryEntry) => {
    setRoastData(entry.result);
    setHasExported(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearHistory = () => {
    if (!window.confirm('Clear all Roastie history saved on this device?')) return;
    clearRoastHistory();
    setRoastHistory([]);
  };

  return (
    <div className="min-h-screen bg-[#086672] text-[#F7F8F4] flex flex-col justify-between selection:bg-[#E9F056] selection:text-[#132F32]">
      <div>
        <Header
          onReset={handleReset}
          onHowItWorksClick={handleShowHowItWorks}
          onHistoryClick={handleShowHistory}
          hasHistory={roastHistory.length > 0}
          isResultsView={Boolean(roastData)}
        />

        <main className="w-full">
          {!roastData ? (
            <>
              <Hero
                onRoastSubmit={handleRoastSubmit}
                onSpotifyAction={handleSpotifyAction}
                onDisconnectSpotify={handleDisconnectSpotify}
                spotifyConnected={spotifyConnected}
                isLoading={isLoading || isSpotifyFetching || countdown !== null}
                errorMessage={errorMessage}
                canPasteFallback={canPasteFallback}
                onHowItWorksClick={handleShowHowItWorks}
                onClearError={() => {
                  setErrorMessage(null);
                  setCanPasteFallback(false);
                }}
              />
              <RoastHistory
                entries={roastHistory}
                onOpen={handleOpenHistory}
                onExport={() => exportRoastHistory(roastHistory)}
                onClear={handleClearHistory}
              />
              <HowItWorks />
            </>
          ) : (
            <>
              <RoastResults
                roastData={roastData}
                onReset={handleReset}
                onExportSuccess={() => setHasExported(true)}
              />
              {hasExported && <DonationSupport onDismiss={() => setHasExported(false)} />}
            </>
          )}
        </main>
      </div>

      {countdown !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#062F34]/90 px-4 backdrop-blur-sm" role="status" aria-live="assertive">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <span className="countdown-spark absolute left-[14%] top-[20%] text-5xl sm:text-7xl">🔥</span>
            <span className="countdown-spark absolute right-[14%] top-[22%] text-5xl sm:text-7xl">😱</span>
            <span className="countdown-spark absolute bottom-[19%] left-[20%] text-4xl sm:text-6xl">😳</span>
            <span className="countdown-spark absolute bottom-[17%] right-[20%] text-4xl sm:text-6xl">🔥</span>
          </div>
          <div className="relative text-center">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-[#E9F056]">Ready. Set.</p>
            <p key={String(countdown)} className="countdown-number font-display text-8xl font-black leading-none text-white sm:text-9xl">
              {countdown}
            </p>
            <p className="mt-4 text-sm uppercase tracking-[0.2em] text-white/65">Roast incoming</p>
          </div>
        </div>
      )}

      <Footer onShowHowItWorks={handleShowHowItWorks} />
    </div>
  );
}
