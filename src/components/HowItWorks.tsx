import React from 'react';

const steps = [
  {
    num: '01',
    title: 'Drop a URL',
    desc: 'Enter a public website URL, paste page copy, or list your tracks.',
  },
  {
    num: '02',
    title: 'Get roasted',
    desc: 'Roastie writes a joke based on the supplied text.',
  },
  {
    num: '03',
    title: 'Share the card',
    desc: 'Download a simple image or copy the roast.',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="mx-auto w-full max-w-4xl border-t border-white/15 px-4 py-12 sm:px-6 sm:py-16">
      <h2 className="mb-8 text-2xl font-bold tracking-tight text-white">
        How it works
      </h2>

      <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
        {steps.map((step) => (
          <article key={step.num} className="border-t-2 border-[#E9F056]/70 pt-4">
            <p className="mb-3 text-sm text-white/60">{step.num}</p>
            <h3 className="mb-2 text-lg font-semibold text-white">{step.title}</h3>
            <p className="text-sm leading-relaxed text-white/75">{step.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
};
