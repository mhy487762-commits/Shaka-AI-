import React, { useState } from 'react';
import { Terminal, CheckCircle2, RotateCcw, Copy, Trash2, Filter, ShieldCheck } from 'lucide-react';
import { ExecutionResult, CommandCategory } from '../types/shaka';

interface ConsoleHistoryProps {
  history: ExecutionResult[];
  onUndo: (id: string) => void;
  onClear: () => void;
}

export const ConsoleHistory: React.FC<ConsoleHistoryProps> = ({
  history,
  onUndo,
  onClear,
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredHistory = filter === 'all'
    ? history
    : history.filter(item => item.category === filter);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="hud-panel rounded-xl p-5 border border-cyan-500/20 flex flex-col gap-4">
      {/* Console Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/15">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white tracking-wide">Execution Stream & Action Log</h3>
          <span className="text-xs font-mono text-cyan-400 tabular-nums">({filteredHistory.length})</span>
        </div>

        {/* Clear & Copy Actions */}
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              onClick={onClear}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-400 hover:text-rose-400 rounded transition-colors"
              title="Clear execution log"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {['all', 'hardware', 'application', 'window', 'media', 'system'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 rounded-md capitalize font-mono transition-all whitespace-nowrap ${
              filter === cat
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 border border-transparent hover:border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* History Items Container */}
      <div className="flex flex-col gap-2.5 max-h-[360px] overflow-y-auto pr-1">
        {filteredHistory.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
            <Terminal className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-sm font-medium">No system commands logged yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Speak to Shaka using the microphone or click quick action buttons to dispatch commands.
            </p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div 
              key={item.id}
              className="bg-[#070A0F]/80 rounded-lg p-3 border border-cyan-500/15 hover:border-cyan-500/35 transition-all flex flex-col gap-2"
            >
              {/* Row 1: Timestamp + Mode + Category + Language */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 tabular-nums">{item.timestamp}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-300 font-semibold uppercase">{item.category}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-cyan-300/80">Lang: {item.detectedLanguage}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    item.executionMode === 'offline-deterministic'
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                      : 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {item.executionMode === 'offline-deterministic' ? 'OFFLINE VERIFIED' : 'ONLINE BRAIN'}
                  </span>
                </div>
              </div>

              {/* Row 2: Spoken / Typed Prompt */}
              <div className="text-sm text-slate-200 font-medium">
                "{item.rawInput}"
              </div>

              {/* Row 3: Verified Outcome & Action detail */}
              <div className="bg-slate-950/60 rounded p-2 text-xs font-mono text-slate-300 border border-slate-800/80 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-emerald-300 font-medium">{item.verifiedOutcome}</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">{item.actionTaken}</div>
                  </div>
                </div>

                {/* Undo Button if supported */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.canUndo && (
                    <button
                      onClick={() => onUndo(item.id)}
                      className="p-1 text-slate-400 hover:text-cyan-300 transition-colors"
                      title="Undo this action"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => copyToClipboard(item.verifiedOutcome, item.id)}
                    className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                    title="Copy details"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
