import React, { useEffect, useRef } from 'react';
import { ShakaState } from '../types/shaka';

interface ArcReactorHUDProps {
  state: ShakaState;
  audioLevel: number; // 0 to 1
  onClick?: () => void;
  languageLabel: string;
}

export const ArcReactorHUD: React.FC<ArcReactorHUDProps> = ({
  state,
  audioLevel,
  onClick,
  languageLabel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dynamic colors based on system state
  const stateColor = {
    idle: { primary: '#00E5FF', glow: 'rgba(0, 229, 255, 0.45)', text: 'STANDBY // READY' },
    listening: { primary: '#10B981', glow: 'rgba(16, 185, 129, 0.65)', text: 'LISTENING FOR SHAKA...' },
    processing: { primary: '#F59E0B', glow: 'rgba(245, 158, 11, 0.65)', text: 'NEURAL ROUTING...' },
    executing: { primary: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.65)', text: 'EXECUTING PC COMMAND' },
    speaking: { primary: '#00E5FF', glow: 'rgba(0, 229, 255, 0.8)', text: 'TRANSMITTING VOICE' },
  }[state];

  // Particle aura on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw audio reactive ring
      const baseRadius = 88;
      const pulse = audioLevel * 22;
      const currentRadius = baseRadius + pulse;

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
      ctx.strokeStyle = stateColor.glow;
      ctx.lineWidth = 2 + audioLevel * 3;
      ctx.stroke();

      // Equalizer ray spikes
      const rayCount = 36;
      for (let i = 0; i < rayCount; i++) {
        const rad = (i * 2 * Math.PI) / rayCount + angle * 0.01;
        const spikeLen = 6 + (Math.sin(angle * 2 + i) + 1) * 8 * (state === 'listening' || state === 'speaking' ? Math.max(audioLevel * 1.5, 0.2) : 0.2);
        const x1 = centerX + Math.cos(rad) * (currentRadius + 6);
        const y1 = centerY + Math.sin(rad) * (currentRadius + 6);
        const x2 = centerX + Math.cos(rad) * (currentRadius + 6 + spikeLen);
        const y2 = centerY + Math.sin(rad) * (currentRadius + 6 + spikeLen);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = i % 3 === 0 ? stateColor.primary : 'rgba(0, 229, 255, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.restore();

      angle += 0.02;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, audioLevel, stateColor]);

  return (
    <div className="relative flex flex-col items-center justify-center p-6 select-none">
      {/* Container with click to toggle mic */}
      <div 
        onClick={onClick}
        className="relative w-72 h-72 flex items-center justify-center cursor-pointer group transition-transform active:scale-95"
        title="Click to activate / toggle voice listening"
      >
        {/* Background Ambient Glow */}
        <div 
          className="absolute inset-0 rounded-full transition-all duration-500 blur-2xl opacity-40 group-hover:opacity-70 pointer-events-none"
          style={{ backgroundColor: stateColor.primary }}
        />

        {/* Canvas for Particle Aura & Equalizer Spikes */}
        <canvas 
          ref={canvasRef} 
          width={300} 
          height={300} 
          className="absolute inset-0 pointer-events-none"
        />

        {/* Outer Tech Ring with Rotating Segment Notches */}
        <div className="absolute w-64 h-64 rounded-full border border-cyan-500/20 animate-spin-slow">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_#00E5FF]" />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_#00E5FF]" />
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_#00E5FF]" />
          <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_#00E5FF]" />
        </div>

        {/* Counter-Rotating Segment Ring */}
        <div className="absolute w-52 h-52 rounded-full border border-dashed border-cyan-400/30 animate-spin-reverse" />

        {/* Central Core (The Arc Reactor) */}
        <div 
          className="relative w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-300 hud-panel"
          style={{
            borderColor: stateColor.primary,
            boxShadow: `0 0 30px ${stateColor.glow}, inset 0 0 20px ${stateColor.glow}`
          }}
        >
          {/* Internal Geometric Triangle / Core Ring */}
          <div className="w-24 h-24 rounded-full border border-cyan-300/40 flex items-center justify-center bg-[#070A0F]/80">
            <div className="flex flex-col items-center">
              <span className="text-[10px] tracking-[0.2em] font-mono text-cyan-300/70">SHAKA</span>
              <span className="text-sm font-bold tracking-wider text-white capitalize mt-0.5" style={{ color: stateColor.primary }}>
                {state}
              </span>
              <span className="text-[9px] font-mono text-slate-400 mt-1">
                {languageLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* State Status Banner below Reactor */}
      <div className="mt-4 flex flex-col items-center gap-1">
        <div className="flex items-center gap-2 text-xs font-mono tracking-wider">
          <span 
            className="w-2 h-2 rounded-full"
            style={{ 
              backgroundColor: stateColor.primary,
              boxShadow: `0 0 8px ${stateColor.primary}` 
            }} 
          />
          <span className="text-slate-200 font-semibold">{stateColor.text}</span>
        </div>
        <span className="text-[11px] text-slate-400">
          Wake word: <strong className="text-cyan-300">"Shaka"</strong> · Say "Shaka volume 50" or "Shaka Chrome kholo"
        </span>
      </div>
    </div>
  );
};
