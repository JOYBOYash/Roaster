import React from 'react';

interface HeaderProps {
  onHowItWorksClick: () => void;
  onReset: () => void;
  isResultsView?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onHowItWorksClick,
  onReset,
  isResultsView = false,
}) => {
  return (
    <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-4">
      <div className="border border-white/20 bg-[#064D57]/70 backdrop-blur-md px-5 py-3 flex items-center justify-between gap-4 clip-chamfer">
        {/* Roastie Wordmark */}
        <button
          onClick={onReset}
          className="flex items-center gap-2.5 text-left group transition-opacity hover:opacity-90"
        >
          <div className="w-8 h-8 bg-[#E9F056] text-[#132F32] flex items-center justify-center font-display font-black text-xl rounded-sm">
            R
          </div>
          <span className="font-display font-black text-2xl tracking-wider text-white">
            ROASTIE<span className="text-[#E9F056]">.</span>
          </span>
        </button>

        {/* Discreet Secondary Link */}
        <div className="flex items-center gap-4">
          <button
            onClick={onHowItWorksClick}
            className="text-xs font-mono tracking-wider text-white/70 hover:text-[#E9F056] transition-colors uppercase"
          >
            How it works
          </button>
          {isResultsView && (
            <button
              onClick={onReset}
              className="text-xs font-mono font-bold text-[#E9F056] hover:text-white transition-colors uppercase border border-[#E9F056]/40 px-2.5 py-1"
            >
              ← Roast another site
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
