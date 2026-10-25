import React from 'react';
import { Flame, Swords, Clock } from 'lucide-react';

interface HeaderProps {
  onRoastClick: () => void;
  onSampleClick: () => void;
  onHowItWorksClick: () => void;
  onTrendingClick?: () => void;
  onOpenHistory?: () => void;
  historyCount?: number;
  activeMode?: 'single' | 'battle';
  onModeChange?: (mode: 'single' | 'battle') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onRoastClick,
  onSampleClick,
  onHowItWorksClick,
  onTrendingClick,
  onOpenHistory,
  historyCount = 0,
  activeMode = 'single',
  onModeChange,
}) => {
  return (
    <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-4">
      {/* Framed top strip */}
      <div className="border border-white/20 bg-[#064D57]/70 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between gap-4 clip-chamfer">
        {/* Zone 1: Brand Wordmark & Mode Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onRoastClick}
            className="flex items-center gap-2 text-left group"
          >
            <div className="w-8 h-8 bg-[#E9F056] text-[#132F32] flex items-center justify-center font-display font-black text-xl rounded-sm shadow-sm">
              R
            </div>
            <span className="font-display font-black text-2xl tracking-wider text-white whitespace-nowrap">
              ROASTIE<span className="text-[#E9F056]">.</span>
            </span>
          </button>

          {/* Quick Mode Pill / Segmented Control */}
          {onModeChange && (
            <div className="hidden sm:flex items-center gap-1 bg-[#132F32] p-1 border border-white/10 rounded-sm ml-2">
              <button
                onClick={() => onModeChange('single')}
                className={`px-2.5 py-1 font-mono text-xs font-bold transition-all ${
                  activeMode === 'single'
                    ? 'bg-[#E9F056] text-[#132F32] shadow-sm'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Solo Roast
              </button>
              <button
                onClick={() => onModeChange('battle')}
                className={`px-2.5 py-1 font-mono text-xs font-bold transition-all flex items-center gap-1 ${
                  activeMode === 'battle'
                    ? 'bg-[#FF5C34] text-white shadow-sm'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Swords className="w-3 h-3" />
                Roast Battle
              </button>
            </div>
          )}
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-body font-medium text-white/80">
          <button
            onClick={onTrendingClick}
            className="hover:text-[#E9F056] transition-colors whitespace-nowrap flex items-center gap-1 font-bold text-[#E9F056]"
          >
            🔥 Trending
          </button>
          <button
            onClick={onHowItWorksClick}
            className="hover:text-[#E9F056] transition-colors whitespace-nowrap"
          >
            How It Works
          </button>
          <button
            onClick={onSampleClick}
            className="hover:text-[#E9F056] transition-colors whitespace-nowrap"
          >
            Sample Roast
          </button>
        </nav>

        {/* Zone 3: Actions (History & Primary Button) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="bg-[#132F32] hover:bg-[#1a3d41] text-white/90 hover:text-[#E9F056] border border-white/20 font-mono text-xs font-bold px-3 py-2 transition-all flex items-center gap-1.5 shadow-sm active:translate-y-0.5"
              title="View Recent Roasts Drawer"
            >
              <Clock className="w-3.5 h-3.5 text-[#E9F056]" />
              <span className="hidden sm:inline">History</span>
              {historyCount > 0 && (
                <span className="bg-[#E9F056] text-[#132F32] font-black text-[10px] px-1.5 py-0.2 rounded-full">
                  {historyCount}
                </span>
              )}
            </button>
          )}

          {activeMode === 'battle' ? (
            <button
              onClick={() => onModeChange && onModeChange('single')}
              className="bg-[#E9F056] hover:bg-[#d8df43] text-[#132F32] font-display font-bold text-sm tracking-wide px-3.5 py-2 uppercase transition-all duration-150 flex items-center gap-1.5 shadow-md active:translate-y-0.5"
            >
              <Flame className="w-4 h-4 fill-[#132F32]" />
              <span>Solo Mode</span>
            </button>
          ) : (
            <button
              onClick={() => onModeChange && onModeChange('battle')}
              className="bg-[#FF5C34] hover:bg-[#eb4e28] text-white font-display font-bold text-sm tracking-wide px-3.5 py-2 uppercase transition-all duration-150 flex items-center gap-1.5 shadow-md active:translate-y-0.5"
            >
              <Swords className="w-4 h-4" />
              <span>Roast Battle</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
