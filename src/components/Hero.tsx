import React, { useState } from 'react';
import { Flame, ArrowRight, FileText, AlertCircle, RefreshCw } from 'lucide-react';

interface HeroProps {
  onRoastSubmit: (input: { url?: string; pastedText?: string }) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
  canPasteFallback: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  onRoastSubmit,
  isLoading,
  errorMessage,
  canPasteFallback,
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
        setValidationError('Please paste your website copy or headline text.');
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
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-12">
      {/* Editorial Header Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-white/15 pb-2 mb-8 font-mono text-xs text-white/70">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#E9F056]"></span>
          <span>REPORT / 01</span>
          <span className="text-white/30">|</span>
          <span className="uppercase text-[#E9F056]">ENTERTAINMENT VERDICT</span>
        </div>
        <div>
          <span>PUBLIC TRIAL</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Main Headline & Form Area */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h1 className="font-display font-black text-6xl sm:text-7xl lg:text-8xl tracking-tight leading-[0.9] uppercase text-white">
              YOUR WEBSITE.<br />
              <span className="text-[#E9F056]">ON TRIAL.</span>
            </h1>
            <p className="font-body text-lg sm:text-xl text-white/90 max-w-xl font-normal leading-relaxed">
              Drop a URL. Get a score. Get absolutely cooked. No fluff, no SEO audit lists, just savage comedy.
            </p>
          </div>

          {/* Form Box */}
          <div className="bg-[#064D57] border border-white/20 p-5 sm:p-6 shadow-xl relative clip-chamfer-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs uppercase tracking-wider text-[#E9F056]">
                {usePastedMode ? '01 / PASTE WEBSITE COPY' : '01 / ENTER TARGET URL'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setUsePastedMode(!usePastedMode);
                  setValidationError(null);
                }}
                className="font-mono text-xs text-white/70 hover:text-[#E9F056] underline decoration-dashed flex items-center gap-1 transition-colors"
              >
                {usePastedMode ? (
                  <>
                    <RefreshCw className="w-3 h-3" /> Switch to URL Input
                  </>
                ) : (
                  <>
                    <FileText className="w-3 h-3" /> Paste Page Copy Directly
                  </>
                )}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!usePastedMode ? (
                <div>
                  <label htmlFor="website-url" className="sr-only">Website URL</label>
                  <div className="relative">
                    <input
                      id="website-url"
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://myawesomestartup.com"
                      disabled={isLoading}
                      className="w-full bg-[#132F32] border border-white/20 text-white placeholder-white/40 px-4 py-3.5 font-mono text-sm focus:outline-none focus:border-[#E9F056] focus:ring-1 focus:ring-[#E9F056] transition-all"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label htmlFor="website-copy" className="sr-only">Website Copy</label>
                  <textarea
                    id="website-copy"
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Paste headline, subhead, and body text from the website here..."
                    disabled={isLoading}
                    rows={4}
                    className="w-full bg-[#132F32] border border-white/20 text-white placeholder-white/40 p-3.5 font-mono text-xs focus:outline-none focus:border-[#E9F056] focus:ring-1 focus:ring-[#E9F056] transition-all resize-none"
                  />
                </div>
              )}

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
                        className="text-[#E9F056] font-bold underline hover:text-white transition-colors block mt-1"
                      >
                        Click here to paste site copy instead!
                      </button>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#E9F056] hover:bg-[#dce34a] text-[#132F32] font-display font-black text-xl tracking-wider py-4 px-6 uppercase transition-all duration-150 flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed active:translate-y-0.5"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Analyzing website & drafting roast...
                  </span>
                ) : (
                  <>
                    <Flame className="w-5 h-5 fill-[#132F32]" />
                    <span>Roast This Site</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <p className="font-mono text-[11px] text-white/60 mt-3 text-center">
              100% Free · Instant Score & Roast · No Account or Payment Required
            </p>
          </div>
        </div>

        {/* Fictional Sample Roast Card */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="bg-[#D7EFFF] text-[#132F32] p-6 border-2 border-black/80 shadow-2xl relative clip-chamfer-lg">
            <div className="flex items-center justify-between border-b border-[#132F32]/20 pb-3 mb-4">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#132F32]">
                FICTIONAL SAMPLE ROAST
              </span>
              <span className="font-mono text-[11px] text-[#132F32]/60">
                RST-7702
              </span>
            </div>

            <div className="flex items-baseline justify-between mb-4">
              <div>
                <span className="font-mono text-xs text-[#132F32]/70 uppercase block">TARGET DOMAIN</span>
                <span className="font-display font-extrabold text-2xl uppercase tracking-tight text-[#132F32]">
                  synergy-ai-cloud.io
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs text-[#132F32]/70 uppercase block">SCORE</span>
                <span className="font-display font-black text-4xl text-[#FF5C34]">
                  23<span className="text-lg font-mono text-[#132F32]/60">/100</span>
                </span>
              </div>
            </div>

            <div className="bg-[#FF5C34] text-white font-display font-black text-lg px-3 py-1 uppercase tracking-wide inline-block mb-4">
              CERTIFIED INTERNET CRIME
            </div>

            <p className="font-body text-sm leading-relaxed text-[#132F32] font-medium mb-4">
              "You managed to fit 'paradigm shift', 'seamless synergy', and 'AI-driven empowerment' into a single hero paragraph without once explaining what your app actually does. It reads like a tech buzzword generator threw up on a dark background."
            </p>

            <div className="bg-white/80 p-3 border-l-4 border-[#132F32] text-xs font-mono text-[#132F32] font-bold">
              ⚡ "Your website doesn't sell software; it sells corporate hallucinations."
            </div>

            <div className="mt-4 pt-3 border-t border-[#132F32]/20 flex items-center justify-between font-mono text-[10px] text-[#132F32]/60">
              <span>ENTERTAINMENT VERDICT</span>
              <span>100% FREE EXPORT</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
