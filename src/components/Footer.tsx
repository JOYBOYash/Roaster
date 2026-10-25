import React from 'react';

interface FooterProps {
  onShowHowItWorks: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onShowHowItWorks }) => {
  return (
    <footer className="w-full bg-[#064D57] border-t border-white/10 text-white/70 py-10 px-4 sm:px-6 mt-16 font-body">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#E9F056] text-[#132F32] font-display font-black text-sm flex items-center justify-center rounded-sm">
              R
            </div>
            <span className="font-display font-black text-xl uppercase tracking-wider text-white">
              ROASTIE<span className="text-[#E9F056]">.</span>
            </span>
          </div>

          <button
            onClick={onShowHowItWorks}
            className="text-xs font-mono text-white/70 hover:text-[#E9F056] transition-colors"
          >
            How it works
          </button>
        </div>

        {/* Honest Disclaimer */}
        <div className="text-xs font-mono text-white/50 space-y-1.5 leading-relaxed">
          <p>
            Entertainment disclaimer: Roastie generates satirical comedy roasts and humorous scores based on public website copy. It does not provide objective quality metrics, conversion advice, or SEO audits.
          </p>
          <p>
            Privacy: Submitted URLs are fetched transiently on the server and are not retained.
          </p>
        </div>

        <div className="pt-2 font-mono text-[11px] text-white/40">
          © {new Date().getFullYear()} Roastie. Free to use.
        </div>
      </div>
    </footer>
  );
};
