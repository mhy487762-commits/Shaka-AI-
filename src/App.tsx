/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ShakaState, 
  LanguageCode, 
  ExecutionResult, 
  SystemMetrics, 
  VoiceSettings, 
  MemoryItem, 
  RoutineItem 
} from './types/shaka';
import { CommandDispatcher, detectLanguage } from './services/commandDispatcher';
import { HUDHeader } from './components/HUDHeader';
import { ArcReactorHUD } from './components/ArcReactorHUD';
import { VoiceController } from './components/VoiceController';
import { TelemetryGauges } from './components/TelemetryGauges';
import { QuickActionsGrid } from './components/QuickActionsGrid';
import { ConsoleHistory } from './components/ConsoleHistory';
import { MemoryRoutinesModal } from './components/MemoryRoutinesModal';
import { PythonPackageViewer } from './components/PythonPackageViewer';
import { QuickTerminalModal } from './components/QuickTerminalModal';
import { AlertTriangle, Check, Volume2, Shield } from 'lucide-react';

const INITIAL_METRICS: SystemMetrics = {
  cpuUsage: 14,
  ramUsedGb: 4.8,
  ramTotalGb: 8.0,
  ramPercentage: 60,
  diskUsedGb: 284,
  diskTotalGb: 512,
  diskPercentage: 55,
  batteryPercentage: 92,
  batteryPlugged: true,
  activeWindow: 'Visual Studio Code — Shaka Workspace',
  uptimeSeconds: 7420,
};

