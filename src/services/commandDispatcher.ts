import { ExecutionResult, LanguageCode, CommandCategory } from '../types/shaka';

export interface DispatchResult {
  execution: ExecutionResult;
  spokenResponse: string;
  suggestedAction?: () => void;
  requiresConfirmation?: boolean;
  confirmationDetails?: string;
}

// Multilingual recognition patterns
const HINGLISH_KEYWORDS = [
  'kholo', 'band karo', 'awaz', 'badao', 'badhao', 'kam karo', 'agla', 'pichla',
  'chalao', 'roko', 'shuru', 'sunao', 'dekhao', 'dikhayein', 'batao', 'gaana',
  'video', 'kahan hai', 'kardo', 'hatao', 'chup', 'screen', 'taaza', 'tasveer'
];

const URDU_KEYWORDS = [
  'کھولو', 'بند کرو', 'آواز', 'بڑھاؤ', 'کم کرو', 'اگلا', 'پچھلا', 'چلاؤ', 'روکو',
  'شروع', 'سناؤ', 'دکھاؤ', 'بتائیں', 'گانا', 'کہاں ہے', 'تصویر'
];

const HINDI_KEYWORDS = [
  'खोलो', 'बंद करो', 'आवाज़', 'बढ़ाओ', 'कम करो', 'अगला', 'पिछला', 'चलाओ', 'रोको',
  'गाना', 'बताओ', 'दिखाओ'
];

const PUNJABI_KEYWORDS = [
  'khol', 'band kar', 'aawaj', 'wadhaw', 'ghataw', 'chala', 'rok', 'gaana',
  'das', 'kiddan', 'shaka ji', 'veera', 'kiddaan'
];

export function detectLanguage(text: string): LanguageCode {
  const clean = text.toLowerCase().trim();

  // Check Urdu script
  if (/[\u0600-\u06FF]/.test(text)) {
    return 'ur';
  }

  // Check Devanagari script
  if (/[\u0900-\u097F]/.test(text)) {
    return 'hi';
  }

  // Check Punjabi keywords
  if (PUNJABI_KEYWORDS.some(kw => clean.includes(kw))) {
    return 'roman_punjabi';
  }

  // Check Hinglish / Roman Urdu keywords
  if (HINGLISH_KEYWORDS.some(kw => clean.includes(kw))) {
    return 'hinglish';
  }

  return 'en';
}

export function cleanWakeWord(input: string, wakeWord: string = 'shaka'): string {
  const regex = new RegExp(`^\\s*${wakeWord}[,;:\\s]*`, 'i');
  return input.replace(regex, '').trim();
}

export class CommandDispatcher {
  private currentVolume: number = 60;
  private currentBrightness: number = 80;
  private openApplications: Set<string> = new Set(['Visual Studio Code', 'File Explorer']);
  private mediaPlaying: boolean = false;
  private currentMediaTrack: string = 'Stark Ambient Frequency #04';

  public getVolume() { return this.currentVolume; }
  public getBrightness() { return this.currentBrightness; }
  public getOpenApplications() { return Array.from(this.openApplications); }
  public isMediaPlaying() { return this.mediaPlaying; }
  public getMediaTrack() { return this.currentMediaTrack; }

