# PROJECT SHAKA — Personal JARVIS-Style Windows AI Assistant

A dual-engine personal AI assistant system comprising a futuristic JARVIS-style desktop HUD web console and a modular local Python server bridge for native Windows PC control, offline Vosk/Whisper speech recognition, offline pyttsx3 speech synthesis, and intelligent command routing.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following key decisions were confirmed during the interactive interview:
> - **Primary Experience**: A Web JARVIS HUD interface communicating via WebSocket/HTTP with a lightweight local Windows Python bridge (`127.0.0.1:8765`), enabling both live browser-based execution and direct native Windows OS automation.
> - **Speech & Audio Pipeline**: Offline-first speech stack utilizing Vosk and Whisper for multilingual speech recognition, paired with an offline `pyttsx3` female voice engine, with seamless Web Speech API fallbacks in the browser.
> - **Beginner Delivery Package**: A dedicated export module providing a full, production-ready downloadable Python project package with a 1-click PowerShell installer script (`setup_and_run.ps1`) optimized for Windows 10/11 with 8 GB RAM and Intel integrated graphics.

- **Confirmed Decision 1**: Dual execution mode — Standalone HUD Mode (runs directly in browser with Web Speech API and simulated Windows actions) + Connected Mode (links to local Python daemon at `ws://127.0.0.1:8765` for real Windows execution).
- **Confirmed Decision 2**: Multilingual speech support covering English, Hindi, Urdu, Hinglish, Roman Urdu, and Roman Punjabi with automated intent mapping and offline technical jargon parsing.
- **Confirmed Decision 3**: Complete offline safety sandbox — deterministic command dispatcher for system operations (apps, files, volume, media, power) so arbitrary shell scripts are never hallucinated.

---

## 1. Overview & Core Concept

**Project Shaka** delivers a personal, voice-controlled Windows companion inspired by Iron Man's JARVIS. Designed specifically for standard PC hardware (8 GB RAM, Intel integrated graphics, Windows 10/11), Shaka operates as a local-first system server that never depends on cloud services for core PC automation.

### Key Value Pillars
1. **Wake-Word & Multilingual Voice Activation**: Continuously monitors for "Shaka" and understands natural commands in English, Hindi, Urdu, Hinglish, and Punjabi with instant language-matching verbal responses.
2. **Local Windows PC Automation**: Safely launches apps, controls windows (minimize, maximize, tile, close), manages files and folders, controls system volume/brightness, inspects hardware resources (CPU, RAM, battery, disk), and automates web browsers.
3. **Deterministic & Safe AI Brain**: Fast regex and semantic intent classification executes verified Python automation routines immediately; ambiguous or open-ended inquiries seamlessly route to local models or Gemini 3.8 Flash (when online).
4. **Futuristic HUD Desktop Interface**: Dynamic Iron Man Arc Reactor audio visualizer, real-time microphone status waves, system resource dials, live transcription feed, memory inspector, and one-click Python project exporter.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Activation & Voice Command**: User speaks *"Shaka, volume 50 percent and open Chrome"*. HUD transitions smoothly from IDLE (pulsing blue core) to LISTENING (reactive sound waves) to PROCESSING (spinning holographic rings) to SPEAKING (warm cyan speech wave). Shaka confirms verbally in natural female voice: *"Volume set to 50 percent, opening Chrome."*
2. **Multilingual Interaction**: User says *"Shaka, agla folder kholo aur music play karo"* (Hinglish/Urdu). Shaka identifies the language, opens the next folder, initiates media playback, and confirms in Hinglish: *"Folder khol diya aur music shuru kar diya."*
3. **Hardware & Resource Inspection**: User asks *"Shaka, how much RAM and battery do I have left?"*. HUD highlights the system resource HUD gauge with actual percentage, temperature, and storage metrics.
4. **Beginner Setup & Python Server Launch**: User switches to the "Local Server & Scripts" tab, inspects the pre-configured Python files, and clicks "Download Complete Shaka Package (.zip)" or copies the single PowerShell script to run natively on their Windows PC.

### Visual Identity & Theme
- **Aesthetic Direction**: High-tech sci-fi HUD inspired by Iron Man's JARVIS, featuring clean geometric lines, glassmorphism panels, circular holographic gauges, and restrained electric cyan/gold accents on an ultra-dark canvas.
- **Color Palette**:
  - Neutral Canvas: Deep Obsidian Black (`#070A0F`), Surface Card Slate (`#0D121D`, `rgba(13, 18, 29, 0.75)` with backdrop blur)
  - Primary Accent: Electric Arc Cyan (`#00E5FF` / `rgba(0, 229, 255, 0.9)`)
  - Status Accents: Nominal Emerald (`#10B981`), Amber Attention (`#F59E0B`), Threat/Alert Crimson (`#EF4444`)
  - Typography: `Outfit` / `Plus Jakarta Sans` for futuristic display headings, paired with `JetBrains Mono` / `tabular-nums` for coordinates, telemetry, and system metrics.
- **Micro-Interactions**:
  - Radial SVG Arc Reactor visualizer responding to mic input volume and synthesis audio frequencies.
  - Smooth status transitions (`IDLE` $\rightarrow$ `LISTENING` $\rightarrow$ `THINKING` $\rightarrow$ `EXECUTING` $\rightarrow$ `SPEAKING`).
  - Action cards displaying verified command results with undo affordances where applicable.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Hybrid Architecture (Web HUD + Local Python Server Daemon)
