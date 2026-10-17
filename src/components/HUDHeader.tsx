import React from 'react';
import { Shield, Wifi, WifiOff, Terminal, Zap } from 'lucide-react';

interface HUDHeaderProps {
  activeTab: 'cockpit' | 'telemetry' | 'voice' | 'memory' | 'package';
  setActiveTab: (tab: 'cockpit' | 'telemetry' | 'voice' | 'memory' | 'package') => void;
  isOnlineMode: boolean;
  setIsOnlineMode: (online: boolean) => void;
  isSocketConnected: boolean;
  onOpenQuickTerminal: () => void;
}

export const HUDHeader: React.FC<HUDHeaderProps> = ({
  activeTab,
  setActiveTab,
  isOnlineMode,
  setIsOnlineMode,
  isSocketConnected,
  onOpenQuickTerminal,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-cyan-500/20 bg-[#070A0F]/90 backdrop-blur-md sticky top-0 z-50">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a 
          href="#cockpit" 
          onClick={(e) => { e.preventDefault(); setActiveTab('cockpit'); }}
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white whitespace-nowrap group"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(0,229,255,0.4)]">
            <Zap className="w-4 h-4 text-slate-950" />
          </div>
          <span className="font-extrabold tracking-wider bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
            PROJECT SHAKA
          </span>
          <span className="text-[10px] font-mono tracking-widest text-cyan-400/80 px-1.5 py-0.5 border border-cyan-500/30 rounded bg-cyan-950/40">
            JARVIS // OS
          </span>
        </a>
      </div>

      {/* Zone 2: Navigation Links (Single Line, 4-5 items) */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('cockpit')}
          className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'cockpit' 
              ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Cockpit HUD
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'telemetry' 
              ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          System Diagnostics
        </button>

        <button
          onClick={() => setActiveTab('voice')}
          className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'voice' 
              ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Speech & Languages
        </button>

        <button
          onClick={() => setActiveTab('memory')}
          className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'memory' 
              ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Memory & Routines
        </button>

        <button
          onClick={() => setActiveTab('package')}
          className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'package' 
              ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Python Server Setup
        </button>
      </nav>

      {/* Zone 3: Connection Status & 1 Primary Action */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Local PC Bridge Status */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
          <span 
            className={`w-2 h-2 rounded-full ${
              isSocketConnected 
                ? 'bg-emerald-400 shadow-[0_0_8px_#10B981]' 
                : 'bg-amber-400 shadow-[0_0_8px_#F59E0B]'
            }`} 
          />
          <span>{isSocketConnected ? '127.0.0.1:8765 LINKED' : 'SIMULATION MODE'}</span>
        </div>

        {/* Online / Offline switch */}
        <button
          onClick={() => setIsOnlineMode(!isOnlineMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
            isOnlineMode
              ? 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300'
              : 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
          }`}
          title={isOnlineMode ? "Online Intelligence enabled (Gemini 3.8 Flash)" : "Pure Offline Mode enabled (100% Local PC execution)"}
        >
          {isOnlineMode ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span>{isOnlineMode ? 'ONLINE' : 'OFFLINE'}</span>
        </button>

        {/* Primary Action Button */}
        <button
          onClick={onOpenQuickTerminal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-[0_0_12px_rgba(0,229,255,0.4)] transition-all whitespace-nowrap"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Quick Command</span>
        </button>
      </div>
    </header>
  );
};
