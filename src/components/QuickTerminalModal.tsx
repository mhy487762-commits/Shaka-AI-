import React, { useState } from 'react';
import { Terminal, Send, X, Sparkles, Mic } from 'lucide-react';

interface QuickTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitCommand: (command: string) => void;
}

export const QuickTerminalModal: React.FC<QuickTerminalModalProps> = ({
  isOpen,
  onClose,
  onSubmitCommand,
}) => {
  const [command, setCommand] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    onSubmitCommand(command.trim());
    setCommand('');
    onClose();
  };

  const sampleCommands = [
    'Shaka, volume 65 percent',
    'Shaka, open Chrome',
    'Shaka, Notepad kholo aur agla gaana chalao',
    'Shaka, search YouTube for Windows automation',
    'Shaka, how much RAM is left?',
    'Shaka, minimize window',
    'Shaka, lock PC'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl hud-panel rounded-2xl border border-cyan-500/40 shadow-[0_0_50px_rgba(0,229,255,0.2)] p-6 flex flex-col gap-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">Direct Neural Command Terminal</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="relative">
            <input
              type="text"
              autoFocus
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder='Type any voice instruction e.g. "Shaka, open Chrome and set volume to 50%"'
              className="w-full bg-[#070A0F] border border-cyan-500/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono shadow-inner"
            />
            <button
              type="submit"
              disabled={!command.trim()}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-col gap-1.5 mt-2">
            <span className="text-[11px] font-mono text-slate-400">Try quick commands:</span>
            <div className="flex flex-wrap gap-1.5">
              {sampleCommands.map((sc, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCommand(sc)}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[11px] font-mono text-cyan-300 border border-slate-800 hover:border-cyan-500/30 transition-all text-left"
                >
                  {sc}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
