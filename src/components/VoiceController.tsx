import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Globe, Sparkles, Play, Pause, Settings2 } from 'lucide-react';
import { LanguageCode, VoiceSettings, ShakaState } from '../types/shaka';

interface VoiceControllerProps {
  settings: VoiceSettings;
  onUpdateSettings: (newSettings: Partial<VoiceSettings>) => void;
  currentState: ShakaState;
  isListening: boolean;
  onToggleListening: () => void;
  onTestSpeech: (phrase?: string) => void;
  lastTranscript: string;
  detectedLang: LanguageCode;
}

const SUPPORTED_LANGUAGES: { code: LanguageCode; label: string; sample: string }[] = [
  { code: 'en', label: 'English (US/UK)', sample: 'Shaka, set volume to 70 percent and launch Chrome' },
  { code: 'hinglish', label: 'Hinglish (Hindi-English mix)', sample: 'Shaka, Notepad kholo aur agla gaana chalao' },
  { code: 'ur', label: 'Urdu / Roman Urdu', sample: 'Shaka, aawaz kam karo aur documents folder kholo' },
  { code: 'hi', label: 'Hindi (हिंदी)', sample: 'शाका, आवाज़ बढ़ाओ और क्रोम खोलो' },
  { code: 'roman_punjabi', label: 'Roman Punjabi', sample: 'Shaka, aawaj wadhaw te gaana play kar' },
];

export const VoiceController: React.FC<VoiceControllerProps> = ({
  settings,
  onUpdateSettings,
  currentState,
  isListening,
  onToggleListening,
  onTestSpeech,
  lastTranscript,
  detectedLang,
}) => {
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  return (
    <div className="hud-panel rounded-xl p-5 border border-cyan-500/20 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/15">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-400">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide">Speech & Voice Architecture</h3>
            <p className="text-xs text-slate-400">Natural female vocal synthesizer & offline wake-word detector</p>
          </div>
        </div>

        {/* Master Mic Button */}
        <button
          onClick={onToggleListening}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isListening 
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.3)] animate-pulse' 
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
          }`}
        >
          {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          <span>{isListening ? 'Mute Mic' : 'Activate Mic'}</span>
        </button>
      </div>

      {/* Live Speech Recognition Feedback Strip */}
      <div className="bg-[#070A0F]/90 rounded-lg p-3.5 border border-cyan-500/20 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-semibold">TRANSCRIPTION FEED:</span>
            <span className="text-slate-400">
              {isListening ? 'Listening for speech...' : 'Microphone in standby'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Detected:</span>
            <span className="px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 uppercase font-mono">
              {detectedLang}
            </span>
          </div>
        </div>

        <p className="text-sm font-mono text-slate-200 min-h-[1.5rem] italic bg-slate-950/50 p-2 rounded border border-slate-800/80">
          {lastTranscript || 'Say "Shaka" followed by your command in English, Hindi, Urdu, or Punjabi...'}
        </p>
      </div>

      {/* Language Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target Multilingual Accent & Dialect</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">Auto-identifies spoken language</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {SUPPORTED_LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => onUpdateSettings({ selectedLanguage: l.code })}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                settings.selectedLanguage === l.code
                  ? 'border-cyan-400/60 bg-cyan-950/40 text-cyan-200 shadow-[0_0_12px_rgba(0,229,255,0.15)]'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-900/30 text-slate-400'
              }`}
            >
              <div className="text-xs font-medium text-slate-200">{l.label}</div>
              <div className="text-[10px] font-mono text-slate-400 truncate mt-1">"{l.sample}"</div>
            </button>
          ))}
        </div>
      </div>

      {/* Voice Tuning Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Speed / Rate */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Speech Cadence (Rate)</span>
            <span className="font-mono text-cyan-400 tabular-nums">{settings.rate.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.75"
            max="1.5"
            step="0.05"
            value={settings.rate}
            onChange={(e) => onUpdateSettings({ rate: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
        </div>

        {/* Pitch */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Voice Pitch (Female Tone)</span>
            <span className="font-mono text-cyan-400 tabular-nums">{settings.pitch.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.8"
            max="1.4"
            step="0.05"
            value={settings.pitch}
            onChange={(e) => onUpdateSettings({ pitch: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
        </div>

        {/* Volume */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Shaka Volume</span>
            <span className="font-mono text-cyan-400 tabular-nums">{Math.round(settings.volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.volume}
            onChange={(e) => onUpdateSettings({ volume: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Voice Test & Verification Strip */}
      <div className="flex items-center justify-between pt-3 border-t border-cyan-500/15">
        <span className="text-xs text-slate-400">
          Audio Engine: <span className="text-slate-200">100% Offline (SAPI5 / Web Speech API)</span>
        </span>
        <button
          onClick={() => onTestSpeech()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/40 rounded-lg transition-all"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Test Voice Output</span>
        </button>
      </div>
    </div>
  );
};
