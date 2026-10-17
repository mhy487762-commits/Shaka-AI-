# PROJECT SHAKA — Personal JARVIS-Style Windows AI Assistant

![Project Shaka Status](https://img.shields.io/badge/Status-Nominal-00e5ff?style=flat-square)
![OS Target](https://img.shields.io/badge/Platform-Windows%2010%2F11%20x64-blue?style=flat-square)
![Hardware Target](https://img.shields.io/badge/Hardware-8GB%20RAM%20%7C%20Intel%20Graphics-emerald?style=flat-square)
![Offline Mode](https://img.shields.io/badge/Offline%20Engine-100%25%20Functional-10b981?style=flat-square)

**SHAKA** is a personal, multilingual, voice-controlled AI assistant inspired by Iron Man's JARVIS. It runs locally on your own Windows PC, operating as an autonomous system controller, hardware monitor, and intelligent voice companion.

---

## Key Features

1. **Voice Activation & Wake Word**
   - Continuously monitors for the wake word **"Shaka"**.
   - Natural, friendly female voice (SAPI5 / Microsoft Zira / Web Speech API) with adjustable speed, pitch, and volume.
   - States: `IDLE`, `LISTENING`, `PROCESSING`, `EXECUTING`, and `SPEAKING`.

2. **Multilingual Speech Intelligence**
   - Understands and speaks in **English**, **Hindi**, **Urdu**, **Hinglish**, and **Roman Punjabi**.
   - Automatically detects the spoken language and replies in the same language.
   - Handles mixed-language speech and English technical terms seamlessly (e.g., *"Shaka, agla gaana chalao aur volume 50 percent kardo"*).

3. **100% Offline Core Operations**
   - Essential PC operations require **zero internet connection** and no external API keys.
   - Offline speech recognition and offline text-to-speech.
   - Automatically switches between Offline Local Mode and Online Intelligence.

4. **Complete Windows PC Automation**
   - **Audio & Volume**: Adjust master volume by percentage (0–100%), mute/unmute.
   - **Application Launching**: Open Chrome, Notepad, File Explorer, VS Code, Spotify, Calculator, Task Manager, Windows Terminal.
   - **Window Management**: Minimize foreground window, maximize/fullscreen, close active window, switch windows.
   - **Media Playback**: Play/pause audio or video, skip to next track, return to previous track.
   - **Web & Browser Automation**: Search Google or YouTube directly via voice.
   - **System & Security**: Lock workstation (`Win+L`), inspect CPU, RAM, disk space, and battery life.
   - **Safety Confirmation Gates**: Prompts for explicit verbal/manual confirmation before destructive actions (e.g., PC shutdown).

5. **Futuristic JARVIS Desktop HUD**
   - Dynamic canvas Arc Reactor core responding to voice audio decibels.
   - Real-time hardware telemetry gauges (CPU %, RAM used/total, Disk %, Battery %).
   - Persistent memory and custom voice macros builder (saved locally).
   - Live transcription stream and verified execution action logs with undo support.

---

## Hardware & System Requirements

- **Operating System**: Windows 10 or Windows 11 (64-bit)
- **RAM**: 8 GB (optimized for minimal memory footprint: < 150 MB RAM)
- **Processor & Graphics**: Intel Core i3/i5/i7 or AMD Ryzen, Intel Integrated Graphics (UHD/Iris Xe)
- **Python**: Python 3.9, 3.10, 3.11, or 3.12 (with `Add python.exe to PATH` enabled during install)
- **PowerShell**: Windows PowerShell 5.1 or PowerShell 7 (pre-installed on Windows)

---

## Beginner-Friendly Quick Start (5 Simple Steps)

### Step 1: Download the Shaka Windows Package
Click the **"Download Shaka Package (.zip)"** button in the **Python Server Setup** tab of the Shaka Web HUD, or extract the provided project files into a folder (e.g., `C:\Shaka`).

### Step 2: Open Windows PowerShell
1. Press `Win + X` on your keyboard.
2. Click **Terminal** or **Windows PowerShell**.

### Step 3: Navigate to Your Shaka Folder
Type the following command and press Enter:
```powershell
cd C:\Shaka
```

### Step 4: Run the 1-Click Installer & Launcher
Run the automated setup script:
```powershell
powershell -ExecutionPolicy Bypass -File .\setup_and_run.ps1
```
> **What this script does automatically:**
> - Checks your Python version and verifies 8 GB RAM compatibility.
> - Creates a dedicated local virtual environment (`.venv`).
> - Installs lightweight, tested dependencies (`pyttsx3`, `pyautogui`, `psutil`, `pywin32`, `pycaw`, `websockets`).
> - Starts the local Shaka daemon on `ws://127.0.0.1:8765`.

### Step 5: Connect and Speak!
Open the **Shaka Web HUD** in your browser. The status bar will show `127.0.0.1:8765 LINKED`.
Click the Arc Reactor or say **"Shaka"** to begin voice commands!

---

## Voice Commands Reference

| Category | Sample English Command | Sample Hinglish / Urdu Command | System Action |
| :--- | :--- | :--- | :--- |
| **Volume** | *"Shaka, volume 60 percent"* | *"Shaka, aawaz 60 percent kardo"* | Sets master audio endpoint to 60% |
| **Volume** | *"Shaka, mute audio"* | *"Shaka, aawaz band karo"* | Mutes master Windows audio |
| **Apps** | *"Shaka, open Chrome"* | *"Shaka, Chrome kholo"* | Spawns `chrome.exe` process |
| **Apps** | *"Shaka, open Notepad"* | *"Shaka, Notepad shuru karo"* | Spawns `notepad.exe` |
| **Apps** | *"Shaka, open File Explorer"* | *"Shaka, documents folder kholo"* | Opens Windows File Explorer |
| **Window** | *"Shaka, minimize window"* | *"Shaka, window chhota karo"* | Minimizes active foreground window |
| **Window** | *"Shaka, maximize window"* | *"Shaka, window full screen karo"* | Maximizes active foreground window |
| **Window** | *"Shaka, close that window"* | *"Shaka, ye window band karo"* | Gracefully closes foreground handle |
| **Media** | *"Shaka, play music"* | *"Shaka, gaana chalao"* | Dispatches hardware Play/Pause key |
| **Media** | *"Shaka, next track"* | *"Shaka, agla gaana lagao"* | Dispatches hardware Next Track key |
| **Search** | *"Shaka, search YouTube for lofi"*| *"Shaka, YouTube pe relax music search karo"* | Opens YouTube search in browser |
| **Hardware** | *"Shaka, how much RAM is left?"*| *"Shaka, RAM kitni bachi hai?"* | Reports actual RAM, CPU, and Battery |
| **Security** | *"Shaka, lock PC"* | *"Shaka, computer lock kardo"* | Locks Windows Workstation (`Win+L`) |
| **Power** | *"Shaka, shut down computer"* | *"Shaka, PC band karo"* | Triggers safety confirmation gate |

---

## Project Structure

```
C:\Shaka\
├── shaka_server.py        # Central daemon & WebSocket server (ws://127.0.0.1:8765)
├── windows_controller.py  # Native Windows automation (pywin32, pyautogui, pycaw)
├── speech_engine.py       # Offline TTS (pyttsx3 female voice) & Offline STT
├── nlp_router.py          # Deterministic multilingual NLP parser & intent mapper
├── system_monitor.py      # Hardware telemetry collector (CPU, RAM, Disk, Battery)
├── test_shaka.py          # Diagnostic self-test script for mic, voice, and APIs
├── requirements.txt       # Pinned, lightweight dependencies (< 150 MB footprint)
├── setup_and_run.ps1      # 1-Click PowerShell environment installer & launcher
└── README.md              # Documentation and guide
```

---

## Offline vs. Online Architecture

| Feature | Offline Mode (Local PC) | Online Mode (Cloud Enhanced) |
| :--- | :--- | :--- |
| **Wake-Word Detection** | 100% Local (Vosk / Web Speech) | Supported |
| **PC Automation** | 100% Local (win32api / pycaw) | Supported |
| **Text-to-Speech** | 100% Local (SAPI5 / pyttsx3) | Supported |
| **Multilingual Parsing** | 100% Local (nlp_router regex) | Supported |
| **Hardware Telemetry** | 100% Local (psutil kernel) | Supported |
| **Web & YouTube Search** | Opens local browser directly | Supported |
| **Deep Conversational AI**| Local deterministic fallback | Gemini 3.8 Flash Neural Brain |

---

## Troubleshooting & FAQ

### 1. `setup_and_run.ps1` gives an "ExecutionPolicy" error
Run this command in PowerShell to temporarily allow local script execution:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\setup_and_run.ps1
```

### 2. How do I test the voice and microphone quickly?
Run the built-in diagnostic test script:
```powershell
.\.venv\Scripts\python.exe test_shaka.py
```
This will speak a test phrase through your speakers, print your CPU/RAM metrics, and inspect the active window.

### 3. How do I change Shaka's voice?
In the Shaka Web HUD, go to **Speech & Languages** to adjust voice cadence (rate), female pitch, and master volume. In Python, `speech_engine.py` automatically selects Microsoft Zira or any installed Windows SAPI5 female voice.

### 4. Is any of my personal data or voice sent to the cloud?
No. All wake-word listening, volume commands, application launches, and system operations happen strictly on `127.0.0.1` (your local PC). When Online Mode is toggled on, only general conversational questions are sent to the Gemini API via server-side proxy routes.

---

## Safety & Security Guidelines

- **No Arbitrary Code Execution**: Shaka uses a deterministic command registry. It never executes unvalidated arbitrary terminal strings.
- **Confirmation Prompts**: High-impact system actions (like shutting down the machine) require explicit verbal or UI confirmation.
- **Local Loopback Only**: The WebSocket server binds exclusively to `127.0.0.1:8765`, preventing any external network access to your PC.
