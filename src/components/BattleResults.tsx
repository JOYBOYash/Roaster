import React, { useRef, useState } from 'react';
import { BattleResult } from '../types/roast';
import { Swords, RotateCcw, Share2, Download, Copy, Check, ExternalLink, RefreshCw, Trophy, Skull } from 'lucide-react';
import { toPng } from 'html-to-image';

interface BattleResultsProps {
  battleData: BattleResult;
  onReset: () => void;
  onExportSuccess?: () => void;
}

export const BattleResults: React.FC<BattleResultsProps> = ({
  battleData,
  onReset,
  onExportSuccess,
}) => {
  const posterRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPostText, setCopiedPostText] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== 'undefined') return window.location.origin;
    return 'https://roastie.app';
  };

  const handleShareTwitter = () => {
    const tweetText = `⚔️ ROAST BATTLE RESULT:\nIn ${battleData.siteA.domain} vs ${battleData.siteB.domain}, the AI declared ${battleData.loserDomain} as the WORSE website!\n\n⚡ "${battleData.punchline}"\n\nRun your own battle on Roastie:`;
    const shareUrl = getShareUrl();
    const twitterIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterIntent, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const handleShareLinkedIn = () => {
    const shareUrl = getShareUrl();
    const linkedInIntent = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInIntent, '_blank', 'noopener,noreferrer,width=600,height=600');
  };

  const handleCopyPost = async () => {
    const text = `⚔️ ROAST BATTLE: ${battleData.siteA.domain} VS ${battleData.siteB.domain}\n\n🏆 The AI referee has spoken. ${battleData.loserDomain} is officially the WORSE website!\n\n"${battleData.comparativeRoast}"\n\n⚡ ${battleData.punchline}\n\nReferee your favorite rivalries at: ${getShareUrl()}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPostText(true);
      setTimeout(() => setCopiedPostText(false), 2500);
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

  const handleDownloadPNG = async () => {
    if (!posterRef.current) return;
    setIsExporting(true);

    try {
      const dataUrl = await toPng(posterRef.current, {
        cacheBust: true,
        quality: 0.98,
        pixelRatio: 2,
      });

      const cleanA = battleData.siteA.domain.replace(/[^a-z0-9]/gi, '-');
      const cleanB = battleData.siteB.domain.replace(/[^a-z0-9]/gi, '-');
      const filename = `roastie-battle-${cleanA}-vs-${cleanB}.png`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();

      if (onExportSuccess) onExportSuccess();
    } catch (err) {
      console.error('Error generating battle poster:', err);
      alert('Failed to render poster PNG. Please try again!');
    } finally {
      setIsExporting(false);
    }
  };

  const isSiteALoser = battleData.loserDomain.toLowerCase() === battleData.siteA.domain.toLowerCase();
  const isSiteBLoser = battleData.loserDomain.toLowerCase() === battleData.siteB.domain.toLowerCase();

  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Editorial Header Strip */}
      <div className="flex items-center justify-between gap-4 border-b border-white/20 pb-3 font-mono text-xs">
        <div className="flex items-center gap-2 text-[#FF5C34]">
          <span className="w-2 h-2 bg-[#FF5C34]"></span>
          <span>BATTLE ID: {battleData.id}</span>
          <span className="text-white/30">|</span>
          <span className="text-white/80">{battleData.createdAt}</span>
        </div>
        <button
          onClick={onReset}
          className="text-white/70 hover:text-[#E9F056] flex items-center gap-1.5 transition-colors uppercase font-bold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Battle Another Pair
        </button>
      </div>

      {/* Main Head-to-Head Tale of the Tape */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Site A Card */}
        <div
          className={`p-6 sm:p-8 border-2 clip-chamfer-lg relative shadow-xl flex flex-col justify-between ${
            isSiteALoser
              ? 'bg-[#FF5C34]/15 border-[#FF5C34] text-white'
              : 'bg-[#064D57] border-[#E9F056] text-white'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs uppercase tracking-widest text-white/60">
                CORNER 1
              </span>
              {isSiteALoser ? (
                <span className="bg-[#FF5C34] text-white font-mono text-xs px-2.5 py-1 font-bold uppercase flex items-center gap-1">
                  <Skull className="w-3.5 h-3.5" /> CERTIFIED WORSE
                </span>
              ) : (
                <span className="bg-[#E9F056] text-[#132F32] font-mono text-xs px-2.5 py-1 font-bold uppercase flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" /> SURVIVOR
                </span>
              )}
            </div>

            <h3 className="font-display font-black text-3xl sm:text-4xl uppercase break-all mb-4 text-white">
              {battleData.siteA.domain}
            </h3>

            <div className="bg-[#132F32] p-4 border border-white/10 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] text-white/50 uppercase block">SCORE</span>
                  <span className="font-display font-black text-4xl text-[#FF5C34]">
                    {battleData.siteA.score}<span className="text-sm font-mono text-white/40">/100</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[10px] text-white/50 uppercase block">VERDICT</span>
                  <span className="font-display font-black text-sm uppercase px-2.5 py-1 bg-[#132F32] text-[#E9F056] border border-[#E9F056]/30 inline-block">
                    {battleData.siteA.verdict}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="font-mono text-xs text-white/60">
            {isSiteALoser ? '⚠️ Crowned worse offender' : '✓ Marginally less pretentious'}
          </div>
        </div>

        {/* Site B Card */}
        <div
          className={`p-6 sm:p-8 border-2 clip-chamfer-lg relative shadow-xl flex flex-col justify-between ${
            isSiteBLoser
              ? 'bg-[#FF5C34]/15 border-[#FF5C34] text-white'
              : 'bg-[#064D57] border-[#E9F056] text-white'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs uppercase tracking-widest text-white/60">
                CORNER 2
              </span>
              {isSiteBLoser ? (
                <span className="bg-[#FF5C34] text-white font-mono text-xs px-2.5 py-1 font-bold uppercase flex items-center gap-1">
                  <Skull className="w-3.5 h-3.5" /> CERTIFIED WORSE
                </span>
              ) : (
                <span className="bg-[#E9F056] text-[#132F32] font-mono text-xs px-2.5 py-1 font-bold uppercase flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" /> SURVIVOR
                </span>
              )}
            </div>

            <h3 className="font-display font-black text-3xl sm:text-4xl uppercase break-all mb-4 text-white">
              {battleData.siteB.domain}
            </h3>

            <div className="bg-[#132F32] p-4 border border-white/10 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] text-white/50 uppercase block">SCORE</span>
                  <span className="font-display font-black text-4xl text-[#FF5C34]">
                    {battleData.siteB.score}<span className="text-sm font-mono text-white/40">/100</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[10px] text-white/50 uppercase block">VERDICT</span>
                  <span className="font-display font-black text-sm uppercase px-2.5 py-1 bg-[#132F32] text-[#E9F056] border border-[#E9F056]/30 inline-block">
                    {battleData.siteB.verdict}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="font-mono text-xs text-white/60">
            {isSiteBLoser ? '⚠️ Crowned worse offender' : '✓ Marginally less pretentious'}
          </div>
        </div>
      </div>

      {/* Comparative Roast Section */}
      <div className="bg-[#D7EFFF] text-[#132F32] border-2 border-black/80 p-6 sm:p-8 clip-chamfer-lg shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-[#132F32]/20 pb-3">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-[#FF5C34]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#132F32]">
              AI REFEREE OFFICIAL BREAKDOWN
            </span>
          </div>
          <span className="font-mono text-xs font-bold bg-[#FF5C34] text-white px-2 py-0.5 uppercase">
            LOSER: {battleData.loserDomain}
          </span>
        </div>

        <p className="font-body text-lg sm:text-xl font-medium leading-relaxed text-[#132F32]">
          "{battleData.comparativeRoast}"
        </p>

        <div className="bg-[#132F32] text-[#E9F056] p-4 font-mono text-sm sm:text-base font-bold shadow-sm leading-snug">
          ⚡ {battleData.punchline}
        </div>

        {/* Social Sharing Bar */}
        <div className="pt-4 border-t border-[#132F32]/20 flex flex-wrap items-center gap-3">
          <span className="font-mono text-xs uppercase text-[#132F32] font-bold mr-2">
            SHARE BATTLE VERDICT:
          </span>

          <button
            onClick={handleShareTwitter}
            className="bg-[#132F32] hover:bg-black text-white font-mono text-xs font-bold px-3.5 py-2 flex items-center gap-1.5 transition-all shadow-sm rounded-sm"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>Share to X</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </button>

          <button
            onClick={handleShareLinkedIn}
            className="bg-[#0A66C2] hover:bg-[#084e96] text-white font-mono text-xs font-bold px-3.5 py-2 flex items-center gap-1.5 transition-all shadow-sm rounded-sm"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.762-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
            <span>Share on LinkedIn</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </button>

          <button
            onClick={handleCopyPost}
            className="bg-white/80 hover:bg-white text-[#132F32] border border-[#132F32]/30 font-mono text-xs font-bold px-3 py-2 flex items-center gap-1 rounded-sm"
          >
            {copiedPostText ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#0A66C2]" />
                <span className="text-[#0A66C2]">Text Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Post Text</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopyLink}
            className="bg-white/80 hover:bg-white text-[#132F32] border border-[#132F32]/30 font-mono text-xs font-bold px-3 py-2 flex items-center gap-1 rounded-sm ml-auto"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Standalone Battle Poster Card (Exportable to 1080x1350 PNG) */}
      <div className="pt-8 border-t border-white/20 flex flex-col items-center gap-6">
        <div className="text-center space-y-2">
          <span className="font-mono text-xs text-[#E9F056] uppercase tracking-widest block font-bold">
            FREE BATTLE POSTER
          </span>
          <h3 className="font-display font-black text-3xl uppercase text-white tracking-tight">
            DOWNLOAD THE TALE OF THE TAPE
          </h3>
        </div>

        {/* Poster Render Node */}
        <div className="w-full max-w-[540px] aspect-[1080/1350] shadow-2xl relative overflow-hidden">
          <div
            ref={posterRef}
            className="w-full h-full p-8 sm:p-10 flex flex-col justify-between bg-[#132F32] text-[#F7F8F4] border-2 border-white/20 select-none"
            style={{ width: '100%', height: '100%' }}
          >
            {/* Poster Header */}
            <div className="border-b-2 border-white/20 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 bg-[#FF5C34] text-white font-display font-black text-lg flex items-center justify-center">
                  ⚔️
                </span>
                <span className="font-display font-black text-2xl tracking-wider uppercase text-white">
                  ROAST BATTLE
                </span>
              </div>
              <div className="text-right font-mono text-xs font-bold text-white/70">
                <span>{battleData.id}</span>
                <span className="block text-[10px] text-white/50">{battleData.createdAt}</span>
              </div>
            </div>

            {/* Poster Battle Matchup */}
            <div className="my-auto space-y-5">
              <div className="text-center space-y-1">
                <span className="font-mono text-[11px] uppercase tracking-widest text-[#E9F056]">
                  OFFICIAL TALE OF THE TAPE
                </span>
                <div className="font-display font-black text-3xl uppercase tracking-tight text-white break-all">
                  {battleData.siteA.domain} <span className="text-[#FF5C34]">VS</span> {battleData.siteB.domain}
                </div>
              </div>

              {/* Loser Highlight Box */}
              <div className="bg-[#FF5C34] text-white p-5 border-2 border-black/50 shadow-lg text-center space-y-1">
                <span className="font-mono text-xs uppercase tracking-widest font-black block">
                  💀 CERTIFIED WORSE WEBSITE 💀
                </span>
                <div className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight">
                  {battleData.loserDomain}
                </div>
              </div>

              {/* Comparative Roast */}
              <div className="bg-[#064D57] p-5 border border-white/20 space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#E9F056] block">
                  REFEREE ROAST BREAKDOWN
                </span>
                <p className="font-body text-sm sm:text-base leading-relaxed text-white">
                  "{battleData.comparativeRoast}"
                </p>
              </div>

              {/* Punchline */}
              <div className="bg-[#E9F056] text-[#132F32] p-4 font-mono text-xs sm:text-sm font-bold border-l-4 border-[#FF5C34]">
                ⚡ {battleData.punchline}
              </div>
            </div>

            {/* Poster Footer */}
            <div className="border-t-2 border-white/20 pt-3 flex items-center justify-between font-mono text-[10px] uppercase font-bold text-white/60">
              <span>VERIFIED BATTLE REPORT</span>
              <span>ROASTIE.APP · 100% FREE</span>
            </div>
          </div>
        </div>

        {/* Poster Download Action */}
        <button
          onClick={handleDownloadPNG}
          disabled={isExporting}
          className="bg-[#E9F056] hover:bg-[#dce34a] text-[#132F32] font-display font-black text-xl py-3.5 px-8 uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:translate-y-0.5 disabled:opacity-60"
        >
          {isExporting ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Rendering PNG...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Download Battle Poster (PNG)
            </>
          )}
        </button>
      </div>
    </section>
  );
};
