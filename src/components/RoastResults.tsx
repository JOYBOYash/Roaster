import React from 'react';
import { RoastResult } from '../types/roast';
import { RoastPoster } from './RoastPoster';
import { RotateCcw } from 'lucide-react';

interface RoastResultsProps {
  roastData: RoastResult;
  onReset: () => void;
  onExportSuccess?: () => void;
}

export const RoastResults: React.FC<RoastResultsProps> = ({
  roastData,
  onReset,
  onExportSuccess,
}) => {
  return (
    <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Target & Verdict Overview */}
      <div className="bg-[#064D57] border border-white/20 p-6 sm:p-8 clip-chamfer-lg shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-white/15 pb-4">
          <div>
            <span className="font-mono text-xs text-white/60 uppercase block mb-1">
              Website
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white uppercase break-all">
              {roastData.domain}
            </h2>
          </div>

          <div className="flex items-baseline gap-1 self-start sm:self-auto">
            <span className="font-display font-black text-5xl sm:text-6xl text-[#FF5C34]">
              {roastData.score}
            </span>
            <span className="font-mono text-xl text-white/50">/100</span>
          </div>
        </div>

        {/* Verdict Label */}
        <div className="flex items-center gap-3">
          <span className="bg-[#FF5C34] text-white font-display font-black text-xl px-3.5 py-1.5 uppercase tracking-wide shadow-sm inline-block">
            {roastData.verdict}
          </span>
          <span className="font-mono text-xs text-[#E9F056]">
            Entertainment score
          </span>
        </div>

        {/* Roast Paragraph */}
        <p className="font-body text-lg sm:text-xl font-medium leading-relaxed text-white">
          "{roastData.roast}"
        </p>

        {/* Punchline */}
        <div className="bg-[#132F32] text-[#E9F056] p-4 font-mono text-sm sm:text-base font-bold shadow-sm border-l-4 border-[#E9F056]">
          ⚡ {roastData.punchline}
        </div>
      </div>

      {/* Free Poster Export */}
      <div className="pt-2">
        <RoastPoster roastData={roastData} onExportSuccess={onExportSuccess} />
      </div>

      {/* Secondary Reset Action */}
      <div className="text-center pt-4">
        <button
          onClick={onReset}
          className="text-white/70 hover:text-[#E9F056] font-mono text-xs uppercase font-bold tracking-wider transition-colors inline-flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Roast another website
        </button>
      </div>

      {/* Visually secondary disclaimer */}
      <p className="font-mono text-[11px] text-white/40 text-center max-w-md mx-auto pt-2">
        Roastie generates humorous entertainment scores and comedy roasts. Not an objective audit or technical assessment.
      </p>
    </section>
  );
};
