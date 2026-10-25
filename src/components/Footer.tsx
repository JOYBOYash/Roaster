import React, { useState } from 'react';
import { donationConfig } from '../config/donationConfig';
import { Heart, Shield, Terminal } from 'lucide-react';

interface FooterProps {
  onShowSample: () => void;
  onShowHowItWorks: () => void;
  onShowTrending?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onShowSample, onShowHowItWorks, onShowTrending }) => {
  const [showConfigModal, setShowConfigModal] = useState(false);

  return (
    <footer className="w-full bg-[#064D57] border-t border-white/15 text-white/80 py-12 px-4 sm:px-6 mt-16 font-body">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-[#E9F056] text-[#132F32] font-display font-black text-base flex items-center justify-center rounded-sm">
                R
              </div>
              <span className="font-display font-black text-2xl uppercase tracking-wider text-white">
                ROASTIE<span className="text-[#E9F056]">.</span>
              </span>
            </div>
            <p className="font-mono text-xs text-white/60">
              Your website. On trial. Drop a URL, get a score, get cooked.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-mono text-xs">
            <button onClick={onShowTrending} className="hover:text-[#E9F056] transition-colors text-[#E9F056] font-bold">
              🔥 Trending Sites
            </button>
            <button onClick={onShowHowItWorks} className="hover:text-[#E9F056] transition-colors">
              How It Works
            </button>
            <button onClick={onShowSample} className="hover:text-[#E9F056] transition-colors">
              Sample Roast
            </button>
            <button
              onClick={() => setShowConfigModal(true)}
              className="hover:text-[#E9F056] transition-colors flex items-center gap-1 text-white/80 hover:text-white"
            >
              <Terminal className="w-3.5 h-3.5" />
              Owner Config
            </button>
          </div>
        </div>

        {/* Disclaimer & Privacy Note */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-white/60 font-mono">
          <div className="space-y-1">
            <span className="font-bold text-white/80 uppercase block flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-[#E9F056]" /> Entertainment Disclaimer
            </span>
            <p className="leading-relaxed">
              Roastie is a satirical entertainment app. Scores (0-100) and generated roasts are comedic heuristics based on public copy and marketing fluff, not scientific quality assessments or technical SEO audits.
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-white/80 uppercase block">Privacy & Security</span>
            <p className="leading-relaxed">
              Submitted URLs are fetched securely server-side with strict SSRF defense. Extracted page content is analyzed transiently to generate roasts and is never stored or used for training.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-white/50">
          <span>© {new Date().getFullYear()} ROASTIE. All roasts are for entertainment only.</span>
          <span className="flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-[#FF5C34] fill-[#FF5C34]" /> for free internet comedy.
          </span>
        </div>
      </div>

      {/* Owner Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#064D57] border-2 border-[#E9F056] p-6 max-w-lg w-full text-white space-y-4 shadow-2xl clip-chamfer relative">
            <div className="flex items-center justify-between border-b border-white/20 pb-3">
              <h3 className="font-display font-black text-xl uppercase text-[#E9F056]">
                SITE OWNER DONATION SETTINGS
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-white/60 hover:text-white font-mono text-sm"
              >
                [CLOSE]
              </button>
            </div>

            <p className="font-mono text-xs text-white/80 leading-relaxed">
              To enable optional donations in production, edit <code className="bg-black/40 px-1 py-0.5 text-[#E9F056]">src/config/donationConfig.ts</code> and set <code className="text-[#E9F056]">enabled: true</code> with your real donation link or UPI ID.
            </p>

            <div className="bg-[#132F32] p-3 border border-white/10 font-mono text-xs space-y-1">
              <div><strong>Current Status:</strong> {donationConfig.enabled ? 'ENABLED' : 'DISABLED'}</div>
              <div><strong>Title:</strong> {donationConfig.title}</div>
              <div><strong>Link:</strong> {donationConfig.donationUrl || 'None'}</div>
              <div><strong>UPI:</strong> {donationConfig.upiId || 'None'}</div>
            </div>

            <button
              onClick={() => setShowConfigModal(false)}
              className="w-full bg-[#E9F056] text-[#132F32] font-display font-black text-base py-2 uppercase tracking-wide"
            >
              Close Config
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};