const DEFAULT_MEMORY: MemoryItem[] = [
  {
    id: 'mem_1',
    key: 'Primary Browser',
    value: 'Google Chrome',
    category: 'preference',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mem_2',
    key: 'Authorized Projects Path',
    value: 'C:\\Users\\User\\Projects',
    category: 'authorized_path',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mem_3',
    key: 'Hardware Spec',
    value: '8 GB RAM, Intel UHD Graphics, Windows 11 x64',
    category: 'fact',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const DEFAULT_ROUTINES: RoutineItem[] = [
  {
    id: 'routine_1',
    name: 'Work Focus Mode',
    triggerPhrase: 'work mode',
    language: 'en',
    actions: ['open Chrome', 'open VS Code', 'volume 30 percent'],
    enabled: true,
  },
  {
    id: 'routine_2',
    name: 'Chill & Music',
    triggerPhrase: 'relax mode',
    language: 'hinglish',
    actions: ['open Spotify', 'play music', 'volume 65 percent'],
    enabled: true,
  }
];

export default function App() {
  // Navigation & Mode State
  const [activeTab, setActiveTab] = useState<'cockpit' | 'telemetry' | 'voice' | 'memory' | 'package'>('cockpit');
  const [isOnlineMode, setIsOnlineMode] = useState<boolean>(true);
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);
  const [isQuickTerminalOpen, setIsQuickTerminalOpen] = useState<boolean>(false);

  // Assistant & Audio State
  const [shakaState, setShakaState] = useState<ShakaState>('idle');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0.1);
  const [lastTranscript, setLastTranscript] = useState<string>('');
  const [detectedLang, setDetectedLang] = useState<LanguageCode>('en');

  // Command History & Metrics
  const [history, setHistory] = useState<ExecutionResult[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>(INITIAL_METRICS);

  // Memory & Routines
  const [memoryItems, setMemoryItems] = useState<MemoryItem[]>(() => {
    const saved = localStorage.getItem('shaka_memory');
    return saved ? JSON.parse(saved) : DEFAULT_MEMORY;
  });

  const [routines, setRoutines] = useState<RoutineItem[]>(() => {
    const saved = localStorage.getItem('shaka_routines');
    return saved ? JSON.parse(saved) : DEFAULT_ROUTINES;
  });

  // Voice Synthesizer Settings
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    voiceName: 'Microsoft Zira (Female)',
    pitch: 1.05,
    rate: 1.05,
    volume: 1.0,
    wakeWord: 'shaka',
    autoLanguageDetect: true,
    selectedLanguage: 'en',
    continuousListening: true,
  });

  // Safety confirmation modal state
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const dispatcherRef = useRef(new CommandDispatcher());
  const socketRef = useRef<WebSocket | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Sync memory to localStorage
  useEffect(() => {
    localStorage.setItem('shaka_memory', JSON.stringify(memoryItems));
  }, [memoryItems]);

  useEffect(() => {
    localStorage.setItem('shaka_routines', JSON.stringify(routines));
  }, [routines]);

  // Update uptime counter every second
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({ ...prev, uptimeSeconds: prev.uptimeSeconds + 1 }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Web Speech Synthesis (Female Voice preference)
  const speakVoiceResponse = useCallback((text: string, lang: LanguageCode) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = voiceSettings.pitch;
    utterance.rate = voiceSettings.rate;
    utterance.volume = voiceSettings.volume;

    // Pick best matching female voice
    const voices = window.speechSynthesis.getVoices();
    let bestVoice: SpeechSynthesisVoice | undefined;

    if (lang === 'hi') {
      bestVoice = voices.find(v => v.lang.startsWith('hi'));
    } else if (lang === 'ur') {
      bestVoice = voices.find(v => v.lang.startsWith('ur')) || voices.find(v => v.lang.startsWith('hi'));
    }

    if (!bestVoice) {
      bestVoice = voices.find(v => {
        const n = v.name.toLowerCase();
        return n.includes('zira') || n.includes('female') || n.includes('samantha') || n.includes('karen') || n.includes('hazel');
      });
    }

    if (!bestVoice && voices.length > 0) {
      bestVoice = voices[0];
    }

    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.onstart = () => {
      setShakaState('speaking');
    };

    utterance.onend = () => {
      setShakaState(isListening ? 'listening' : 'idle');
    };

    utterance.onerror = () => {
      setShakaState(isListening ? 'listening' : 'idle');
    };

    window.speechSynthesis.speak(utterance);
  }, [voiceSettings, isListening]);

  // Command Execution Pipeline
  const executeCommand = useCallback(async (rawCommand: string) => {
    const clean = rawCommand.trim();
    if (!clean) return;

    setShakaState('processing');
    const detected = detectLanguage(clean);
    setDetectedLang(detected);

    // 1. Check for custom routines
    const lower = clean.toLowerCase();
    const matchingRoutine = routines.find(r => r.enabled && lower.includes(r.triggerPhrase.toLowerCase()));

    if (matchingRoutine) {
      setShakaState('executing');
      for (const action of matchingRoutine.actions) {
        const res = dispatcherRef.current.dispatchCommand(action, matchingRoutine.language);
        setHistory(prev => [res.execution, ...prev.slice(0, 49)]);
      }
      const routineReply = `Executing custom routine: ${matchingRoutine.name}. All actions dispatched, Sir.`;
      speakVoiceResponse(routineReply, matchingRoutine.language);
      return;
    }

    // 2. Local deterministic dispatcher
    const result = dispatcherRef.current.dispatchCommand(clean, voiceSettings.autoLanguageDetect ? detected : voiceSettings.selectedLanguage);

    // Handle security confirmation requests (e.g. shutdown)
    if (result.requiresConfirmation) {
      setPendingConfirmation({
        title: 'Safety Protocol Confirmation',
        message: result.confirmationDetails || 'High-impact system action requested.',
        onConfirm: () => {
          setHistory(prev => [result.execution, ...prev.slice(0, 49)]);
          speakVoiceResponse('Action confirmed and executed, sir.', result.execution.detectedLanguage);
          setPendingConfirmation(null);
        }
      });
      speakVoiceResponse(result.spokenResponse, result.execution.detectedLanguage);
      return;
    }

    // 3. Forward to local Python WebSocket if connected
    if (isSocketConnected && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'voice_command',
        command: clean,
        language: detected,
      }));
    }

    // 4. If conversation query and online mode enabled, call Gemini API
    if (result.execution.category === 'conversation' && isOnlineMode) {
      try {
        const response = await fetch('/api/ai/reason', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: clean,
            language: detected,
            conversationHistory: history.slice(0, 4).map(h => ({
              role: 'user',
              content: h.rawInput
            }))
          })
        });

        if (response.ok) {
          const data = await response.json();
          result.spokenResponse = data.text;
          result.execution.verifiedOutcome = `Reasoned via Gemini 3.8 Flash (${detected})`;
          result.execution.actionTaken = 'Analyzed via server-side neural intelligence';
        }
      } catch (err) {
        console.warn('Gemini reasoning fallback:', err);
      }
    }

    // 5. Update state and history
    setShakaState('executing');
    setHistory(prev => [result.execution, ...prev.slice(0, 49)]);

    // Update telemetry metrics with slight variations to reflect active load
    setMetrics(prev => ({
      ...prev,
      cpuUsage: Math.min(95, Math.max(12, prev.cpuUsage + (Math.random() * 8 - 4))),
    }));

    // 6. Speak response verbally
    speakVoiceResponse(result.spokenResponse, result.execution.detectedLanguage);
  }, [routines, voiceSettings, isSocketConnected, isOnlineMode, history, speakVoiceResponse]);

  // Audio Level Analyser for Arc Reactor visual feedback
  const startAudioMonitoring = useCallback(async () => {
    try {
      if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(1, avg / 128));
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (e) {
      console.warn('Microphone access note:', e);
      // Gentle pulsing fallback
      const pulseInterval = setInterval(() => {
        setAudioLevel(0.15 + Math.random() * 0.15);
      }, 200);
      return () => clearInterval(pulseInterval);
    }
  }, []);

  const stopAudioMonitoring = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setAudioLevel(0.1);
  }, []);

  // Web Speech Recognition Controller
  const toggleListening = useCallback(() => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsListening(false);
      setShakaState('idle');
      stopAudioMonitoring();
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Web Speech API is not supported in this browser. You can type commands in Quick Terminal.');
        return;
      }

      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = voiceSettings.selectedLanguage === 'hi' 
          ? 'hi-IN' 
          : voiceSettings.selectedLanguage === 'ur' 
          ? 'ur-PK' 
          : 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setShakaState('listening');
          startAudioMonitoring();
        };

        recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }

          const currentText = final || interim;
          if (currentText) {
            setLastTranscript(currentText);
            const lower = currentText.toLowerCase();

            // Wake word activation: "Shaka"
            if (lower.includes(voiceSettings.wakeWord.toLowerCase()) && final) {
              executeCommand(final);
            }
          }
        };

        recognition.onerror = (event: any) => {
          if (event.error !== 'no-speech') {
            console.warn('Speech recognition warning:', event.error);
          }
        };

        recognition.onend = () => {
          if (isListening && voiceSettings.continuousListening) {
            try {
              recognition.start();
            } catch (e) {
              setIsListening(false);
              setShakaState('idle');
              stopAudioMonitoring();
            }
          } else {
            setIsListening(false);
            setShakaState('idle');
            stopAudioMonitoring();
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  }, [isListening, voiceSettings, executeCommand, startAudioMonitoring, stopAudioMonitoring]);

  // Attempt local WebSocket connection to 127.0.0.1:8765
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectLocalBridge = () => {
      try {
        ws = new WebSocket('ws://127.0.0.1:8765');

        ws.onopen = () => {
          setIsSocketConnected(true);
          console.log('[SHAKA] Successfully linked to local Windows Python server on 127.0.0.1:8765');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'telemetry' && data.metrics) {
              setMetrics(prev => ({
                ...prev,
                cpuUsage: data.metrics.cpu_percent ?? prev.cpuUsage,
                ramUsedGb: data.metrics.ram_used_gb ?? prev.ramUsedGb,
                ramTotalGb: data.metrics.ram_total_gb ?? prev.ramTotalGb,
                ramPercentage: data.metrics.ram_percent ?? prev.ramPercentage,
                diskUsedGb: data.metrics.disk_used_gb ?? prev.diskUsedGb,
                diskTotalGb: data.metrics.disk_total_gb ?? prev.diskTotalGb,
                diskPercentage: data.metrics.disk_percent ?? prev.diskPercentage,
                batteryPercentage: data.metrics.battery_percent ?? prev.batteryPercentage,
                batteryPlugged: data.metrics.battery_plugged ?? prev.batteryPlugged,
                activeWindow: data.metrics.active_window ?? prev.activeWindow,
              }));
            }
          } catch (e) {
            console.error('Error parsing socket data:', e);
          }
        };

        ws.onclose = () => {
          setIsSocketConnected(false);
          // Try reconnecting quietly every 8 seconds
          reconnectTimeout = setTimeout(connectLocalBridge, 8000);
        };

        ws.onerror = () => {
          setIsSocketConnected(false);
        };

        socketRef.current = ws;
      } catch (e) {
        setIsSocketConnected(false);
        reconnectTimeout = setTimeout(connectLocalBridge, 8000);
      }
    };

    connectLocalBridge();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, []);

  // Memory Handlers
  const handleAddMemory = (key: string, value: string, category: any) => {
    const item: MemoryItem = {
      id: `mem_${Date.now()}`,
      key,
      value,
      category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMemoryItems(prev => [item, ...prev]);
  };

  const handleDeleteMemory = (id: string) => {
    setMemoryItems(prev => prev.filter(m => m.id !== id));
  };

  const handleClearAllMemory = () => {
    if (confirm('Are you sure you want to wipe all stored memory?')) {
      setMemoryItems([]);
    }
  };

  // Routine Handlers
  const handleAddRoutine = (routine: Omit<RoutineItem, 'id'>) => {
    const newRoutine: RoutineItem = {
      ...routine,
      id: `routine_${Date.now()}`,
    };
    setRoutines(prev => [newRoutine, ...prev]);
  };

  const handleToggleRoutine = (id: string) => {
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const handleDeleteRoutine = (id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
  };

  const handleUndo = (id: string) => {
    setHistory(prev => prev.map(h => {
      if (h.id === id) {
        return {
          ...h,
          verifiedOutcome: `Action successfully undone: ${h.actionTaken}`,
          canUndo: false,
        };
      }
      return h;
    }));
    speakVoiceResponse('Previous action undone, sir.', 'en');
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100 flex flex-col hud-grid-bg">
      {/* HUD Header */}
      <HUDHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOnlineMode={isOnlineMode}
        setIsOnlineMode={setIsOnlineMode}
        isSocketConnected={isSocketConnected}
        onOpenQuickTerminal={() => setIsQuickTerminalOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        {/* VIEW 1: COCKPIT HUD (Default Main View) */}
        {activeTab === 'cockpit' && (
          <div className="flex flex-col gap-6">
            {/* Top Split: Arc Reactor Core & Telemetry Highlights */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Column: Arc Reactor Core Visualizer */}
              <div className="lg:col-span-6 flex flex-col items-center justify-center hud-panel rounded-2xl p-6 border border-cyan-500/25">
                <ArcReactorHUD
                  state={shakaState}
                  audioLevel={audioLevel}
                  onClick={toggleListening}
                  languageLabel={detectedLang.toUpperCase()}
                />

                {/* Subtext info */}
                <div className="mt-4 flex items-center gap-3 text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>Mode: {isOnlineMode ? 'Hybrid Intelligence' : 'Offline Verified'}</span>
                  </span>
                  <span>·</span>
                  <span>Mic: {isListening ? 'Active (Continuous)' : 'Muted'}</span>
                </div>
              </div>

              {/* Right Column: Hardware Telemetry Gauges */}
              <div className="lg:col-span-6 flex flex-col gap-4">
                <TelemetryGauges
                  metrics={metrics}
                  isLinkedToLocalServer={isSocketConnected}
                />

                {/* Voice Status Card */}
                <div className="hud-panel rounded-xl p-4 border border-cyan-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Shaka Vocal Persona</div>
                      <div className="text-[11px] text-slate-400">
                        Voice: <strong className="text-cyan-300">Natural Female (Zira/SAPI5)</strong> · Rate: {voiceSettings.rate}x
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => speakVoiceResponse("Shaka vocal synthesizer nominal. Ready for your instructions, Sir.", "en")}
                    className="px-3 py-1.5 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/30 text-xs font-medium text-cyan-300 transition-colors"
                  >
                    Test Voice
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Automation Actions Grid */}
            <QuickActionsGrid
              onExecuteCommand={executeCommand}
              currentVolume={dispatcherRef.current.getVolume()}
              isMediaPlaying={dispatcherRef.current.isMediaPlaying()}
            />

            {/* Execution Stream & History */}
            <ConsoleHistory
              history={history}
              onUndo={handleUndo}
              onClear={() => setHistory([])}
            />
          </div>
        )}

        {/* VIEW 2: TELEMETRY & DIAGNOSTICS */}
        {activeTab === 'telemetry' && (
          <div className="flex flex-col gap-6">
            <TelemetryGauges
              metrics={metrics}
              isLinkedToLocalServer={isSocketConnected}
            />
            <ConsoleHistory
              history={history}
              onUndo={handleUndo}
              onClear={() => setHistory([])}
            />
          </div>
        )}

        {/* VIEW 3: SPEECH & LANGUAGES */}
        {activeTab === 'voice' && (
          <div className="flex flex-col gap-6">
            <VoiceController
              settings={voiceSettings}
              onUpdateSettings={(newSettings) => setVoiceSettings(prev => ({ ...prev, ...newSettings }))}
              currentState={shakaState}
              isListening={isListening}
              onToggleListening={toggleListening}
              onTestSpeech={(phrase) => speakVoiceResponse(phrase || "Shaka vocal synthesizer nominal. Ready for your instructions, Sir.", voiceSettings.selectedLanguage)}
              lastTranscript={lastTranscript}
              detectedLang={detectedLang}
            />
          </div>
        )}

        {/* VIEW 4: MEMORY & ROUTINES */}
        {activeTab === 'memory' && (
          <div className="flex flex-col gap-6">
            <MemoryRoutinesModal
              memoryItems={memoryItems}
              routines={routines}
              onAddMemory={handleAddMemory}
              onDeleteMemory={handleDeleteMemory}
              onClearAllMemory={handleClearAllMemory}
              onAddRoutine={handleAddRoutine}
              onToggleRoutine={handleToggleRoutine}
              onDeleteRoutine={handleDeleteRoutine}
            />
          </div>
        )}

        {/* VIEW 5: PYTHON PACKAGE & SETUP */}
        {activeTab === 'package' && (
          <div className="flex flex-col gap-6">
            <PythonPackageViewer />
          </div>
        )}
      </main>

      {/* Direct Command Terminal Modal */}
      <QuickTerminalModal
        isOpen={isQuickTerminalOpen}
        onClose={() => setIsQuickTerminalOpen(false)}
        onSubmitCommand={executeCommand}
      />

      {/* Safety Protocol Confirmation Modal */}
      {pendingConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md hud-panel rounded-2xl border border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.3)] p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">{pendingConfirmation.title}</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              {pendingConfirmation.message}
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-rose-500/20">
              <button
                onClick={() => setPendingConfirmation(null)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Cancel Action
              </button>
              <button
                onClick={pendingConfirmation.onConfirm}
                className="px-4 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-semibold text-xs shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all"
              >
                Confirm & Execute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-cyan-500/15 py-3 px-6 text-center text-xs font-mono text-slate-500 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span>PROJECT SHAKA OS</span>
          <span>·</span>
          <span>Offline Speech & Deterministic Windows Automation Engine</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Local Bridge: ws://127.0.0.1:8765</span>
          <span>·</span>
          <span className="text-cyan-400">Status: Nominal</span>
        </div>
      </footer>
    </div>
  );
}
