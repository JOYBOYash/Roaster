import React, { useRef, useState } from 'react';
import { RoastResult, PosterTheme } from '../types/roast';
import { Download, RefreshCw, Copy, Check } from 'lucide-react';
import { toPng } from 'html-to-image';

interface RoastPosterProps {
  roastData: RoastResult;
  onExportSuccess?: () => void;
}

export const RoastPoster: React.FC<RoastPosterProps> = ({ roastData, onExportSuccess }) => {
  const [selectedTheme, setSelectedTheme] = useState<PosterTheme>('certified-cooked');
  const [isExporting, setIsExporting] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);

  const handleCopyText = async () => {
    const fullText = `ROASTIE: ${roastData.domain}\nScore: ${roastData.score}/100 - ${roastData.verdict}\n\n"${roastData.roast}"\n\n⚡ ${roastData.punchline}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadPNG = async () => {
    if (!posterRef.current) return;
    setIsExporting(true);

    try {
      const dataUrl = await toPng(posterRef.current, {
        cacheBust: true,
        quality: 0.98,
        pixelRatio: 2,
      });

      const sanitizedDomain = roastData.domain.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const filename = `roastie-${sanitizedDomain}.png`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();

      if (onExportSuccess) {
        onExportSuccess();
      }
    } catch (err) {
      console.error('Error generating PNG export:', err);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Theme styles
  const getThemeStyles = () => {
    switch (selectedTheme) {
      case 'certified-cooked':
        return {
          bg: 'bg-[#E9F056]',
          text: 'text-[#132F32]',
          border: 'border-[#132F32]',
          accentBg: 'bg-[#132F32]',
          accentText: 'text-[#E9F056]',
          verdictBg: 'bg-[#FF5C34]',
          verdictText: 'text-white',
          quoteBg: 'bg-white/80',
        };
      case 'crime-scene':
        return {
          bg: 'bg-[#FF5C34]',
          text: 'text-[#132F32]',
          border: 'border-[#132F32]',
          accentBg: 'bg-[#132F32]',
          accentText: 'text-[#FF5C34]',
          verdictBg: 'bg-[#E9F056]',
          verdictText: 'text-[#132F32]',
          quoteBg: 'bg-white/90',
        };
      case 'cold-verdict':
      default:
        return {
          bg: 'bg-[#D7EFFF]',
          text: 'text-[#132F32]',
          border: 'border-[#132F32]',
          accentBg: 'bg-[#132F32]',
          accentText: 'text-[#D7EFFF]',
          verdictBg: 'bg-[#FF5C34]',
          verdictText: 'text-white',
          quoteBg: 'bg-white',
        };
    }
  };

  const themeStyles = getThemeStyles();

  return (
    <div className="w-full flex flex-col items-center space-y-6">
      {/* Concise Theme Selector */}
      <div className="flex items-center gap-2 bg-[#064D57] p-1.5 border border-white/20 clip-chamfer">
        <span className="font-mono text-xs text-white/60 px-2 uppercase">Theme:</span>
        <button
          onClick={() => setSelectedTheme('certified-cooked')}
          className={`px-3 py-1 font-mono text-xs font-bold transition-all ${
            selectedTheme === 'certified-cooked'
              ? 'bg-[#E9F056] text-[#132F32] shadow-sm'
              : 'text-white/70 hover:text-white'
          }`}
        >
          Wasabi
        </button>
        <button
          onClick={() => setSelectedTheme('crime-scene')}
          className={`px-3 py-1 font-mono text-xs font-bold transition-all ${
            selectedTheme === 'crime-scene'
              ? 'bg-[#FF5C34] text-white shadow-sm'
              : 'text-white/70 hover:text-white'
          }`}
        >
          Topaze
        </button>
        <button
          onClick={() => setSelectedTheme('cold-verdict')}
          className={`px-3 py-1 font-mono text-xs font-bold transition-all ${
            selectedTheme === 'cold-verdict'
              ? 'bg-[#D7EFFF] text-[#132F32] shadow-sm'
              : 'text-white/70 hover:text-white'
          }`}
        >
          Cool Blue
        </button>
      </div>

      {/* Standalone Poster (1080x1350 aspect ratio) */}
      <div className="w-full max-w-[480px] aspect-[1080/1350] shadow-2xl relative overflow-hidden">
        <div
          ref={posterRef}
          className={`w-full h-full p-8 sm:p-10 flex flex-col justify-between ${themeStyles.bg} ${themeStyles.text} select-none relative`}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Header */}
          <div className={`border-b-2 ${themeStyles.border} pb-4 flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 ${themeStyles.accentBg} ${themeStyles.accentText} font-display font-black text-lg flex items-center justify-center rounded-sm`}>
                R
              </span>
              <span className="font-display font-black text-2xl tracking-wider uppercase">
                ROASTIE
              </span>
            </div>
            <div className="text-right font-mono text-xs font-bold">
              <span>{roastData.reportId}</span>
              <span className="block text-[10px] opacity-70">{roastData.createdAt}</span>
            </div>
          </div>

          {/* Body */}
          <div className="my-auto space-y-5">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest block opacity-70 mb-1">
                TARGET WEBSITE
              </span>
              <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight break-all leading-tight">
                {roastData.domain}
              </h2>
            </div>

            {/* Score & Verdict */}
            <div className={`p-4 ${themeStyles.quoteBg} border-2 ${themeStyles.border} shadow-sm flex items-center justify-between gap-4`}>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest block opacity-70">
                  ENTERTAINMENT SCORE
                </span>
                <span className="font-display font-black text-5xl text-[#FF5C34]">
                  {roastData.score}
                  <span className="font-mono text-lg text-[#132F32]/60">/100</span>
                </span>
              </div>
              <div className="text-right">
                <span className={`inline-block font-display font-black text-sm px-3 py-1.5 uppercase tracking-wide ${themeStyles.verdictBg} ${themeStyles.verdictText} border ${themeStyles.border}`}>
                  {roastData.verdict}
                </span>
              </div>
            </div>

            {/* Roast text */}
            <p className="font-body text-base leading-relaxed font-medium">
              "{roastData.roast}"
            </p>

            {/* Punchline */}
            <div className={`p-3.5 border-l-4 ${themeStyles.border} ${themeStyles.accentBg} ${themeStyles.accentText} font-mono text-xs sm:text-sm font-bold leading-snug`}>
              ⚡ {roastData.punchline}
            </div>
          </div>

          {/* Poster Footer */}
          <div className={`border-t-2 ${themeStyles.border} pt-3 flex items-center justify-between font-mono text-[10px] uppercase font-bold opacity-75`}>
            <span>ENTERTAINMENT SCORE</span>
            <span>ROASTIE</span>
          </div>
        </div>
      </div>

      {/* Export & Copy Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
        <button
          onClick={handleDownloadPNG}
          disabled={isExporting}
          className="flex-1 bg-[#E9F056] hover:bg-[#dce34a] text-[#132F32] font-display font-black text-lg py-3.5 px-6 uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:translate-y-0.5 disabled:opacity-60"
        >
          {isExporting ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Generating PNG...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Download roast poster
            </>
          )}
        </button>

        <button
          onClick={handleCopyText}
          className="bg-[#064D57] hover:bg-[#085a66] border border-white/20 text-white font-mono text-xs font-bold py-3.5 px-4 flex items-center justify-center gap-1.5 transition-colors"
          title="Copy roast text"
        >
          {copiedText ? (
            <>
              <Check className="w-4 h-4 text-[#E9F056]" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy text
            </>
          )}
        </button>
      </div>
    </div>
  );
};
