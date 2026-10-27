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
      <RoastPoster roastData={roastData} onExportSuccess={onExportSuccess} />

      <div className="flex justify-center pt-7">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex cursor-pointer items-center gap-2 text-sm text-white/75 underline underline-offset-4 transition-colors hover:text-[#E9F056]"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Roast another site
        </button>
      </div>
    </section>
  );
};
