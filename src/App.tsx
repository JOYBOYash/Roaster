import { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { RoastResults } from './components/RoastResults';
import { DonationSupport } from './components/DonationSupport';
import { Footer } from './components/Footer';
import { RoastResult, RoastResponse } from './types/roast';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [roastData, setRoastData] = useState<RoastResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [canPasteFallback, setCanPasteFallback] = useState(false);
  const [hasExported, setHasExported] = useState(false);

  const handleRoastSubmit = async (input: { url?: string; pastedText?: string }) => {
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

      if (!response.ok) {
        let msg = 'Failed to analyze website. Please try again or paste page text directly.';
        try {
          const errData = await response.json();
          if (errData && errData.error) msg = errData.error;
        } catch {
          // If non-JSON returned (e.g. gateway timeout or proxy error)
          msg = response.status === 504
            ? 'The target website took too long to respond. Try pasting its text directly.'
            : 'Service temporarily busy. Please try again or paste page text directly.';
        }
        setErrorMessage(msg);
        setCanPasteFallback(true);
        return;
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        setErrorMessage('Received unexpected response. Please try pasting page text directly.');
        setCanPasteFallback(true);
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
      setErrorMessage('Network connection error. Please try again or paste text directly.');
      setCanPasteFallback(true);
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
