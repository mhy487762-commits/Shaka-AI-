import React from 'react';
import { Volume2, VolumeX, Chrome, FileText, Folder, Play, Pause, SkipForward, Minimize2, Maximize2, XSquare, Lock, Terminal, Music } from 'lucide-react';

interface QuickActionsGridProps {
  onExecuteCommand: (commandText: string) => void;
  currentVolume: number;
  isMediaPlaying: boolean;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  onExecuteCommand,
  currentVolume,
  isMediaPlaying,
}) => {
  return (
    <div className="hud-panel rounded-xl p-5 border border-cyan-500/20 flex flex-col gap-4">
      <div className="flex items-center justify-between pb-2 border-b border-cyan-500/15">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white tracking-wide">Manual Windows Automation Controls</h3>
        </div>
        <span className="text-xs font-mono text-slate-400">Offline Verified Routines</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* App Launcher: Chrome */}
        <button
          onClick={() => onExecuteCommand('Shaka, open Chrome')}
          className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 hover:border-cyan-500/40 transition-all flex flex-col items-center gap-2 text-center group"
        >
          <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 group-hover:scale-105 transition-transform">
            <Chrome className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium text-slate-200">Open Chrome</span>
        </button>

        {/* App Launcher: Notepad */}
        <button
          onClick={() => onExecuteCommand('Shaka, open Notepad')}
          className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 hover:border-cyan-500/40 transition-all flex flex-col items-center gap-2 text-center group"
        >
          <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 group-hover:scale-105 transition-transform">
            <FileText className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium text-slate-200">Open Notepad</span>
        </button>

        {/* App Launcher: File Explorer */}
        <button
          onClick={() => onExecuteCommand('Shaka, open Explorer')}
          className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 hover:border-cyan-500/40 transition-all flex flex-col items-center gap-2 text-center group"
        >
          <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 group-hover:scale-105 transition-transform">
            <Folder className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium text-slate-200">File Explorer</span>
        </button>

        {/* Volume: 50% */}
        <button
          onClick={() => onExecuteCommand('Shaka, volume 50 percent')}
          className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 hover:border-cyan-500/40 transition-all flex flex-col items-center gap-2 text-center group"
        >
          <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 group-hover:scale-105 transition-transform">
            <Volume2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium text-slate-200">Volume 50%</span>
        </button>

        {/* Volume: Mute */}
        <button
          onClick={() => onExecuteCommand('Shaka, mute audio')}
          className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 hover:border-cyan-500/40 transition-all flex flex-col items-center gap-2 text-center group"
        >
          <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-400 group-hover:scale-105 transition-transform">
            <VolumeX className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium text-slate-200">Mute Audio</span>
        </button>

        {/* Media: Play/Pause */}
        <button
          onClick={() => onExecuteCommand(isMediaPlaying ? 'Shaka, pause music' : 'Shaka, play music')}
          className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 hover:border-cyan-500/40 transition-all flex flex-col items-center gap-2 text-center group"
        >
          <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 group-hover:scale-105 transition-transform">
            {isMediaPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </div>
          <span className="text-xs font-medium text-slate-200">{isMediaPlaying ? 'Pause Music' : 'Play Music'}</span>
        </button>

        {/* Media: Next Track */}
        <button
          onClick={() => onExecuteCommand('Shaka, agla gaana chalao')}
          className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 hover:border-cyan-500/40 transition-all flex flex-col items-center gap-2 text-center group"
        >
          <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 group-hover:scale-105 transition-transform">
            <SkipForward className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium text-slate-200">Next Track</span>
        </button>

        {/* Window: Minimize */}
        <button
          onClick={() => onExecuteCommand('Shaka, minimize window')}
          className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 hover:border-cyan-500/40 transition-all flex flex-col items-center gap-2 text-center group"
        >
          <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 group-hover:scale-105 transition-transform">
            <Minimize2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium text-slate-200">Minimize Window</span>
        </button>

        {/* Window: Maximize */}
        <button
          onClick={() => onExecuteCommand('Shaka, maximize window')}
          className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 hover:border-cyan-500/40 transition-all flex flex-col items-center gap-2 text-center group"
        >
          <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 group-hover:scale-105 transition-transform">
            <Maximize2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium text-slate-200">Maximize Window</span>
        </button>

        {/* Window: Close */}
        <button
          onClick={() => onExecuteCommand('Shaka, close that window')}
          className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 hover:border-cyan-500/40 transition-all flex flex-col items-center gap-2 text-center group"
        >
          <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-400 group-hover:scale-105 transition-transform">
            <XSquare className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium text-slate-200">Close Window</span>
        </button>

        {/* Hardware: Telemetry Check */}
        <button
          onClick={() => onExecuteCommand('Shaka, how much RAM and battery is left?')}
          className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 hover:border-cyan-500/40 transition-all flex flex-col items-center gap-2 text-center group"
        >
          <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 group-hover:scale-105 transition-transform">
            <Terminal className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium text-slate-200">RAM & Hardware</span>
        </button>

        {/* Security: Lock PC */}
        <button
          onClick={() => onExecuteCommand('Shaka, lock PC')}
          className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 hover:border-cyan-500/40 transition-all flex flex-col items-center gap-2 text-center group"
        >
          <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-400 group-hover:scale-105 transition-transform">
            <Lock className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium text-slate-200">Lock Workstation</span>
        </button>
      </div>
    </div>
  );
};
