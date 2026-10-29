import { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { RoastResults } from './components/RoastResults';
import { DonationSupport } from './components/DonationSupport';
import { Footer } from './components/Footer';
import { RoastResult, RoastResponse } from './types/roast';

type ApiHealth = {
  ok?: boolean;
  service?: string;
  aiConfigured?: boolean;
};

async function diagnoseApiFailure(status: number | null, route: string): Promise<string> {
  const statusSuffix = status === null ? '' : ` (HTTP ${status})`;

  if (status === 504) {
    return 'The request timed out before Roastie finished. No roast was generated. Check /api/health and the server logs.';
  }

  try {
    const healthResponse = await fetch('/api/health', { cache: 'no-store' });
    const contentType = healthResponse.headers.get('content-type') || '';

    if (!healthResponse.ok || !contentType.includes('application/json')) {
      return `Could not confirm that the Roastie API is running${statusSuffix}. Open /api/health on this site and check the deployment logs.`;
    }

    const health: ApiHealth = await healthResponse.json();
    if (!health.ok) {
      return `The Roastie API health check failed${statusSuffix}. Check the server logs.`;
    }

    if (health.aiConfigured === false) {
      return 'The Roastie server is running, but Gemini is not configured. Set GEMINI_API_KEY in the hosting platform’s server secrets.';
    }

    if (status === null) {
      return `The API health check passed, but the ${route} request could not complete. Check the host’s proxy and server logs.`;
    }

    return `The Roastie API is reachable, but ${route} returned a non-JSON response${statusSuffix}. Check API routing and server logs.`;
  } catch {
    return `Could not reach the Roastie API${statusSuffix}. Check /api/health and confirm the Express server is running on the host.`;
  }
}

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [roastData, setRoastData] = useState<RoastResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [canPasteFallback, setCanPasteFallback] = useState(false);
  const [hasExported, setHasExported] = useState(false);

  const handleRoastSubmit = async (input: { url?: string; pastedText?: string; musicText?: string; mode?: 'website' | 'music' }) => {
    setIsLoading(true);
    setErrorMessage(null);
    setCanPasteFallback(false);

    try {
      const response = await fetch('/api/roast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      const contentType = response.headers.get('content-type') || '';

      if (!response.ok) {
        let msg: string;

        if (contentType.includes('application/json')) {
          try {
            const errData = await response.json();
            msg = typeof errData?.error === 'string'
              ? errData.error
              : await diagnoseApiFailure(response.status, '/api/roast');
          } catch {
            msg = await diagnoseApiFailure(response.status, '/api/roast');
          }
        } else {
          msg = await diagnoseApiFailure(response.status, '/api/roast');
        }

        setErrorMessage(msg);
        setCanPasteFallback(false);
        return;
      }

      if (!contentType.includes('application/json')) {
        setErrorMessage(await diagnoseApiFailure(response.status, '/api/roast'));
        setCanPasteFallback(false);
        return;
      }

      const resData: RoastResponse = await response.json();

      if (resData.success && resData.data) {
        setRoastData(resData.data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMessage(resData.error || 'Failed to analyze website. Please check the URL.');
        if (resData.canPasteFallback) {
          setCanPasteFallback(true);
        }
      }
    } catch (err: any) {
      console.error('Request failed:', err);
      setErrorMessage(await diagnoseApiFailure(null, '/api/roast'));
      setCanPasteFallback(false);
    } finally {
      setIsLoading(false);
    }
  };

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
      setTimeout(() => {
        const el = document.getElementById('how-it-works');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      const el = document.getElementById('how-it-works');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#086672] text-[#F7F8F4] flex flex-col justify-between selection:bg-[#E9F056] selection:text-[#132F32]">
      <div>
        <Header
          onReset={handleReset}
          onHowItWorksClick={handleShowHowItWorks}
          isResultsView={Boolean(roastData)}
        />

        <main className="w-full">
          {!roastData ? (
            <>
              <Hero
                onRoastSubmit={handleRoastSubmit}
                isLoading={isLoading}
                errorMessage={errorMessage}
                canPasteFallback={canPasteFallback}
                onHowItWorksClick={handleShowHowItWorks}
                onClearError={() => {
                  setErrorMessage(null);
                  setCanPasteFallback(false);
                }}
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

              {hasExported && (
                <DonationSupport onDismiss={() => setHasExported(false)} />
              )}
            </>
          )}
        </main>
      </div>

      <Footer onShowHowItWorks={handleShowHowItWorks} />
    </div>
  );
}