- **Chosen Approach**: Build a rich, full-fidelity web client that runs immediately in any browser with Web Speech API and simulated Windows capabilities, coupled with a built-in WebSocket client that connects automatically to `ws://127.0.0.1:8765` when the user runs the provided Python server on Windows.
- **Why**: Allows instant evaluation and testing inside AI Studio while delivering the exact native Python script files, libraries, and instructions for full local Windows execution.
- **Alternatives Considered**: Pure Python Tkinter/PyQt app (limited visual fidelity, impossible to preview interactively in the web sandbox).

### Decision 2: Deterministic Command Dispatcher Before LLM Routing
- **Chosen Approach**: Commands matching known system patterns (e.g., volume, launch app, file operations, media keys, window state) execute directly through deterministic handlers with sub-10ms latency and 100% offline reliability. Only conversational, creative, or multi-step reasoning queries escalate to AI models.
- **Why**: Prevents destructive command hallucination, ensures sub-second voice response time, and guarantees full offline usability on 8 GB RAM machines.

### Decision 3: Multilingual Regex & Semantic Parser
- **Chosen Approach**: Built-in keyword and phrase patterns for English, Hindi, Urdu, Roman Urdu, and Punjabi (e.g., *"kholo"*, *"band karo"*, *"awaz badhao"*, *"next"*, *"agla"*).
- **Why**: Eliminates dependency on heavy online translation models for standard PC operations while allowing natural mixed-language technical phrasing.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SHAKA JARVIS WEB INTERFACE                      │
│                                                                        │
│  ┌───────────────────────┐  ┌───────────────────┐  ┌─────────────────┐ │
│  │   Arc Reactor Core    │  │  Telemetry Gauges │  │  Voice Waveform │ │
│  │ (Canvas Visualizer)   │  │ (CPU, RAM, State) │  │  (Web Audio API)│ │
│  └───────────┬───────────┘  └─────────┬─────────┘  └────────┬────────┘ │
│              │                        │                     │          │
│  ┌───────────▼────────────────────────▼─────────────────────▼────────┐ │
│  │               Shaka Central State Store & Dispatcher              │ │
│  │     (Wake-Word Detector, Multilingual Parser, Memory Engine)      │ │
│  └───────────────────────────────┬───────────────────────────────────┘ │
│                                  │                                     │
│         ┌────────────────────────┴────────────────────────┐            │
│         │                                                 │            │
│  ┌──────▼─────────────────────┐                    ┌──────▼──────────┐ │
│  │ Browser Simulation Engine  │                    │ WebSocket Client│ │
│  │  (Web Speech API, TTS,     │                    │ (ws://127.0.0.1)│ │
│  │   Virtual File/App System) │                    └────────┬────────┘ │
└─────────┼─────────────────────┴─────────────────────────────┼──────────┘
          │                                                   │
          │ Fallback / Sandbox                                │ Real Native Control
          ▼                                                   ▼
┌─────────────────────────────────┐      ┌───────────────────────────────┐
│     Client-Side Experience      │      │   LOCAL PYTHON SERVER DAEMON  │
│  • Instant voice activation     │      │   (`shaka_server.py`)         │
│  • Full interactive GUI & HUD   │      │  • Vosk/Whisper Offline STT   │
│  • Memory & Routine Manager     │      │  • pyttsx3 Female TTS Engine  │
│  • 1-Click Python Zip Exporter  │      │  • PyAutoGUI & pywin32 OS Ops │
│  • PowerShell Setup Generator   │      │  • psutil Hardware Telemetry  │
└─────────────────────────────────┘      └───────────────────────────────┘
```

### Component Structure & Handlers
1. **ArcReactorHUD**: Central canvas-driven holographic reactor responding to audio input decibels and speech states.
2. **SpeechController**: Manages continuous mic listening, "Shaka" wake-word detection, speech synthesis (female voice pitch/rate controls), and language auto-detection.
3. **CommandEngine**: Deterministic pattern matcher with multilingual dictionary supporting:
   - System Actions: Volume, brightness, mute, lock screen, shutdown confirmation.
   - Window & App Management: Open Chrome/Notepad/Explorer/Spotify, minimize, tile, close.
   - File Operations: List folder, create file, search documents, read file.
   - Browser & Media: YouTube search, play/pause media, scroll, tab switch.
4. **SystemTelemetry**: Real-time monitoring of CPU, RAM, disk, battery, and network status (streamed from Python bridge or simulated locally).
5. **MemoryManager**: Local persistent storage of custom routines, user preferences, past interactions, and authorized folders.
6. **PythonPackageModal & CodeViewer**: Interactive browser tab allowing the user to view every modular Python script (`shaka_server.py`, `windows_controller.py`, `speech_engine.py`, `automation_handlers.py`, `requirements.txt`, `setup_and_run.ps1`) with copy buttons and a one-click zip download.

---

## 5. Implementation Sequence (Post-Approval)

1. **Core Assets & Branding**: Configure `metadata.json` and `index.html` with SHAKA JARVIS theme, titles, and futuristic styles.
2. **Audio & Visualizer Engine**: Build canvas-based Arc Reactor with real-time Web Audio API frequency analysis and particle ring animations.
3. **Voice & Multilingual Processing**: Implement browser wake-word recognition ("Shaka"), language classification (English, Hindi, Urdu, Roman Punjabi), and speech synthesis.
4. **Command Engine & Deterministic Actions**: Build full command dispatcher with 50+ built-in actions across apps, files, media, and hardware.
5. **Local Python Server Bridge**: Implement WebSocket protocol to communicate seamlessly with `ws://127.0.0.1:8765`, with automatic heartbeat and offline mode fallback.
6. **Python Project Exporter & 1-Click PowerShell Script**: Generate complete, tested Python source code files for Windows deployment with copy & download features.
7. **Verification & Testing**: Test all speech inputs, command executions, theme toggles, and verify compilation.
