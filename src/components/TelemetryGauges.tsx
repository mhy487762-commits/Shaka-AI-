import React from 'react';
import { Cpu, HardDrive, Battery, Layout, Clock, Activity } from 'lucide-react';
import { SystemMetrics } from '../types/shaka';

interface TelemetryGaugesProps {
  metrics: SystemMetrics;
  isLinkedToLocalServer: boolean;
}

export const TelemetryGauges: React.FC<TelemetryGaugesProps> = ({
  metrics,
  isLinkedToLocalServer,
}) => {
  // Format uptime
  const hours = Math.floor(metrics.uptimeSeconds / 3600);
  const minutes = Math.floor((metrics.uptimeSeconds % 3600) / 60);
  const seconds = metrics.uptimeSeconds % 60;
  const formattedUptime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col gap-4">
      {/* Telemetry Header */}
      <div className="flex items-center justify-between pb-2 border-b border-cyan-500/15">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white tracking-wide">Windows Hardware Telemetry</h3>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Source: {isLinkedToLocalServer ? 'Kernel psutil (127.0.0.1:8765)' : 'Simulated 8GB PC Telemetry'}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* CPU Load */}
        <div className="hud-panel rounded-xl p-3.5 border border-cyan-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>CPU Load</span>
            </span>
            <span className="font-mono text-[10px] text-cyan-300">Intel i5/UHD</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-white">
              {metrics.cpuUsage.toFixed(0)}%
            </span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
              metrics.cpuUsage > 80 ? 'bg-rose-950/60 text-rose-300' : 'bg-emerald-950/60 text-emerald-300'
            }`}>
              {metrics.cpuUsage > 80 ? 'HIGH' : 'NOMINAL'}
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, metrics.cpuUsage)}%` }}
            />
          </div>
        </div>

        {/* RAM Usage */}
        <div className="hud-panel rounded-xl p-3.5 border border-cyan-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Memory (RAM)</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">Target: 8 GB</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono tabular-nums text-white">
                {metrics.ramUsedGb.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-slate-400">/ {metrics.ramTotalGb.toFixed(1)} GB</span>
            </div>
            <span className="text-xs font-mono text-cyan-300 tabular-nums">
              {metrics.ramPercentage.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.ramPercentage}%` }}
            />
          </div>
        </div>

        {/* Disk Storage */}
        <div className="hud-panel rounded-xl p-3.5 border border-cyan-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
              <span>NVMe Storage</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">Drive C:</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono tabular-nums text-white">
                {metrics.diskUsedGb.toFixed(0)}
              </span>
              <span className="text-xs font-mono text-slate-400">/ {metrics.diskTotalGb.toFixed(0)} GB</span>
            </div>
            <span className="text-xs font-mono text-cyan-300 tabular-nums">
              {metrics.diskPercentage.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.diskPercentage}%` }}
            />
          </div>
        </div>

        {/* Battery & Power */}
        <div className="hud-panel rounded-xl p-3.5 border border-cyan-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Battery className="w-3.5 h-3.5 text-cyan-400" />
              <span>Battery & Power</span>
            </span>
            <span className="font-mono text-[10px] text-emerald-400">
              {metrics.batteryPlugged ? 'AC Connected' : 'Discharging'}
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-white">
              {metrics.batteryPercentage}%
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300">
              OPTIMAL
            </span>
          </div>
          <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.batteryPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* System Status Footprint Bar */}
      <div className="hud-panel rounded-xl p-3 border border-cyan-500/20 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-300">
        <div className="flex items-center gap-2">
          <Layout className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Foreground Target:</span>
          <span className="text-white font-semibold truncate max-w-xs">{metrics.activeWindow}</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400 text-[11px]">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>Uptime:</span>
            <span className="text-slate-200 tabular-nums">{formattedUptime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Windows Arch:</span>
            <span className="text-slate-200">x86_64</span>
          </div>
        </div>
      </div>
    </div>
  );
};
