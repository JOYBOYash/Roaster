import React from 'react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Submit URL',
      desc: 'Enter any public website URL or paste public-facing page copy.',
    },
    {
      num: '02',
      title: 'Analyze & Roast',
      desc: 'We inspect visible copy and generate a humorous entertainment score and witty roast.',
    },
    {
      num: '03',
      title: 'Free Poster Export',
      desc: 'Download a clean 1080×1350 PNG roast card in your choice of three visual themes.',
    },
  ];

  return (
    <section id="how-it-works" className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 border-t border-white/10">
      <h2 className="font-display font-black text-2xl uppercase tracking-wider text-white mb-6">
        How Roastie works
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((s) => (
          <div key={s.num} className="bg-[#064D57] border border-white/15 p-5 clip-chamfer space-y-2">
            <span className="font-mono text-xs text-[#E9F056] font-bold block">
              {s.num}
            </span>
            <h3 className="font-display font-bold text-xl uppercase text-white">
              {s.title}
            </h3>
            <p className="font-body text-xs text-white/80 leading-relaxed">
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
