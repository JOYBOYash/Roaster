import React from 'react';
import { Download, History, ArrowUpRight, Trash2 } from 'lucide-react';
import { RoastHistoryEntry } from '../lib/roastHistory';

interface RoastHistoryProps {
  entries: RoastHistoryEntry[];
  onOpen: (entry: RoastHistoryEntry) => void;
  onExport: () => void;
  onClear: () => void;
}

export const RoastHistory: React.FC<RoastHistoryProps> = ({
  entries,
  onOpen,
  onExport,
  onClear,
}) => {
  if (entries.length === 0) return null;

  return (
    <section id="roast-history" className="mx-auto w-full max-w-4xl px-4 pb-12 sm:px-6">
      <div className="border-t border-white/15 pt-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-[#E9F056]" aria-hidden="true" />
              <h2 className="text-xl font-bold tracking-tight text-white">Recent roasts</h2>
            </div>
            <p className="mt-1 text-sm text-white/60">Last {entries.length}, saved on this device only.</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClear} className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-white/55 transition-colors hover:text-[#FF8A70]">
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Clear
            </button>
            <button type="button" onClick={onExport} className="inline-flex cursor-pointer items-center gap-2 border border-white/25 px-3 py-2 text-sm text-white/85 transition-colors hover:border-[#E9F056] hover:text-[#E9F056]">
              <Download className="h-4 w-4" aria-hidden="true" />
              Export history
            </button>
          </div>
        </div>

        <div className="divide-y divide-white/10 border-y border-white/10">
          {entries.map((entry) => (
            <button
              type="button"
              key={entry.id}
              onClick={() => onOpen(entry)}
              className="group flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left transition-colors hover:bg-white/[0.03] sm:px-2"
            >
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-semibold text-white transition-colors group-hover:text-[#E9F056]">
                    {entry.result.headline}
                  </span>
                  <span className="text-xs text-white/45">
                    {entry.result.inputMethod === 'music' ? 'Music taste' : entry.result.domain}
                  </span>
                </span>
                <span className="mt-1 block truncate text-sm text-white/65">{entry.result.roast}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2 text-xs text-white/45">
                {new Date(entry.savedAt).toLocaleDateString()}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
