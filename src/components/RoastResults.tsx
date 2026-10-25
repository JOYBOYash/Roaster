import React, { useRef, useState } from 'react';
import { RoastResult } from '../types/roast';
import { RoastPoster } from './RoastPoster';
import { RotateCcw, AlertCircle, Share2, Flame, Check, Copy, ExternalLink } from 'lucide-react';

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
  const exportSectionRef = useRef<HTMLDivElement>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedLinkedInText, setCopiedLinkedInText] = useState(false);

  const scrollToExport = () => {
    exportSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://roastie.app';
  };

  const handleShareTwitter = () => {
    const tweetText = `🔥 "${roastData.punchline}"\n\nMy website (${roastData.domain}) scored ${roastData.score}/100 [${roastData.verdict}] on Roastie!\n\nDrop your URL and get absolutely cooked:`;
    const shareUrl = getShareUrl();
    const twitterIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterIntent, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const handleShareLinkedIn = () => {
    const shareUrl = getShareUrl();
    const linkedInIntent = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInIntent, '_blank', 'noopener,noreferrer,width=600,height=600');
  };

  const handleCopyLinkedInPost = async () => {
    const postText = `My website (${roastData.domain}) just went on trial on Roastie and got absolutely cooked.\n\n🎯 Score: ${roastData.score}/100 (${roastData.verdict})\n\n"${roastData.roast}"\n\n⚡ ${roastData.punchline}\n\nThink your site can survive? Try Roastie: ${getShareUrl()}`;
    try {
      await navigator.clipboard.writeText(postText);
      setCopiedLinkedInText(true);
      setTimeout(() => setCopiedLinkedInText(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Editorial Header Strip */}
      <div className="flex items-center justify-between gap-4 border-b border-white/20 pb-3 font-mono text-xs">
        <div className="flex items-center gap-2 text-[#E9F056]">
          <span className="w-2 h-2 bg-[#E9F056]"></span>
          <span>REPORT ID: {roastData.reportId}</span>
          <span className="text-white/30">|</span>
          <span className="text-white/80">{roastData.createdAt}</span>
        </div>
        <button
          onClick={onReset}
          className="text-white/70 hover:text-[#E9F056] flex items-center gap-1.5 transition-colors uppercase font-bold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Roast Another Site
        </button>
      </div>

      {/* Primary Result Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Score & Verdict Card */}
        <div className="lg:col-span-5 bg-[#064D57] border border-white/20 p-6 sm:p-8 flex flex-col justify-between clip-chamfer-lg shadow-xl">
          <div className="space-y-6">
            <div>
              <span className="font-mono text-xs text-[#E9F056] uppercase tracking-widest block mb-1">
                TARGET DOMAIN
              </span>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-white uppercase break-all">
                {roastData.domain}
              </h2>
            </div>

            {/* Score */}
            <div className="bg-[#132F32] border border-white/10 p-6 rounded-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-white/60 uppercase">
                  ENTERTAINMENT SCORE
                </span>
                <span className="font-mono text-[10px] bg-[#E9F056]/20 text-[#E9F056] border border-[#E9F056]/30 px-2 py-0.5 uppercase">
                  HUMOR METRIC
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-display font-black text-7xl text-[#FF5C34]">
                  {roastData.score}
                </span>
                <span className="font-mono text-2xl text-white/50">/100</span>
              </div>
            </div>

            {/* Verdict Stamp */}
            <div>
              <span className="font-mono text-xs text-white/60 uppercase block mb-2">
                VERDICT LABEL
              </span>
              <div className="bg-[#FF5C34] text-white font-display font-black text-2xl px-4 py-2.5 uppercase tracking-wide inline-block shadow-md">
                {roastData.verdict}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-2 font-mono text-[11px] text-white/50">
            <AlertCircle className="w-3.5 h-3.5 text-[#E9F056]" />
            <span>Score is a humorous heuristic for entertainment only.</span>
          </div>
        </div>

        {/* Roast Text & Actions Panel */}
        <div className="lg:col-span-7 bg-[#D7EFFF] text-[#132F32] p-6 sm:p-8 flex flex-col justify-between border-2 border-black/80 clip-chamfer-lg shadow-xl">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#132F32]/20 pb-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#132F32]">
                VERDICT ANALYSIS
              </span>
              <span className="font-mono text-xs font-bold text-[#132F32]/70 uppercase">
                {roastData.inputMethod === 'url' ? 'URL SCRAPE' : 'PASTED COPY'}
              </span>
            </div>

            <p className="font-body text-lg sm:text-xl font-medium leading-relaxed text-[#132F32]">
              "{roastData.roast}"
            </p>

            <div className="bg-[#132F32] text-[#E9F056] p-4 font-mono text-sm sm:text-base font-bold shadow-sm leading-snug">
              ⚡ {roastData.punchline}
            </div>
          </div>

          {/* Social Media Sharing Strip */}
          <div className="mt-6 pt-5 border-t border-[#132F32]/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-[#132F32] font-bold flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-[#FF5C34]" /> SHARE THIS ROAST
              </span>
              <span className="font-mono text-[11px] text-[#132F32]/60">
                TAG YOUR TEAM
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Twitter / X Button */}
              <button
                onClick={handleShareTwitter}
                className="bg-[#132F32] hover:bg-black text-white font-mono text-xs font-bold px-3.5 py-2.5 rounded-sm flex items-center gap-2 transition-all shadow-sm active:translate-y-0.5"
                title="Share Roast on Twitter / X"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>Share to X / Twitter</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </button>

              {/* LinkedIn Button */}
              <button
                onClick={handleShareLinkedIn}
                className="bg-[#0A66C2] hover:bg-[#084e96] text-white font-mono text-xs font-bold px-3.5 py-2.5 rounded-sm flex items-center gap-2 transition-all shadow-sm active:translate-y-0.5"
                title="Share Roast on LinkedIn"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.762-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span>Share on LinkedIn</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </button>

              {/* Copy Formatted Post for LinkedIn */}
              <button
                onClick={handleCopyLinkedInPost}
                className="bg-white/80 hover:bg-white text-[#132F32] border border-[#132F32]/30 font-mono text-xs font-bold px-3 py-2.5 rounded-sm flex items-center gap-1.5 transition-all"
                title="Copy formatted post text ready for LinkedIn"
              >
                {copiedLinkedInText ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#0A66C2]" />
                    <span className="text-[#0A66C2]">Post Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy LinkedIn Text</span>
                  </>
                )}
              </button>

              {/* Direct Link Copy */}
              <button
                onClick={handleCopyLink}
                className="bg-white/80 hover:bg-white text-[#132F32] border border-[#132F32]/30 font-mono text-xs font-bold px-3 py-2.5 rounded-sm flex items-center gap-1.5 transition-all ml-auto"
                title="Copy App URL"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Link Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="mt-6 pt-5 border-t border-[#132F32]/20 flex flex-wrap items-center gap-4">
            <button
              onClick={scrollToExport}
              className="bg-[#132F32] hover:bg-[#1a3d41] text-[#E9F056] font-display font-black text-lg py-3.5 px-6 uppercase tracking-wider flex items-center gap-2 shadow-md transition-all active:translate-y-0.5"
            >
              <Share2 className="w-5 h-5" />
              Export & Download Poster
            </button>

            <button
              onClick={onReset}
              className="bg-transparent hover:bg-[#132F32]/10 border-2 border-[#132F32] text-[#132F32] font-display font-bold text-base py-3 px-5 uppercase tracking-wide transition-colors flex items-center gap-1.5"
            >
              <Flame className="w-4 h-4 fill-[#132F32]" />
              Roast Another Website
            </button>
          </div>
        </div>
      </div>

      {/* Export Poster Section */}
      <div ref={exportSectionRef} className="pt-8 border-t border-white/20">
        <div className="text-center space-y-2 mb-6">
          <span className="font-mono text-xs text-[#E9F056] uppercase tracking-widest block font-bold">
            03 / FREE POSTER EXPORT
          </span>
          <h2 className="font-display font-black text-4xl uppercase text-white tracking-tight">
            GET YOUR ROAST CARD
          </h2>
          <p className="font-body text-sm text-white/80 max-w-md mx-auto">
            Choose your favorite color theme and download a high-res 1080×1350 PNG for free.
          </p>
        </div>

        <RoastPoster roastData={roastData} onExportSuccess={onExportSuccess} />
      </div>
    </section>
  );
};
