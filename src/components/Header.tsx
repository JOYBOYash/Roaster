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
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 border-b border-white/15 px-4 py-5 sm:px-6">
      <button
        type="button"
        onClick={onReset}
        aria-label="Roastie home"
        className="cursor-pointer text-left text-xl font-bold tracking-tight text-white transition-colors hover:text-[#E9F056]"
      >
        roastie<span className="text-[#E9F056]">.</span>
      </button>

      <nav className="flex items-center gap-4">
        <button
          type="button"
          onClick={onHowItWorksClick}
          className="cursor-pointer text-sm text-white/75 transition-colors hover:text-[#E9F056]"
        >
          How it works
        </button>
        {isResultsView && (
          <button
            type="button"
            onClick={onReset}
            className="hidden cursor-pointer border-b border-[#E9F056]/60 pb-1 text-sm text-[#E9F056] transition-colors hover:text-white sm:inline-flex"
          >
            Roast another site
          </button>
        )}
      </nav>
    </header>
  );
};