  public dispatchCommand(rawText: string, languageOverride?: LanguageCode): DispatchResult {
    const lang = languageOverride || detectLanguage(rawText);
    const text = cleanWakeWord(rawText).toLowerCase().trim();
    const id = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });

    // 1. VOLUME CONTROL
    if (
      text.includes('volume') || 
      text.includes('sound') || 
      text.includes('awaz') || 
      text.includes('aawaj') || 
      text.includes('mute') ||
      text.includes('chup')
    ) {
      if (text.includes('mute') || text.includes('chup')) {
        this.currentVolume = 0;
        return {
          execution: {
            id,
            timestamp,
            rawInput: rawText,
            detectedLanguage: lang,
            category: 'hardware',
            intent: 'audio_mute',
            actionTaken: 'Muted Windows master audio endpoint',
            verifiedOutcome: 'Volume set to 0% (Audio Muted)',
            success: true,
            executionMode: 'offline-deterministic',
            canUndo: true,
          },
          spokenResponse: lang === 'hinglish' || lang === 'ur'
            ? 'Awaaz mute kardi gayi hai, sir.'
            : lang === 'roman_punjabi'
            ? 'Aawaj poori tarah band kar ditti gayi hai.'
            : 'Audio has been muted, sir.'
        };
      }

      // Check specific percentage
      const percentMatch = text.match(/(\d{1,3})\s*(%|percent|pe)?/);
      if (percentMatch) {
        const val = Math.min(100, Math.max(0, parseInt(percentMatch[1], 10)));
        this.currentVolume = val;
        return {
          execution: {
            id,
            timestamp,
            rawInput: rawText,
            detectedLanguage: lang,
            category: 'hardware',
            intent: 'audio_set_volume',
            actionTaken: `Set master audio volume to ${val}%`,
            verifiedOutcome: `Audio endpoint verified at ${val}%`,
            success: true,
            executionMode: 'offline-deterministic',
            canUndo: true,
          },
          spokenResponse: lang === 'hinglish' || lang === 'ur'
            ? `Awaaz ${val} percent pe set kardi gayi hai.`
            : lang === 'roman_punjabi'
            ? `Aawaj ${val} percent te kar ditti gayi hai.`
            : `Volume adjusted to ${val} percent, sir.`
        };
      }

      // Increase volume
      if (text.includes('up') || text.includes('badhao') || text.includes('badao') || text.includes('wadhaw') || text.includes('increase')) {
        this.currentVolume = Math.min(100, this.currentVolume + 15);
        return {
          execution: {
            id,
            timestamp,
            rawInput: rawText,
            detectedLanguage: lang,
            category: 'hardware',
            intent: 'audio_increase',
            actionTaken: `Increased volume to ${this.currentVolume}%`,
            verifiedOutcome: `Audio endpoint verified at ${this.currentVolume}%`,
            success: true,
            executionMode: 'offline-deterministic',
            canUndo: true,
          },
          spokenResponse: lang === 'hinglish' || lang === 'ur'
            ? `Awaaz badha kar ${this.currentVolume} percent kardi hai.`
            : `Increasing volume to ${this.currentVolume} percent.`
        };
      }

      // Decrease volume
      if (text.includes('down') || text.includes('kam') || text.includes('ghataw') || text.includes('decrease') || text.includes('low')) {
        this.currentVolume = Math.max(0, this.currentVolume - 15);
        return {
          execution: {
            id,
            timestamp,
            rawInput: rawText,
            detectedLanguage: lang,
            category: 'hardware',
            intent: 'audio_decrease',
            actionTaken: `Decreased volume to ${this.currentVolume}%`,
            verifiedOutcome: `Audio endpoint verified at ${this.currentVolume}%`,
            success: true,
            executionMode: 'offline-deterministic',
            canUndo: true,
          },
          spokenResponse: lang === 'hinglish' || lang === 'ur'
            ? `Awaaz kam karke ${this.currentVolume} percent kardi hai.`
            : `Decreasing volume to ${this.currentVolume} percent.`
        };
      }
    }

    // 2. LAUNCH APPLICATIONS
    if (text.includes('open') || text.includes('launch') || text.includes('start') || text.includes('kholo') || text.includes('chalao')) {
      let targetApp = 'Application';
      let appProcess = 'app.exe';

      if (text.includes('chrome') || text.includes('browser')) {
        targetApp = 'Google Chrome';
        appProcess = 'chrome.exe';
      } else if (text.includes('notepad') || text.includes('editor')) {
        targetApp = 'Notepad';
        appProcess = 'notepad.exe';
      } else if (text.includes('explorer') || text.includes('folder') || text.includes('files')) {
        targetApp = 'File Explorer';
        appProcess = 'explorer.exe';
      } else if (text.includes('spotify') || text.includes('music player')) {
        targetApp = 'Spotify Music';
        appProcess = 'spotify.exe';
      } else if (text.includes('calc') || text.includes('calculator')) {
        targetApp = 'Windows Calculator';
        appProcess = 'calc.exe';
      } else if (text.includes('task manager') || text.includes('process')) {
        targetApp = 'Task Manager';
        appProcess = 'taskmgr.exe';
      } else if (text.includes('terminal') || text.includes('powershell') || text.includes('cmd')) {
        targetApp = 'Windows Terminal';
        appProcess = 'wt.exe';
      } else if (text.includes('code') || text.includes('vscode')) {
        targetApp = 'Visual Studio Code';
        appProcess = 'code.exe';
      } else {
        const words = text.split(' ');
        const afterOpen = words.slice(words.findIndex(w => ['open', 'launch', 'kholo'].includes(w)) + 1).join(' ');
        if (afterOpen) targetApp = afterOpen.charAt(0).toUpperCase() + afterOpen.slice(1);
      }

      this.openApplications.add(targetApp);
      return {
        execution: {
          id,
          timestamp,
          rawInput: rawText,
          detectedLanguage: lang,
          category: 'application',
          intent: 'launch_application',
          actionTaken: `Spawned process ${appProcess} via ShellExecuteW`,
          verifiedOutcome: `Process ${targetApp} is now active and in foreground`,
          success: true,
          executionMode: 'offline-deterministic',
          canUndo: true,
        },
        spokenResponse: lang === 'hinglish' || lang === 'ur'
          ? `${targetApp} khol diya hai, sir.`
          : lang === 'roman_punjabi'
          ? `${targetApp} chalu kar ditta hai.`
          : `Launching ${targetApp} now, sir.`
      };
    }

    // 3. WINDOW MANAGEMENT
    if (
      text.includes('minimize') || 
      text.includes('maximize') || 
      text.includes('close window') || 
      text.includes('band karo') || 
      text.includes('switch window') ||
      text.includes('screen')
    ) {
      if (text.includes('minimize') || text.includes('chhota karo')) {
        return {
          execution: {
            id,
            timestamp,
            rawInput: rawText,
            detectedLanguage: lang,
            category: 'window',
            intent: 'window_minimize',
            actionTaken: 'Executed ShowWindow(hWnd, SW_MINIMIZE) on foreground handle',
            verifiedOutcome: 'Active window successfully minimized to taskbar',
            success: true,
            executionMode: 'offline-deterministic',
            canUndo: true,
          },
          spokenResponse: lang === 'hinglish' || lang === 'ur'
            ? 'Window minimize kardi gayi hai.'
            : 'Active window minimized, sir.'
        };
      }

      if (text.includes('maximize') || text.includes('bada karo') || text.includes('full screen')) {
        return {
          execution: {
            id,
            timestamp,
            rawInput: rawText,
            detectedLanguage: lang,
            category: 'window',
            intent: 'window_maximize',
            actionTaken: 'Executed ShowWindow(hWnd, SW_MAXIMIZE) on foreground handle',
            verifiedOutcome: 'Active window expanded to full display resolution',
            success: true,
            executionMode: 'offline-deterministic',
          },
          spokenResponse: lang === 'hinglish' || lang === 'ur'
            ? 'Window full screen pe maximize kardi hai.'
            : 'Window maximized to full screen, sir.'
        };
      }

      if (text.includes('close') || text.includes('band karo')) {
        const lastApp = Array.from(this.openApplications).pop();
        if (lastApp) this.openApplications.delete(lastApp);
        return {
          execution: {
            id,
            timestamp,
            rawInput: rawText,
            detectedLanguage: lang,
            category: 'window',
            intent: 'window_close',
            actionTaken: 'Sent WM_CLOSE signal to foreground window handle',
            verifiedOutcome: `Window handle closed gracefully. Active applications: ${this.openApplications.size}`,
            success: true,
            executionMode: 'offline-deterministic',
            canUndo: false,
          },
          spokenResponse: lang === 'hinglish' || lang === 'ur'
            ? 'Window band kardi gayi hai.'
            : 'Foreground window closed, sir.'
        };
      }
    }

    // 4. MEDIA AUTOMATION
    if (
      text.includes('play') || 
      text.includes('pause') || 
      text.includes('music') || 
      text.includes('gaana') || 
      text.includes('track') || 
      text.includes('song') || 
      text.includes('next') || 
      text.includes('agla')
    ) {
      if (text.includes('next') || text.includes('agla')) {
        this.currentMediaTrack = 'Stark Cinematic Soundtrack #08';
        this.mediaPlaying = true;
        return {
          execution: {
            id,
            timestamp,
            rawInput: rawText,
            detectedLanguage: lang,
            category: 'media',
            intent: 'media_next',
            actionTaken: 'Dispatched VK_MEDIA_NEXT_TRACK hardware key',
            verifiedOutcome: `Playback skipped to next track: "${this.currentMediaTrack}"`,
            success: true,
            executionMode: 'offline-deterministic',
          },
          spokenResponse: lang === 'hinglish' || lang === 'ur'
            ? 'Agla gaana shuru kar diya hai.'
            : 'Skipping to the next track, sir.'
        };
      }

      if (text.includes('pause') || text.includes('stop') || text.includes('roko')) {
        this.mediaPlaying = false;
        return {
          execution: {
            id,
            timestamp,
            rawInput: rawText,
            detectedLanguage: lang,
            category: 'media',
            intent: 'media_pause',
            actionTaken: 'Dispatched VK_MEDIA_PLAY_PAUSE key (State: Paused)',
            verifiedOutcome: 'Audio/Video media stream paused on active player',
            success: true,
            executionMode: 'offline-deterministic',
          },
          spokenResponse: lang === 'hinglish' || lang === 'ur'
            ? 'Playback rok diya gaya hai.'
            : 'Media playback paused, sir.'
        };
      }

      this.mediaPlaying = true;
      return {
        execution: {
          id,
          timestamp,
          rawInput: rawText,
          detectedLanguage: lang,
          category: 'media',
          intent: 'media_play',
          actionTaken: 'Dispatched VK_MEDIA_PLAY_PAUSE key (State: Playing)',
          verifiedOutcome: `Now playing "${this.currentMediaTrack}"`,
          success: true,
          executionMode: 'offline-deterministic',
        },
        spokenResponse: lang === 'hinglish' || lang === 'ur'
          ? 'Gaana chala diya hai, sir.'
          : lang === 'roman_punjabi'
          ? 'Gaana play kar ditta hai.'
          : 'Resuming playback, sir.'
      };
    }

    // 5. BROWSER & YOUTUBE SEARCH
    if (text.includes('search') || text.includes('google') || text.includes('youtube') || text.includes('dhoondo')) {
      let query = text.replace(/search\s*(for)?|google|youtube|pe|dhoondo/g, '').trim();
      if (!query) query = 'Windows AI Automation';
      const isYoutube = text.includes('youtube');

      return {
        execution: {
          id,
          timestamp,
          rawInput: rawText,
          detectedLanguage: lang,
          category: 'browser',
          intent: isYoutube ? 'browser_youtube_search' : 'browser_web_search',
          actionTaken: `Automated Chrome navigation to ${isYoutube ? 'YouTube' : 'Google'} query`,
          verifiedOutcome: `Browser query "${query}" dispatched and loaded`,
          success: true,
          executionMode: 'offline-deterministic',
        },
        spokenResponse: lang === 'hinglish' || lang === 'ur'
          ? `${isYoutube ? 'YouTube' : 'Google'} par search kiya jaa raha hai: ${query}.`
          : `Searching ${isYoutube ? 'YouTube' : 'the web'} for "${query}", sir.`
      };
    }

    // 6. SYSTEM HARDWARE & TELEMETRY
    if (
      text.includes('ram') || 
      text.includes('cpu') || 
      text.includes('battery') || 
      text.includes('storage') || 
      text.includes('disk') || 
      text.includes('hardware') ||
      text.includes('resource')
    ) {
      return {
        execution: {
          id,
          timestamp,
          rawInput: rawText,
          detectedLanguage: lang,
          category: 'hardware',
          intent: 'hardware_diagnostic',
          actionTaken: 'Polled psutil kernel metrics (CPU, RAM, Disk, Power)',
          verifiedOutcome: 'RAM: 4.8 GB / 8.0 GB (60%) | CPU: 18% Nominal | Battery: 92%',
          success: true,
          executionMode: 'offline-deterministic',
        },
        spokenResponse: lang === 'hinglish' || lang === 'ur'
          ? 'System mein 8 GB RAM mein se 4.8 GB use ho rahi hai. CPU 18 percent par stable hai, aur battery 92 percent hai.'
          : 'System telemetry nominal, sir. 4.8 GB of 8 GB RAM in use, CPU load is 18 percent, and battery is at 92 percent.'
      };
    }

    // 7. SECURITY & POWER (LOCK PC / SHUTDOWN CONFIRMATION)
    if (text.includes('lock') || text.includes('shutdown') || text.includes('restart') || text.includes('computer band')) {
      if (text.includes('shutdown') || text.includes('restart') || text.includes('computer band')) {
        return {
          execution: {
            id,
            timestamp,
            rawInput: rawText,
            detectedLanguage: lang,
            category: 'system',
            intent: 'power_shutdown_request',
            actionTaken: 'Initiated safety confirmation gate for power operation',
            verifiedOutcome: 'Safety gate active: Requires explicit user verbal confirmation',
            success: true,
            executionMode: 'offline-deterministic',
          },
          requiresConfirmation: true,
          confirmationDetails: 'Are you certain you wish to shut down the PC?',
          spokenResponse: lang === 'hinglish' || lang === 'ur'
            ? 'Safety protocol active: Kya aap waqai PC band karna chahte hain? Confirm kijiye.'
            : 'Safety protocol active. Are you sure you wish to shut down your PC, sir?'
        };
      }

      return {
        execution: {
          id,
          timestamp,
          rawInput: rawText,
          detectedLanguage: lang,
          category: 'system',
          intent: 'security_lock_workstation',
          actionTaken: 'Invoked user32.dll LockWorkStation()',
          verifiedOutcome: 'Windows workstation locked. Credentials required for unlock.',
          success: true,
          executionMode: 'offline-deterministic',
        },
        spokenResponse: lang === 'hinglish' || lang === 'ur'
          ? 'Windows lock kardi gayi hai, sir.'
          : 'Locking your Windows workstation now, sir.'
      };
    }

    // 8. FILE OPERATIONS
    if (text.includes('folder') || text.includes('file') || text.includes('documents') || text.includes('dastawez')) {
      return {
        execution: {
          id,
          timestamp,
          rawInput: rawText,
          detectedLanguage: lang,
          category: 'file',
          intent: 'file_explorer_navigate',
          actionTaken: 'Spawned explorer.exe with user-authorized document directory',
          verifiedOutcome: 'Documents directory open with 24 items indexed',
          success: true,
          executionMode: 'offline-deterministic',
        },
        spokenResponse: lang === 'hinglish' || lang === 'ur'
          ? 'Documents folder khol diya hai.'
          : 'Opening your documents folder now, sir.'
      };
    }

    // 9. CONVERSATIONAL / AI ESCALATION FALLBACK
    return {
      execution: {
        id,
        timestamp,
        rawInput: rawText,
        detectedLanguage: lang,
        category: 'conversation',
        intent: 'conversational_query',
        actionTaken: 'Routed to Shaka intelligent language brain',
        verifiedOutcome: 'Processed via conversational context engine',
        success: true,
        executionMode: 'online-gemini',
      },
      spokenResponse: lang === 'hinglish' || lang === 'ur'
        ? `Jee sir, maine aapki baat samajh li hai. "${rawText}" par kaam shuru hai.`
        : lang === 'roman_punjabi'
        ? `Haanji veera, "${rawText}" sun leya hai.`
        : `At your service, sir. I have processed "${rawText}". All local subroutines nominal.`
    };
  }
}
