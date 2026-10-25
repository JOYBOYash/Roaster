import React from 'react';
import { Globe, Flame, Download } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'DROP THE URL',
      icon: Globe,
      color: 'bg-[#D7EFFF] text-[#132F32]',
      description: 'Enter any public website address or paste its copy. We fetch the public HTML and analyze headings, text, and marketing fluff.',
    },
    {
      number: '02',
      title: 'GET COOKED',
      icon: Flame,
      color: 'bg-[#FF5C34] text-white',
      description: 'Our server calculates an entertainment score (0-100) and drafts a witty, savage 30-60 word AI roast and punchline.',
    },
    {
      number: '03',
      title: 'EXPORT THE DAMAGE',
      icon: Download,
      color: 'bg-[#E9F056] text-[#132F32]',
      description: 'Download a beautifully styled 1080×1350 PNG roast card in 3 visual themes. 100% free with zero watermark or paywall.',
    },
  ];

  return (
    <section id="how-it-works" className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Framed Section Header */}
      <div className="flex items-center justify-between gap-4 border-b border-white/20 pb-3 mb-8">
        <div className="flex items-center gap-2 font-mono text-xs text-[#E9F056]">
          <span className="w-2 h-2 bg-[#E9F056]"></span>
          <span>02 / THE PROCESS</span>
        </div>
        <h2 className="font-display font-bold text-2xl uppercase tracking-wider text-white">
          HOW ROASTIE WORKS
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step) => {
          const IconComponent = step.icon;
          return (
            <div
              key={step.number}
              className="bg-[#064D57] border border-white/15 p-6 flex flex-col justify-between clip-chamfer relative hover:border-[#E9F056]/50 transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-sm font-bold text-[#E9F056] border border-[#E9F056]/30 px-2 py-0.5">
                    {step.number}
                  </span>
                  <div className={`p-2.5 rounded-sm ${step.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="font-display font-black text-2xl uppercase tracking-wide text-white mb-2">
                  {step.title}
                </h3>

                <p className="font-body text-sm text-white/80 leading-relaxed font-normal">
                  {step.description}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-white/10 font-mono text-[10px] text-white/50">
                <span>STAGE {step.number} OF 03</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
