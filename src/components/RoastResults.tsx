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
    <section
      aria-label="Your roast card"
      className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10"
    >
      <div className="relative isolate">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-visible">
          <span className="roast-burst absolute -left-2 top-8 text-4xl sm:-left-8 sm:text-5xl">🔥</span>
          <span className="roast-burst roast-burst-delay absolute -right-1 top-1/4 text-4xl sm:-right-8 sm:text-5xl">😱</span>
          <span className="roast-burst roast-burst-late absolute -left-1 bottom-1/4 text-3xl sm:-left-7 sm:text-4xl">😳</span>
          <span className="roast-burst absolute -right-1 bottom-8 text-4xl sm:-right-7 sm:text-5xl">🔥</span>
        </div>
        <div className="relative z-10">
          <RoastPoster roastData={roastData} onExportSuccess={onExportSuccess} />
        </div>
      </div>

      <div className="flex justify-center pt-7">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex cursor-pointer items-center gap-2 text-sm text-white/75 underline underline-offset-4 transition-colors hover:text-[#E9F056]"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Roast another
        </button>
      </div>
    </section>
  );
};
