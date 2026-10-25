import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { TrendingRoasts } from './components/TrendingRoasts';
import { RoastResults } from './components/RoastResults';
import { RoastBattleForm } from './components/RoastBattleForm';
import { BattleResults } from './components/BattleResults';
import { RecentRoastsDrawer } from './components/RecentRoastsDrawer';
import { DonationSupport } from './components/DonationSupport';
import { Footer } from './components/Footer';
import { sampleRoasts } from './data/sampleRoasts';
import { RoastResult, BattleResult, HistoryItem, RoastResponse, BattleResponse } from './types/roast';
import {
  loadHistory,
  saveRoastToHistory,
  saveBattleToHistory,
  deleteHistoryItem,
  clearAllHistory,
} from './utils/historyStorage';
import { Swords, Flame } from 'lucide-react';

export default function App() {
  const [activeMode, setActiveMode] = useState<'single' | 'battle'>('single');
  const [isLoading, setIsLoading] = useState(false);
  const [roastData, setRoastData] = useState<RoastResult | null>(null);
  const [battleData, setBattleData] = useState<BattleResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [canPasteFallback, setCanPasteFallback] = useState(false);
  const [hasExported, setHasExported] = useState(false);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // Handle single website roast submission
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

      const resData: RoastResponse = await response.json();

      if (resData.success && resData.data) {
        setRoastData(resData.data);
        setBattleData(null);
        // Persist to localStorage
        const updated = saveRoastToHistory(resData.data);
        setHistory(updated);

        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      } else {
        setErrorMessage(resData.error || 'Failed to roast website. Please try again.');
        if (resData.canPasteFallback) {
          setCanPasteFallback(true);
        }
      }
    } catch (err: any) {
      console.error('API call error:', err);
      setErrorMessage('Network connection or server error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Roast Battle submission
  const handleBattleSubmit = async (urlA: string, urlB: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/battle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urlA, urlB }),
      });

      const resData: BattleResponse = await response.json();

      if (resData.success && resData.data) {
        setBattleData(resData.data);
        setRoastData(null);
        // Persist to localStorage
        const updated = saveBattleToHistory(resData.data);
        setHistory(updated);

        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      } else {
        setErrorMessage(resData.error || 'Roast battle could not be completed. Please check both URLs.');
      }
    } catch (err: any) {
      console.error('Battle API error:', err);
      setErrorMessage('Network error during battle refereeing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setRoastData(null);
    setBattleData(null);
    setErrorMessage(null);
    setCanPasteFallback(false);
    setHasExported(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleModeChange = (mode: 'single' | 'battle') => {
    setActiveMode(mode);
    setRoastData(null);
    setBattleData(null);
    setErrorMessage(null);
    setCanPasteFallback(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShowSample = () => {
    setActiveMode('single');
    setRoastData(sampleRoasts[0]);
    setBattleData(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShowHowItWorks = () => {
    if (roastData || battleData) {
      setRoastData(null);
      setBattleData(null);
      setTimeout(() => {
        const el = document.getElementById('how-it-works');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('how-it-works');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShowTrending = () => {
    if (roastData || battleData) {
      setRoastData(null);
      setBattleData(null);
      setTimeout(() => {
        const el = document.getElementById('trending');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('trending');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectTrendingRoast = (selected: RoastResult) => {
    setActiveMode('single');
    setRoastData(selected);
    setBattleData(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRoastDomain = (domain: string) => {
    setActiveMode('single');
    handleRoastSubmit({ url: `https://${domain}` });
  };

  // History actions
  const handleSelectHistoryRoast = (roast: RoastResult) => {
    setActiveMode('single');
    setRoastData(roast);
    setBattleData(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectHistoryBattle = (battle: BattleResult) => {
    setActiveMode('battle');
    setBattleData(battle);
    setRoastData(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistory(updated);
  };

  const handleClearHistory = () => {
    clearAllHistory();
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-[#086672] text-[#F7F8F4] flex flex-col justify-between selection:bg-[#E9F056] selection:text-[#132F32]">
      <div>
        <Header
          onRoastClick={handleReset}
          onSampleClick={handleShowSample}
          onHowItWorksClick={handleShowHowItWorks}
          onTrendingClick={handleShowTrending}
          onOpenHistory={() => setIsHistoryOpen(true)}
          historyCount={history.length}
          activeMode={activeMode}
          onModeChange={handleModeChange}
        />

        {/* Mode Selector Banner (Mobile friendly) */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-2 pb-0 flex sm:hidden justify-center">
          <div className="bg-[#064D57] p-1 border border-white/20 flex items-center w-full max-w-xs clip-chamfer">
            <button
              onClick={() => handleModeChange('single')}
              className={`flex-1 py-1.5 font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-1 ${
                activeMode === 'single'
                  ? 'bg-[#E9F056] text-[#132F32]'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Solo
            </button>
            <button
              onClick={() => handleModeChange('battle')}
              className={`flex-1 py-1.5 font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-1 ${
                activeMode === 'battle'
                  ? 'bg-[#FF5C34] text-white'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              Battle
            </button>
          </div>
        </div>

        <main className="w-full">
          {/* Solo Mode View */}
          {activeMode === 'single' && (
            <>
              {!roastData ? (
                <>
                  <Hero
                    onRoastSubmit={handleRoastSubmit}
                    isLoading={isLoading}
                    errorMessage={errorMessage}
                    canPasteFallback={canPasteFallback}
                  />
                  <HowItWorks />
                  <TrendingRoasts
                    onSelectRoast={handleSelectTrendingRoast}
                    onRoastDomain={handleRoastDomain}
                  />
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
            </>
          )}

          {/* Roast Battle Mode View */}
          {activeMode === 'battle' && (
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6">
              {!battleData ? (
                <div className="space-y-12">
                  <RoastBattleForm
                    onBattleSubmit={handleBattleSubmit}
                    isLoading={isLoading}
                    errorMessage={errorMessage}
                  />
                  <TrendingRoasts
                    onSelectRoast={handleSelectTrendingRoast}
                    onRoastDomain={handleRoastDomain}
                  />
                </div>
              ) : (
                <>
                  <BattleResults
                    battleData={battleData}
                    onReset={handleReset}
                    onExportSuccess={() => setHasExported(true)}
                  />

                  {hasExported && (
                    <DonationSupport onDismiss={() => setHasExported(false)} />
                  )}
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Persistent History Drawer */}
      <RecentRoastsDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectRoast={handleSelectHistoryRoast}
        onSelectBattle={handleSelectHistoryBattle}
        onDeleteItem={handleDeleteHistoryItem}
        onClearAll={handleClearHistory}
      />

      <Footer
        onShowSample={handleShowSample}
        onShowHowItWorks={handleShowHowItWorks}
        onShowTrending={handleShowTrending}
      />
    </div>
  );
}
