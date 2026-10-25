import React from 'react';
import { HistoryItem, RoastResult, BattleResult } from '../types/roast';
import { X, Trash2, ArrowRight, Swords, Flame, Clock } from 'lucide-react';

interface RecentRoastsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectRoast: (roast: RoastResult) => void;
  onSelectBattle: (battle: BattleResult) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export const RecentRoastsDrawer: React.FC<RecentRoastsDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectRoast,
  onSelectBattle,
  onDeleteItem,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-[#064D57] text-[#F7F8F4] border-l-2 border-[#E9F056] shadow-2xl h-full flex flex-col z-10 clip-chamfer-bottom">
        {/* Drawer Header */}
        <div className="p-5 border-b border-white/20 bg-[#132F32] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#E9F056] text-[#132F32] flex items-center justify-center font-display font-black text-lg">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl uppercase tracking-wider text-white">
                MY RECENT ROASTS
              </h2>
              <span className="font-mono text-[11px] text-white/60 block">
                {history.length} {history.length === 1 ? 'RECORD' : 'RECORDS'} SAVED LOCALLY
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/60 hover:text-white p-1 hover:bg-white/10 rounded transition-colors"
            aria-label="Close recent roasts drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {history.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3 font-mono text-xs text-white/60">
              <div className="w-12 h-12 bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-white/40 mb-2">
                <Flame className="w-6 h-6" />
              </div>
              <p className="font-bold text-white/80 uppercase">No recent roasts yet</p>
              <p className="text-[11px] leading-relaxed">
                Roast a website or launch a Roast Battle! Your previous verdicts will automatically be saved here so you can revisit them anytime.
              </p>
            </div>
          ) : (
            history.map((item) => {
              if (item.type === 'battle' && item.battle) {
                const battle = item.battle;
                return (
                  <div
                    key={item.id}
                    className="bg-[#132F32] border border-white/15 p-4 relative group hover:border-[#FF5C34] transition-all clip-chamfer"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                      <span className="font-mono text-[10px] bg-[#FF5C34] text-white font-bold px-1.5 py-0.5 uppercase flex items-center gap-1">
                        <Swords className="w-3 h-3" /> ROAST BATTLE
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-white/50">{battle.id}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteItem(item.id);
                          }}
                          className="text-white/40 hover:text-[#FF5C34] transition-colors p-0.5"
                          title="Delete from history"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 my-2">
                      <div className="font-display font-black text-lg text-white uppercase break-all">
                        {battle.siteA.domain} <span className="text-[#FF5C34]">VS</span> {battle.siteB.domain}
                      </div>
                      <div className="font-mono text-xs text-[#FF5C34] font-bold">
                        LOSER: {battle.loserDomain}
                      </div>
                      <p className="font-body text-xs text-white/70 line-clamp-2 italic">
                        "{battle.punchline}"
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onSelectBattle(battle);
                        onClose();
                      }}
                      className="w-full mt-2 bg-[#FF5C34] hover:bg-[#e04f2a] text-white font-display font-bold text-xs py-1.5 px-3 uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                    >
                      <span>Reload Battle Verdict</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              }

              if (item.single) {
                const single = item.single;
                return (
                  <div
                    key={item.id}
                    className="bg-[#132F32] border border-white/15 p-4 relative group hover:border-[#E9F056] transition-all clip-chamfer"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                      <span className="font-mono text-[10px] bg-[#E9F056] text-[#132F32] font-bold px-1.5 py-0.5 uppercase">
                        SOLO ROAST
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-white/50">{single.reportId}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteItem(item.id);
                          }}
                          className="text-white/40 hover:text-[#FF5C34] transition-colors p-0.5"
                          title="Delete from history"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between gap-2 my-2">
                      <div className="font-display font-black text-lg text-white uppercase break-all flex-1">
                        {single.domain}
                      </div>
                      <div className="font-display font-black text-2xl text-[#FF5C34] shrink-0">
                        {single.score}
                        <span className="font-mono text-xs text-white/50">/100</span>
                      </div>
                    </div>

                    <div className="font-mono text-[10px] text-[#E9F056] uppercase font-bold mb-1">
                      {single.verdict}
                    </div>

                    <p className="font-body text-xs text-white/70 line-clamp-2 mb-3">
                      "{single.punchline}"
                    </p>

                    <button
                      onClick={() => {
                        onSelectRoast(single);
                        onClose();
                      }}
                      className="w-full bg-[#E9F056] hover:bg-[#dce34a] text-[#132F32] font-display font-bold text-xs py-1.5 px-3 uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                    >
                      <span>Reload Verdict</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              }

              return null;
            })
          )}
        </div>

        {/* Drawer Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-white/20 bg-[#132F32] flex items-center justify-between">
            <button
              onClick={onClearAll}
              className="text-xs font-mono text-white/60 hover:text-[#FF5C34] flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
            <span className="font-mono text-[10px] text-white/40">
              STORED IN BROWSER
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
