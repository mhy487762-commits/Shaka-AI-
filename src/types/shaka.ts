export type ShakaState = 'idle' | 'listening' | 'processing' | 'executing' | 'speaking';

export type LanguageCode = 'en' | 'hi' | 'ur' | 'hinglish' | 'roman_punjabi';

export interface LanguageInfo {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  samplePhrase: string;
}

export type CommandCategory = 
  | 'system'
  | 'application'
  | 'window'
  | 'media'
  | 'browser'
  | 'file'
  | 'hardware'
  | 'conversation';

export interface ExecutionResult {
  id: string;
  timestamp: string;
  rawInput: string;
  detectedLanguage: LanguageCode;
  category: CommandCategory;
  intent: string;
  actionTaken: string;
  verifiedOutcome: string;
  success: boolean;
  executionMode: 'offline-deterministic' | 'online-gemini' | 'local-bridge';
  canUndo?: boolean;
}

export interface SystemMetrics {
  cpuUsage: number; // percentage
  ramUsedGb: number;
  ramTotalGb: number;
  ramPercentage: number;
  diskUsedGb: number;
  diskTotalGb: number;
  diskPercentage: number;
  batteryPercentage: number;
  batteryPlugged: boolean;
  activeWindow: string;
  uptimeSeconds: number;
}

export interface VoiceSettings {
  voiceName: string;
  pitch: number;
  rate: number;
  volume: number;
  wakeWord: string;
  autoLanguageDetect: boolean;
  selectedLanguage: LanguageCode;
  continuousListening: boolean;
}

export interface MemoryItem {
  id: string;
  key: string;
  value: string;
  category: 'preference' | 'routine' | 'fact' | 'authorized_path';
  createdAt: string;
  updatedAt: string;
}

export interface RoutineItem {
  id: string;
  name: string;
  triggerPhrase: string;
  language: LanguageCode;
  actions: string[];
  enabled: boolean;
}

export interface PythonPackageFile {
  name: string;
  description: string;
  category: 'core' | 'automation' | 'speech' | 'setup' | 'test';
  code: string;
}
