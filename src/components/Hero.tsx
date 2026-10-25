import React, { useState } from 'react';
import { ArrowRight, RefreshCw, AlertCircle, FileText } from 'lucide-react';

interface HeroProps {
  onRoastSubmit: (input: { url?: string; pastedText?: string }) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
  canPasteFallback: boolean;
  onHowItWorksClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onRoastSubmit,
  isLoading,
  errorMessage,
  canPasteFallback,
  onHowItWorksClick,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [usePastedMode, setUsePastedMode] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (usePastedMode) {
      if (!pastedText.trim()) {
        setValidationError('Please enter or paste the website copy.');
        return;
      }
      await onRoastSubmit({ pastedText: pastedText.trim() });
    } else {
      if (!urlInput.trim()) {
        setValidationError('Please enter a website URL.');
        return;
      }
      let cleanedUrl = urlInput.trim();
      if (!cleanedUrl.startsWith('http://') && !cleanedUrl.startsWith('https://')) {
        cleanedUrl = 'https://' + cleanedUrl;
      }
      await onRoastSubmit({ url: cleanedUrl });
    }
  };

  return (
    <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-16 text-center">
      {/* Primary Headline & Supporting Copy */}
      <div className="space-y-4 mb-10">
        <h1 className="font-display font-black text-6xl sm:text-7xl lg:text-8xl tracking-tight leading-[0.9] uppercase text-white">
          YOUR WEBSITE.<br />
          <span className="text-[#E9F056]">ON TRIAL.</span>
        </h1>
        <p className="font-body text-xl sm:text-2xl text-white/90 font-normal">
          Drop a URL. Get absolutely cooked.
        </p>
      </div>

      {/* Primary URL Form Container */}
      <div className="w-full max-w-xl mx-auto bg-[#064D57] border border-white/20 p-6 sm:p-8 clip-chamfer-lg shadow-2xl text-left">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!usePastedMode ? (
            <div>
              <label htmlFor="target-website-url" className="sr-only">
                Website URL
              </label>
              <input
                id="target-website-url"
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="yourwebsite.com"
                disabled={isLoading}
                className="w-full bg-[#132F32] border border-white/20 text-white placeholder-white/40 px-4 py-3.5 font-mono text-base focus:outline-none focus:border-[#E9F056] focus:ring-1 focus:ring-[#E9F056] transition-all"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="target-website-copy" className="sr-only">
                Website Copy
              </label>
              <textarea
                id="target-website-copy"
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste the public copy or headlines from the website here..."
                disabled={isLoading}
                rows={4}
                className="w-full bg-[#132F32] border border-white/20 text-white placeholder-white/40 p-3.5 font-mono text-xs focus:outline-none focus:border-[#E9F056] focus:ring-1 focus:ring-[#E9F056] transition-all resize-none"
              />
            </div>
          )}

          {/* Validation & Error Messaging */}
          {(validationError || errorMessage) && (
            <div className="bg-[#FF5C34]/20 border border-[#FF5C34] text-white p-3 text-xs font-mono flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#FF5C34] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p>{validationError || errorMessage}</p>
                {canPasteFallback && !usePastedMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setUsePastedMode(true);
                      setValidationError(null);
                    }}
                    className="text-[#E9F056] font-bold underline hover:text-white transition-colors block"
                  >
                    Paste the website copy directly instead →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#E9F056] hover:bg-[#dce34a] text-[#132F32] font-display font-black text-xl tracking-wider py-4 px-6 uppercase transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed active:translate-y-0.5"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin" />
                Analyzing website content...
              </span>
            ) : (
              <>
                <span>Roast this site</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Honest Input Option & Secondary Link */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/60">
          <button
            type="button"
            onClick={() => {
              setUsePastedMode(!usePastedMode);
              setValidationError(null);
            }}
            className="hover:text-[#E9F056] transition-colors flex items-center gap-1"
          >
            <FileText className="w-3 h-3" />
            {usePastedMode ? 'Switch to URL input' : 'Paste text directly'}
          </button>

          <button
            type="button"
            onClick={onHowItWorksClick}
            className="hover:text-[#E9F056] transition-colors underline decoration-dotted"
          >
            How it works
          </button>
        </div>
      </div>
    </section>
  );
};
