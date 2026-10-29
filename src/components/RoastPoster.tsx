import React, { useRef, useState } from 'react';
import { RoastResult, PosterTheme } from '../types/roast';
import { Download, RefreshCw, Copy, Check } from 'lucide-react';
import { toPng } from 'html-to-image';

interface RoastPosterProps {
  roastData: RoastResult;
  onExportSuccess?: () => void;
}

const themes: Record<PosterTheme, {
  label: string;
  background: string;
  ink: string;
  accent: string;
  border: string;
}> = {
  'certified-cooked': {
    label: 'Paper',
    background: 'bg-[#F7F4EA]',
    ink: 'text-[#173F40]',
    accent: 'bg-[#FF5C34]',
    border: 'border-[#173F40]/20',
  },
  'crime-scene': {
    label: 'Coral',
    background: 'bg-[#F4D8CC]',
    ink: 'text-[#173F40]',
    accent: 'bg-[#FF5C34]',
    border: 'border-[#173F40]/20',
  },
  'cold-verdict': {
    label: 'Blue',
    background: 'bg-[#D7EFFF]',
    ink: 'text-[#173F40]',
    accent: 'bg-[#E9F056]',
    border: 'border-[#173F40]/20',
  },
};

export const RoastPoster: React.FC<RoastPosterProps> = ({ roastData, onExportSuccess }) => {
  const [selectedTheme, setSelectedTheme] = useState<PosterTheme>('certified-cooked');
  const [isExporting, setIsExporting] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const theme = themes[selectedTheme];

  const handleCopyText = async () => {
    const fullText = `Roastie: ${roastData.domain}\n${roastData.headline}\n\n${roastData.roast}`;
    setCopyError(false);

    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedText(true);
      window.setTimeout(() => setCopiedText(false), 1800);
    } catch {
      setCopyError(true);
    }
  };

  const handleDownloadPNG = async () => {
    if (!posterRef.current) return;
    setIsExporting(true);
    setExportError(null);

    try {
      const dataUrl = await toPng(posterRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        skipFonts: true,
      });

      const safeDomain = roastData.domain
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 80) || 'website-copy';
      const link = document.createElement('a');
      link.download = `roastie-${safeDomain}.png`;
      link.href = dataUrl;
      link.click();
      onExportSuccess?.();
    } catch (err) {
      console.error('Error generating PNG export:', err);
      setExportError('Could not export the card in this browser. Copy the text instead.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="flex flex-wrap items-center justify-center gap-3" role="group" aria-label="Card style">
        <span className="mr-1 text-sm text-white/75">Card style</span>
        {(Object.entries(themes) as [PosterTheme, (typeof themes)[PosterTheme]][]).map(([value, option]) => (
          <button
            key={value}
            type="button"
            aria-pressed={selectedTheme === value}
            onClick={() => setSelectedTheme(value)}
            className={`cursor-pointer border-b-2 px-1 py-1 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E9F056] ${
              selectedTheme === value
                ? 'border-[#E9F056] text-white'
                : 'border-transparent text-white/65 hover:text-white'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="relative w-full max-w-[520px]">
        <div
          ref={posterRef}
          className={`relative flex aspect-[4/5] w-full flex-col overflow-hidden border ${theme.border} ${theme.background} ${theme.ink} p-7 sm:p-10`}
        >
          <header className={`flex items-center justify-between gap-4 border-b pb-4 ${theme.border}`}>
            <span className="text-lg font-bold tracking-tight">roastie</span>
            <span className="text-sm opacity-70">website roast</span>
          </header>

          <main className="my-auto py-8 sm:py-10">
            <p className="mb-5 break-words text-sm font-medium opacity-70">
              {roastData.domain}
            </p>
            <div className={`mb-7 h-1.5 w-14 ${theme.accent}`} aria-hidden="true" />
            <h2 className="break-words text-4xl font-bold leading-[0.98] tracking-tight sm:text-6xl">
              {roastData.headline}
            </h2>
            <p className="mt-6 max-w-prose break-words text-lg leading-snug sm:text-xl">
              {roastData.roast}
            </p>
          </main>

          <footer className={`flex items-center justify-between gap-4 border-t pt-4 text-sm ${theme.border}`}>
            <span className="opacity-75">For entertainment</span>
            <span className="font-semibold">roastie</span>
          </footer>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleDownloadPNG}
          disabled={isExporting}
          className="inline-flex cursor-pointer items-center justify-center gap-2 border border-[#E9F056] bg-[#E9F056] px-5 py-3 text-sm font-semibold text-[#132F32] transition-colors hover:bg-[#f1f5a0] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isExporting ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
              Preparing card
            </>
          ) : (
            <>
              <Download className="h-4 w-4" aria-hidden="true" />
              Download card
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleCopyText}
          className="inline-flex cursor-pointer items-center justify-center gap-2 border border-white/30 px-4 py-3 text-sm text-white transition-colors hover:border-white hover:bg-white/5"
        >
          {copiedText ? (
            <>
              <Check className="h-4 w-4" aria-hidden="true" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" aria-hidden="true" />
              Copy text
            </>
          )}
        </button>
      </div>

      {(exportError || copyError) && (
        <p role="status" className="max-w-[520px] text-sm text-[#F7D6CC]">
          {exportError || 'Copy is unavailable in this browser. Select the card text to copy it manually.'}
        </p>
      )}
    </div>
  );
};
