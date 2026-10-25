import React, { useState } from 'react';
import { donationConfig } from '../config/donationConfig';
import { Heart, X, ExternalLink, QrCode } from 'lucide-react';

interface DonationSupportProps {
  onDismiss?: () => void;
  showAlways?: boolean;
}

export const DonationSupport: React.FC<DonationSupportProps> = ({ onDismiss, showAlways = false }) => {
  const [dismissed, setDismissed] = useState(false);

  // If donation config is disabled in production and not showAlways, don't show
  if (!donationConfig.enabled && !showAlways) {
    return null;
  }

  if (dismissed && !showAlways) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 my-8">
      <div className="bg-[#064D57] border-2 border-[#E9F056] p-6 text-white relative shadow-2xl clip-chamfer">
        {!showAlways && (
          <button
            onClick={() => {
              setDismissed(true);
              if (onDismiss) onDismiss();
            }}
            className="absolute top-4 right-4 text-white/60 hover:text-white p-1 hover:bg-white/10 rounded-sm transition-colors"
            aria-label="Dismiss donation prompt"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-12 h-12 bg-[#E9F056] text-[#132F32] flex items-center justify-center shrink-0 rounded-sm shadow-md">
            <Heart className="w-6 h-6 fill-[#132F32]" />
          </div>

          <div className="space-y-2 flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-mono text-xs bg-[#E9F056] text-[#132F32] font-bold px-2 py-0.5 uppercase">
                OPTIONAL SUPPORT
              </span>
              <span className="font-mono text-xs text-white/60">100% OPTIONAL</span>
            </div>
            <h3 className="font-display font-black text-2xl uppercase text-white tracking-wide">
              {donationConfig.title || 'Support Roastie'}
            </h3>
            <p className="font-body text-sm text-white/80 leading-relaxed max-w-2xl">
              {donationConfig.description}
            </p>

            {/* Configured Donation Methods */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
              {donationConfig.donationUrl && (
                <a
                  href={donationConfig.donationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#E9F056] hover:bg-[#dce34a] text-[#132F32] font-display font-bold text-sm px-4 py-2 uppercase transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>Donate / Tip Creator</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              {donationConfig.upiId && (
                <div className="bg-[#132F32] border border-white/20 px-3 py-1.5 font-mono text-xs text-[#E9F056]">
                  UPI ID: <span className="text-white font-bold">{donationConfig.upiId}</span>
                </div>
              )}

              {donationConfig.qrImageUrl && (
                <div className="flex items-center gap-2 bg-[#132F32] border border-white/20 px-3 py-1.5 font-mono text-xs">
                  <QrCode className="w-4 h-4 text-[#E9F056]" />
                  <span>Scan QR Code</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
