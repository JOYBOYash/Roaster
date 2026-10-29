import React, { useState } from 'react';
import { ArrowRight, RefreshCw, AlertCircle, FileText, Flame, Globe, Music2 } from 'lucide-react';

interface HeroProps {
  onRoastSubmit: (input: { url?: string; pastedText?: string; musicText?: string; mode?: 'website' | 'music' }) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
  canPasteFallback: boolean;
  onHowItWorksClick: () => void;
  onClearError: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onRoastSubmit,
  isLoading,
  errorMessage,
  canPasteFallback,
  onHowItWorksClick,
  onClearError,
}) => {
  const [roastMode, setRoastMode] = useState<'website' | 'music'>('website');
  const [urlInput, setUrlInput] = useState('');
  const [musicText, setMusicText] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [usePastedMode, setUsePastedMode] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    onClearError();

    if (roastMode === 'music') {
      const tracks = musicText.split(/\r?\n/).map((track) => track.trim()).filter(Boolean);
      if (tracks.length < 3) {
        setValidationError('Add at least three tracks or artists, one per line.');
        return;
      }
      if (tracks.length > 20) {
        setValidationError('Keep it to 20 tracks or artists per roast.');
        return;
      }
      await onRoastSubmit({ mode: 'music', musicText: tracks.join('\n') });
      return;
    }

    if (usePastedMode) {
      if (!pastedText.trim()) {
        setValidationError('Paste the website copy first.');
        return;
      }
      await onRoastSubmit({ pastedText: pastedText.trim() });
      return;
    }

    if (!urlInput.trim()) {
      setValidationError('Enter a website URL first.');
      return;
    }

    const trimmedUrl = urlInput.trim();
    const cleanedUrl = /^https?:\/\//i.test(trimmedUrl)
      ? trimmedUrl.replace(/^https?:\/\//i, (protocol) => protocol.toLowerCase())
      : `https://${trimmedUrl}`;

    const parsedUrl = new URL(cleanedUrl);
    const isPrivateChatLink =
      (parsedUrl.hostname === 'chatgpt.com' || parsedUrl.hostname === 'chat.openai.com') &&
      parsedUrl.pathname.startsWith('/c/');

    if (isPrivateChatLink) {
      setValidationError('ChatGPT conversation links are private. Paste the page copy below.');
      setUsePastedMode(true);
      return;
    }

    await onRoastSubmit({ url: cleanedUrl });
  };

  const switchRoastMode = (mode: 'website' | 'music') => {
    setRoastMode(mode);
    setUsePastedMode(false);
    setValidationError(null);
    onClearError();
  };

  const switchInputMode = () => {
    setUsePastedMode((current) => !current);
    setValidationError(null);
    onClearError();
  };

  return (
    <section className="mx-auto w-full max-w-4xl px-4 pb-16 pt-12 text-center sm:px-6 sm:pt-16">
      <div className="mb-9 space-y-3">
        <h1 className="font-display text-5xl font-bold leading-[0.98] tracking-tight text-white sm:text-6xl lg:text-7xl">
          {roastMode === 'music' ? 'Your playlist.' : 'Your website.'}
          <br />
          <span className="text-[#E9F056]">On trial.</span>
        </h1>
        <p className="font-body text-lg text-white/85 sm:text-xl">
          {roastMode === 'music' ? 'Paste your tracks. Get absolutely cooked.' : 'Drop a URL. Get absolutely cooked.'}
        </p>
      </div>

      <div className="mx-auto w-full max-w-xl border border-white/20 bg-[#064D57] p-5 text-left sm:p-6">
        <div className="mb-4 flex items-center gap-5 border-b border-white/15 pb-3" role="group" aria-label="Roast mode">
          <button type="button" aria-pressed={roastMode === 'website'} onClick={() => switchRoastMode('website')} className={'cursor-pointer border-b-2 pb-2 text-sm font-semibold transition-colors ' + (roastMode === 'website' ? 'border-[#E9F056] text-white' : 'border-transparent text-white/60 hover:text-white')}>
            Website roast
          </button>
          <button type="button" aria-pressed={roastMode === 'music'} onClick={() => switchRoastMode('music')} className={'inline-flex cursor-pointer items-center gap-1.5 border-b-2 pb-2 text-sm font-semibold transition-colors ' + (roastMode === 'music' ? 'border-[#E9F056] text-white' : 'border-transparent text-white/60 hover:text-white')}>
            <Music2 className="h-4 w-4" aria-hidden="true" />
            Music taste
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {roastMode === 'music' ? (
            <div className="w-full">
              <label htmlFor="music-track-list" className="sr-only">Tracks and artists</label>
              <textarea id="music-track-list" value={musicText} onChange={(e) => { setMusicText(e.target.value); setValidationError(null); onClearError(); }} placeholder="Paste 3-20 tracks or artists, one per line" disabled={isLoading} rows={5} className="w-full resize-y border border-[#FF5C34]/75 bg-[#103E43] p-4 font-body text-base text-white placeholder-white/50 transition-colors hover:border-[#FF8A70] focus:border-[#E9F056] focus:outline-none focus:ring-2 focus:ring-[#E9F056]/20 disabled:cursor-not-allowed disabled:opacity-60" />
              <p className="mt-2 text-sm text-white/65">No Spotify login. Roast only uses the list you paste.</p>
            </div>
          ) : !usePastedMode ? (
            <div className="group mx-auto w-full max-w-[400px] sm:mx-0">
              <label htmlFor="target-website-url" className="sr-only">
                Website URL
              </label>
              <div className="relative border border-[#FF5C34]/75 bg-[#103E43] transition-colors duration-200 hover:border-[#FF8A70] focus-within:border-[#E9F056] focus-within:ring-2 focus-within:ring-[#E9F056]/20">
                <Globe
                  className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#FF8A70] transition-colors group-focus-within:text-[#E9F056]"
                  aria-hidden="true"
                />
                <input
                  id="target-website-url"
                  type="text"
                  inputMode="url"
                  autoComplete="url"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    setValidationError(null);
                    onClearError();
                  }}
                  placeholder="yourwebsite.com"
                  disabled={isLoading}
                  className="w-full border-0 bg-transparent py-4 pl-11 pr-4 font-body text-base text-white placeholder-white/45 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>
          ) : (
            <div className="w-full">
              <label htmlFor="target-website-copy" className="sr-only">
                Website copy
              </label>
              <textarea
                id="target-website-copy"
                value={pastedText}
                onChange={(e) => {
                  setPastedText(e.target.value);
                  setValidationError(null);
                  onClearError();
                }}
                placeholder="Paste the page copy or headlines here"
                disabled={isLoading}
                rows={4}
                className="w-full resize-y border border-white/25 bg-[#132F32] p-3.5 font-body text-base text-white placeholder-white/50 transition-colors focus:border-[#E9F056] focus:outline-none focus:ring-1 focus:ring-[#E9F056] disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          )}

          {(validationError || errorMessage) && (
            <div role="alert" className="flex items-start gap-2 border-l-2 border-[#FF5C34] bg-[#132F32] px-3 py-3 text-sm text-white">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#FF8A70]" aria-hidden="true" />
              <div className="space-y-2">
                <p>{validationError || errorMessage}</p>
                {canPasteFallback && roastMode === 'website' && !usePastedMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setUsePastedMode(true);
                      setValidationError(null);
                      onClearError();
                    }}
                    className="cursor-pointer text-left text-sm font-semibold text-[#E9F056] underline underline-offset-4 hover:text-white"
                  >
                    Paste page copy instead
                  </button>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="group relative inline-flex min-h-[58px] w-full cursor-pointer items-center justify-center gap-3 overflow-hidden border border-[#E9F056] bg-[#E9F056] px-5 py-4 font-display text-base font-extrabold uppercase tracking-[0.075em] text-[#132F32] transition-[background-color,transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-[#F2F5A0] hover:bg-[#F0F49A] active:translate-y-px disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 sm:text-lg"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-[18px] w-[18px] animate-spin" aria-hidden="true" />
                {roastMode === 'music' ? 'Roasting taste...' : 'Roasting...'}
              </>
            ) : (
              <>
                {roastMode === 'music' ? (
                  <Music2 className="h-[19px] w-[19px]" aria-hidden="true" />
                ) : (
                  <Flame className="h-[19px] w-[19px] fill-current transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-110" aria-hidden="true" />
                )}
                <span>{roastMode === 'music' ? 'Roast my taste' : 'Roast this site'}</span>
                <ArrowRight className="h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-white/15 pt-4 text-sm text-white/75">
          {roastMode === 'website' && <button
            type="button"
            onClick={switchInputMode}
            className="inline-flex cursor-pointer items-center gap-2 transition-colors hover:text-[#E9F056]"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            {usePastedMode ? 'Use a URL instead' : 'Paste page copy'}
          </button>}
          <button
            type="button"
            onClick={onHowItWorksClick}
            className="cursor-pointer underline underline-offset-4 transition-colors hover:text-[#E9F056]"
          >
            How it works
          </button>
        </div>
      </div>
    </section>
  );
};
