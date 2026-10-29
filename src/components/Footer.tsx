import React from 'react';

interface FooterProps {
  onShowHowItWorks: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onShowHowItWorks }) => {
  return (
    <footer className="mt-auto w-full border-t border-white/15 px-4 py-7 text-white/70 sm:px-6">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-base font-semibold tracking-tight text-white">roastie.</p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed">
            Roasts are based on the supplied page copy and are for entertainment. Roastie does not test website quality.
          </p>
        </div>
        <button
          type="button"
          onClick={onShowHowItWorks}
          className="cursor-pointer self-start text-sm underline underline-offset-4 transition-colors hover:text-[#E9F056]"
        >
          How it works
        </button>
      </div>
    </footer>
  );
};
