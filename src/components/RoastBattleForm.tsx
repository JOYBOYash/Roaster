import React, { useState } from 'react';
import { Swords, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';

interface RoastBattleFormProps {
  onBattleSubmit: (urlA: string, urlB: string) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
}

export const RoastBattleForm: React.FC<RoastBattleFormProps> = ({
  onBattleSubmit,
  isLoading,
  errorMessage,
}) => {
  const [urlA, setUrlA] = useState('');
  const [urlB, setUrlB] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const presets = [
    { label: 'Notion vs Linear', a: 'https://notion.so', b: 'https://linear.app' },
    { label: 'Uber vs Lyft', a: 'https://uber.com', b: 'https://lyft.com' },
    { label: 'Figma vs Canva', a: 'https://figma.com', b: 'https://canva.com' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!urlA.trim() || !urlB.trim()) {
      setValidationError('Please enter valid URLs for both websites to begin the battle.');
      return;
    }

    let cleanA = urlA.trim();
    if (!cleanA.startsWith('http://') && !cleanA.startsWith('https://')) cleanA = 'https://' + cleanA;

    let cleanB = urlB.trim();
    if (!cleanB.startsWith('http://') && !cleanB.startsWith('https://')) cleanB = 'https://' + cleanB;

    if (cleanA.toLowerCase() === cleanB.toLowerCase()) {
      setValidationError('Please choose two different websites to battle!');
      return;
    }

    await onBattleSubmit(cleanA, cleanB);
  };

  const handleApplyPreset = (a: string, b: string) => {
    setUrlA(a);
    setUrlB(b);
    setValidationError(null);
  };

  return (
    <div className="bg-[#064D57] border-2 border-[#FF5C34] p-6 sm:p-8 shadow-2xl relative clip-chamfer-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/20 pb-4 mb-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-[#FF5C34] font-bold flex items-center gap-1.5">
            <Swords className="w-4 h-4 text-[#FF5C34]" /> HEAD-TO-HEAD ROAST BATTLE
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white mt-1">
            WHICH WEBSITE IS WORSE?
          </h2>
        </div>
        <span className="font-mono text-xs bg-[#FF5C34] text-white px-2.5 py-1 font-bold uppercase">
          AI REFEREE DECISION
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* Corner 1 Input */}
          <div className="md:col-span-5 space-y-2">
            <label htmlFor="url-corner-1" className="font-mono text-xs uppercase text-[#E9F056] font-bold flex items-center gap-1">
              <span>🔵 CORNER 1: TARGET SITE A</span>
            </label>
            <input
              id="url-corner-1"
              type="text"
              value={urlA}
              onChange={(e) => setUrlA(e.target.value)}
              placeholder="https://competitor-a.com"
              disabled={isLoading}
              className="w-full bg-[#132F32] border border-white/20 text-white placeholder-white/40 px-4 py-3.5 font-mono text-sm focus:outline-none focus:border-[#E9F056] focus:ring-1 focus:ring-[#E9F056] transition-all"
            />
          </div>

          {/* VS Badge */}
          <div className="md:col-span-1 flex justify-center py-2 md:py-0">
            <div className="w-10 h-10 bg-[#FF5C34] text-white flex items-center justify-center font-display font-black text-xl rounded-full shadow-lg border-2 border-white/20">
              VS
            </div>
          </div>

          {/* Corner 2 Input */}
          <div className="md:col-span-5 space-y-2">
            <label htmlFor="url-corner-2" className="font-mono text-xs uppercase text-[#D7EFFF] font-bold flex items-center gap-1">
              <span>🔴 CORNER 2: TARGET SITE B</span>
            </label>
            <input
              id="url-corner-2"
              type="text"
              value={urlB}
              onChange={(e) => setUrlB(e.target.value)}
              placeholder="https://competitor-b.com"
              disabled={isLoading}
              className="w-full bg-[#132F32] border border-white/20 text-white placeholder-white/40 px-4 py-3.5 font-mono text-sm focus:outline-none focus:border-[#D7EFFF] focus:ring-1 focus:ring-[#D7EFFF] transition-all"
            />
          </div>
        </div>

        {/* Quick Match Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="font-mono text-[11px] text-white/50 uppercase mr-1">
            Popular Matchups:
          </span>
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => handleApplyPreset(p.a, p.b)}
              disabled={isLoading}
              className="bg-black/30 hover:bg-black/50 text-white/80 hover:text-white border border-white/10 px-2.5 py-1 font-mono text-xs transition-colors rounded-sm"
            >
              {p.label}
            </button>
          ))}
        </div>

        {(validationError || errorMessage) && (
          <div className="bg-[#FF5C34]/20 border border-[#FF5C34] text-white p-3 text-xs font-mono flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#FF5C34] shrink-0 mt-0.5" />
            <p>{validationError || errorMessage}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#FF5C34] hover:bg-[#eb4e28] text-white font-display font-black text-xl tracking-wider py-4 px-6 uppercase transition-all duration-150 flex items-center justify-center gap-2 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed active:translate-y-0.5"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              Scraping both sites & refereeing battle...
            </span>
          ) : (
            <>
              <Swords className="w-5 h-5" />
              <span>START ROAST BATTLE</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
