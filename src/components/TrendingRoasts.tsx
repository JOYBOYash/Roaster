import React, { useState, useEffect } from 'react';
import { TrendingRoast, RoastResult } from '../types/roast';
import { Flame, ArrowUpRight, TrendingUp, Sparkles, Filter } from 'lucide-react';

interface TrendingRoastsProps {
  onSelectRoast: (roast: RoastResult) => void;
  onRoastDomain: (domain: string) => void;
}

export const TrendingRoasts: React.FC<TrendingRoastsProps> = ({
  onSelectRoast,
  onRoastDomain,
}) => {
  const [trendingList, setTrendingList] = useState<TrendingRoast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    let isMounted = true;

    async function fetchTrending() {
      try {
        const response = await fetch('/api/trending');
        const data = await response.json();
        if (isMounted && data.success && Array.isArray(data.data)) {
          setTrendingList(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch trending roasts:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchTrending();
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = ['all', 'AI Fluff', 'Startup Launch', 'Productivity', 'Dev Tools', 'Classifieds', 'Fintech'];

  const filteredList = trendingList.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category?.toLowerCase() === activeCategory.toLowerCase();
  });

  return (
    <section id="trending" className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Editorial Header */}
      <div className="flex items-center justify-between gap-4 border-b border-white/20 pb-3 mb-6 font-mono text-xs">
        <div className="flex items-center gap-2 text-[#E9F056]">
          <span className="w-2 h-2 bg-[#E9F056]"></span>
          <span>03 / HALL OF FLAME</span>
          <span className="text-white/30">|</span>
          <span className="text-white/80">REAL-TIME TRENDING</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#FF5C34] uppercase font-bold">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>MOST ROASTED WEBSITES</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tight text-white">
            TRENDING ON TRIAL
          </h2>
          <p className="font-body text-sm sm:text-base text-white/80 max-w-xl mt-1">
            The web's most roasted startups and platforms. Click any verdict to read the full roast, swap poster themes, or export the card.
          </p>
        </div>

        {/* Filter Category Segmented Control */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#064D57] p-1.5 border border-white/15 clip-chamfer">
          <span className="font-mono text-[10px] text-white/50 uppercase px-2 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {['all', 'AI Fluff', 'Productivity', 'Dev Tools'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 font-mono text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-[#E9F056] text-[#132F32] shadow-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat === 'all' ? 'All Sites' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-[#064D57] border border-white/10 p-6 h-64 animate-pulse clip-chamfer" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((item, index) => {
            const rank = String(index + 1).padStart(2, '0');
            const isTop3 = index < 3;

            return (
              <div
                key={item.domain}
                className="bg-[#064D57] border border-white/20 p-6 flex flex-col justify-between clip-chamfer relative hover:border-[#E9F056] transition-all duration-200 group shadow-lg"
              >
                <div>
                  {/* Top bar with Rank & Category */}
                  <div className="flex items-center justify-between border-b border-white/15 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono text-xs font-bold px-2 py-0.5 border ${
                          isTop3
                            ? 'bg-[#E9F056] text-[#132F32] border-[#E9F056]'
                            : 'bg-black/30 text-white/70 border-white/20'
                        }`}
                      >
                        #{rank}
                      </span>
                      <span className="font-mono text-[11px] text-[#E9F056] uppercase tracking-wider">
                        {item.category || 'Website'}
                      </span>
                    </div>

                    <span className="font-mono text-xs text-[#FF5C34] flex items-center gap-1 font-bold">
                      <Flame className="w-3.5 h-3.5 fill-[#FF5C34]" />
                      {item.roastCount} roasts
                    </span>
                  </div>

                  {/* Target Domain Name */}
                  <div className="mb-4">
                    <h3 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white group-hover:text-[#E9F056] transition-colors break-all">
                      {item.domain}
                    </h3>
                  </div>

                  {/* Score & Verdict Row */}
                  <div className="flex items-center justify-between bg-[#132F32] p-3 border border-white/10 mb-4">
                    <div>
                      <span className="font-mono text-[10px] text-white/50 uppercase block">
                        SCORE
                      </span>
                      <span className="font-display font-black text-3xl text-[#FF5C34]">
                        {item.score}
                        <span className="font-mono text-sm text-white/40">/100</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[10px] text-white/50 uppercase block">
                        VERDICT
                      </span>
                      <span className="font-display font-extrabold text-xs uppercase px-2 py-1 bg-[#FF5C34] text-white inline-block">
                        {item.verdict}
                      </span>
                    </div>
                  </div>

                  {/* Punchline Callout */}
                  <p className="font-body text-xs sm:text-sm text-white/80 line-clamp-3 leading-relaxed mb-4 italic">
                    "{item.punchline}"
                  </p>
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-white/10 flex items-center gap-2">
                  <button
                    onClick={() =>
                      onSelectRoast({
                        domain: item.domain,
                        score: item.score,
                        verdict: item.verdict,
                        roast: item.roast,
                        punchline: item.punchline,
                        reportId: item.reportId,
                        createdAt: item.createdAt,
                        inputMethod: item.inputMethod || 'url',
                      })
                    }
                    className="flex-1 bg-[#E9F056] hover:bg-[#dce34a] text-[#132F32] font-display font-black text-sm py-2 px-3 uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm transition-all active:translate-y-0.5"
                  >
                    <span>View Verdict</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onRoastDomain(item.domain)}
                    className="bg-white/10 hover:bg-white/20 text-white font-mono text-xs py-2 px-3 border border-white/20 transition-colors flex items-center gap-1"
                    title="Re-roast this domain"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#E9F056]" />
                    <span>Re-Roast</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
