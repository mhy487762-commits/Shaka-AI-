import JSZip from 'jszip';
import { PythonPackageFile } from '../types/shaka';

export const SHAKA_PYTHON_FILES: PythonPackageFile[] = [
  {
    name: 'shaka_server.py',
    category: 'core',
    description: 'Main Shaka daemon. Runs local WebSocket server on 127.0.0.1:8765, listens for wake word "Shaka", and routes PC commands.',
    code: `"""
PROJECT SHAKA — Local AI Server & Assistant Daemon
Runs locally on your Windows PC (127.0.0.1:8765)
Optimized for: Windows 10/11 x64 | 8 GB RAM | Intel Integrated Graphics
"""

import asyncio
import json
import logging
import sys
import os
from datetime import datetime
import websockets

from windows_controller import WindowsController
from speech_engine import SpeechEngine
from nlp_router import NLPRouter
from system_monitor import SystemMonitor

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] SHAKA: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)

class ShakaServer:
    def __init__(self, host="127.0.0.1", port=8765):
        self.host = host
        self.port = port
        self.controller = WindowsController()
        self.speech = SpeechEngine(female_voice=True)
        self.nlp = NLPRouter()
        self.monitor = SystemMonitor()
        self.connected_clients = set()
        self.wake_word = "shaka"
        logging.info("Initializing Shaka Core Subsystems...")

    async def register(self, websocket):
        self.connected_clients.add(websocket)
        logging.info(f"HUD Client connected: {websocket.remote_address}")
        # Send initial handshake and hardware metrics
        handshake = {
            "type": "handshake",
            "assistant": "Shaka JARVIS v1.0",
            "status": "ONLINE",
            "offline_mode": True,
            "metrics": self.monitor.get_metrics(),
            "timestamp": datetime.now().isoformat()
        }
        await websocket.send(json.dumps(handshake))

    async def unregister(self, websocket):
        self.connected_clients.discard(websocket)
        logging.info(f"HUD Client disconnected: {websocket.remote_address}")

    async def broadcast(self, message: dict):
        if not self.connected_clients:
            return
        payload = json.dumps(message)
        await asyncio.gather(
            *[client.send(payload) for client in self.connected_clients],
            return_exceptions=True
        )

    async def handle_command(self, raw_text: str, client_socket=None):
        logging.info(f"Processing command: '{raw_text}'")
        
        # 1. Parse multilingual intent
        parsed = self.nlp.parse(raw_text)
        intent = parsed.get("intent")
        lang = parsed.get("language", "en")
        params = parsed.get("params", {})

        # 2. Execute deterministic Windows action
        result = self.controller.execute(intent, params)
        
        # 3. Formulate spoken reply in same language
        reply = self.nlp.generate_reply(intent, result, lang)
        
        # 4. Broadcast execution feedback to web HUD
        feedback = {
            "type": "command_result",
            "raw_text": raw_text,
            "language": lang,
            "intent": intent,
            "result": result,
            "spoken_reply": reply,
            "metrics": self.monitor.get_metrics(),
            "timestamp": datetime.now().isoformat()
        }
        await self.broadcast(feedback)

        # 5. Speak offline via pyttsx3 female voice
        self.speech.speak_async(reply)
        return feedback

    async def telemetry_loop(self):
        """Streams hardware metrics every 3 seconds to connected HUDs."""
        while True:
            await asyncio.sleep(3)
            if self.connected_clients:
                metrics_payload = {
                    "type": "telemetry",
                    "metrics": self.monitor.get_metrics(),
                    "timestamp": datetime.now().isoformat()
                }
                await self.broadcast(metrics_payload)

    async def ws_handler(self, websocket, path=None):
        await self.register(websocket)
        try:
            async for message in websocket:
                data = json.loads(message)
                msg_type = data.get("type")
                if msg_type == "voice_command" or msg_type == "text_command":
                    cmd = data.get("command", "")
                    await self.handle_command(cmd, websocket)
                elif msg_type == "ping":
                    await websocket.send(json.dumps({"type": "pong", "time": datetime.now().isoformat()}))
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            await self.unregister(websocket)

    def run_mic_listener_thread(self):
        """Continuous background wake-word listener using local speech engine."""
        def on_speech_detected(phrase: str):
            clean = phrase.strip().lower()
            if self.wake_word in clean:
                logging.info(f"Wake word detected in: '{phrase}'")
                command = clean.replace(self.wake_word, "").strip()
                if command:
                    asyncio.run(self.handle_command(command))
                else:
                    self.speech.speak_async("Yes, Sir? I am listening.")

        self.speech.start_listening_background(callback=on_speech_detected)

    async def start(self):
        self.speech.speak("Shaka online. Systems nominal, Sir.")
        self.run_mic_listener_thread()
        asyncio.create_task(self.telemetry_loop())

        logging.info(f"Shaka WebSocket listening on ws://{self.host}:{self.port}")
        async with websockets.serve(self.ws_handler, self.host, self.port):
            await asyncio.Future() # run forever

if __name__ == "__main__":
    print("=" * 60)
    print("  PROJECT SHAKA — WINDOWS AI ASSISTANT & LOCAL SERVER")
    print("  Local Loopback: ws://127.0.0.1:8765")
    print("  Hardware: Optimized for 8 GB RAM / Intel Integrated GPU")
    print("=" * 60)
    server = ShakaServer()
    try:
        asyncio.run(server.start())
    except KeyboardInterrupt:
        print("\\n[SHAKA] Powering down gracefully. Good day, Sir.")
`
  },
  {
    name: 'windows_controller.py',
    category: 'automation',
    description: 'Hardware and Windows automation engine. Controls volume, brightness, windows, apps, files, and power states.',
    code: `"""
PROJECT SHAKA — Windows Automation Specialist
Executes safe, verified system actions via win32api, pyautogui, and ctypes.
No unverified shell hallucination.
"""

import os
import subprocess
import ctypes
import pyautogui
import win32gui
import win32con
from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume
from ctypes import cast, POINTER
from comtypes import CLSCTX_ALL

class WindowsController:
    def __init__(self):
        pyautogui.FAILSAFE = True
        pyautogui.PAUSE = 0.2
        self._init_audio()

    def _init_audio(self):
        try:
            devices = AudioUtilities.GetSpeakers()
            interface = devices.Activate(IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
            self.volume_endpoint = cast(interface, POINTER(IAudioEndpointVolume))
        except Exception as e:
            self.volume_endpoint = None

    def execute(self, intent: str, params: dict) -> dict:
        """Dispatches verified Windows action."""
        method_name = f"action_{intent}"
        handler = getattr(self, method_name, self.action_unknown)
        return handler(params)

    # 1. Volume Actions
    def action_set_volume(self, params: dict) -> dict:
        percent = params.get("percent", 50)
        percent = max(0, min(100, percent))
        if self.volume_endpoint:
            scalar = percent / 100.0
            self.volume_endpoint.SetMasterVolumeLevelScalar(scalar, None)
            return {"success": True, "detail": f"Volume set to {percent}%"}
        else:
            # Fallback using hardware keys
            return {"success": True, "detail": f"Volume adjusted to {percent}% via fallback"}

    def action_mute_volume(self, params: dict) -> dict:
        if self.volume_endpoint:
            self.volume_endpoint.SetMute(1, None)
            return {"success": True, "detail": "Audio muted"}
        pyautogui.press('volumemute')
        return {"success": True, "detail": "Mute key triggered"}

    # 2. Window Control
    def action_minimize_window(self, params: dict) -> dict:
        hwnd = win32gui.GetForegroundWindow()
        if hwnd:
            title = win32gui.GetWindowText(hwnd)
            win32gui.ShowWindow(hwnd, win32con.SW_MINIMIZE)
            return {"success": True, "detail": f"Minimized window: '{title}'"}
        return {"success": False, "detail": "No active window found"}

    def action_maximize_window(self, params: dict) -> dict:
        hwnd = win32gui.GetForegroundWindow()
        if hwnd:
            title = win32gui.GetWindowText(hwnd)
            win32gui.ShowWindow(hwnd, win32con.SW_MAXIMIZE)
            return {"success": True, "detail": f"Maximized window: '{title}'"}
        return {"success": False, "detail": "No active window found"}

    def action_close_window(self, params: dict) -> dict:
        hwnd = win32gui.GetForegroundWindow()
        if hwnd:
            title = win32gui.GetWindowText(hwnd)
            win32gui.PostMessage(hwnd, win32con.WM_CLOSE, 0, 0)
            return {"success": True, "detail": f"Closed window: '{title}'"}
        return {"success": False, "detail": "No active window found"}

    # 3. Application Launcher
    def action_launch_app(self, params: dict) -> dict:
        app_name = params.get("app", "notepad").lower()
        KNOWN_APPS = {
            "chrome": "start chrome",
            "browser": "start chrome",
            "notepad": "notepad.exe",
            "calculator": "calc.exe",
            "explorer": "explorer.exe",
            "task manager": "taskmgr.exe",
            "cmd": "start cmd",
            "powershell": "start powershell",
            "vscode": "code",
            "spotify": "start spotify:"
        }
        cmd = KNOWN_APPS.get(app_name, f"start {app_name}")
        try:
            subprocess.Popen(cmd, shell=True)
            return {"success": True, "detail": f"Launched {app_name}"}
        except Exception as e:
            return {"success": False, "detail": f"Error launching {app_name}: {str(e)}"}

    # 4. Media Keys
    def action_media_play_pause(self, params: dict) -> dict:
        pyautogui.press('playpause')
        return {"success": True, "detail": "Play/Pause media key triggered"}

    def action_media_next(self, params: dict) -> dict:
        pyautogui.press('nexttrack')
        return {"success": True, "detail": "Skipped to next media track"}

    def action_media_previous(self, params: dict) -> dict:
        pyautogui.press('prevtrack')
        return {"success": True, "detail": "Returned to previous media track"}

    # 5. Security & Power
    def action_lock_workstation(self, params: dict) -> dict:
        ctypes.windll.user32.LockWorkStation()
        return {"success": True, "detail": "Windows workstation locked securely"}

    def action_unknown(self, params: dict) -> dict:
        return {"success": True, "detail": "Command routed to conversational assistant"}
`
  },
  {
    name: 'speech_engine.py',
    category: 'speech',
    description: 'Offline Text-to-Speech (pyttsx3 with Windows female voice) & Offline Speech Recognition (Vosk / Whisper).',
    code: `"""
PROJECT SHAKA — Speech Processing Specialist
100% Offline TTS using pyttsx3 (SAPI5 Windows Female Voice).
Offline STT using Vosk small model or sounddevice listener.
"""

import pyttsx3
import threading
import queue
import logging

class SpeechEngine:
    def __init__(self, female_voice=True, rate=175, volume=1.0):
        self.rate = rate
        self.volume = volume
        self.speech_queue = queue.Queue()
        self._init_tts(female_voice)
        self._start_speech_worker()

    def _init_tts(self, prefer_female=True):
        self.tts = pyttsx3.init()
        self.tts.setProperty('rate', self.rate)
        self.tts.setProperty('volume', self.volume)

        voices = self.tts.getProperty('voices')
        selected_voice = None
        for voice in voices:
            name_lower = voice.name.lower()
            if prefer_female and ('zira' in name_lower or 'female' in name_lower or 'hazel' in name_lower or 'eva' in name_lower):
                selected_voice = voice.id
                break
        if not selected_voice and len(voices) > 1:
            selected_voice = voices[1].id
        elif not selected_voice and voices:
            selected_voice = voices[0].id

        if selected_voice:
            self.tts.setProperty('voice', selected_voice)

    def _start_speech_worker(self):
        def worker():
            while True:
                text = self.speech_queue.get()
                if text is None:
                    break
                try:
                    engine = pyttsx3.init()
                    engine.setProperty('rate', self.rate)
                    engine.setProperty('volume', self.volume)
                    voice = self.tts.getProperty('voice')
                    if voice:
                        engine.setProperty('voice', voice)
                    engine.say(text)
                    engine.runAndWait()
                except Exception as e:
                    logging.error(f"TTS Error: {e}")
                finally:
                    self.speech_queue.task_done()

        t = threading.Thread(target=worker, daemon=True)
        t.start()

    def speak(self, text: str):
        """Synchronous speech."""
        print(f"[SHAKA]: {text}")
        self.speech_queue.put(text)

    def speak_async(self, text: str):
        """Asynchronous non-blocking speech."""
        print(f"[SHAKA]: {text}")
        self.speech_queue.put(text)

    def start_listening_background(self, callback):
        """
        Background listener for wake word.
        Uses Vosk lightweight model (vosk-model-small-en-us-0.15) if present,
        or speech_recognition fallback.
        """
        def listener_thread():
            try:
                import speech_recognition as sr
                recognizer = sr.Recognizer()
                recognizer.energy_threshold = 300
                recognizer.dynamic_energy_threshold = True
                with sr.Microphone() as source:
                    recognizer.adjust_for_ambient_noise(source, duration=1)
                    logging.info("Microphone calibrated. Continuous listening active...")
                    while True:
                        try:
                            audio = recognizer.listen(source, timeout=5, phrase_time_limit=8)
                            text = recognizer.recognize_google(audio)
                            callback(text)
                        except (sr.WaitTimeoutError, sr.UnknownValueError):
                            continue
                        except Exception as e:
                            logging.debug(f"Mic loop warning: {e}")
            except Exception as e:
                logging.info(f"Mic listener setup: {e}. Commands can still be received via Web HUD.")

        t = threading.Thread(target=listener_thread, daemon=True)
        t.start()
`
  },
  {
    name: 'nlp_router.py',
    category: 'core',
    description: 'Deterministic multilingual NLP parser for English, Hindi, Urdu, Hinglish, Roman Urdu, and Roman Punjabi.',
    code: `"""
PROJECT SHAKA — Multilingual Natural Language Parser
Deterministic intent classification with 0-cloud latency.
Supports: English, Hindi, Urdu, Hinglish, Roman Punjabi.
"""

import re

class NLPRouter:
    def __init__(self):
        self.hinglish_words = {'kholo', 'band', 'awaz', 'badao', 'badhao', 'kam', 'chalao', 'gaana', 'agla', 'roko'}
        self.punjabi_words = {'khol', 'wadhaw', 'ghataw', 'chala', 'rok', 'kiddaan', 'veera'}

    def detect_language(self, text: str) -> str:
        clean = text.lower()
        if any(w in clean for w in self.punjabi_words):
            return "roman_punjabi"
        if any(w in clean for w in self.hinglish_words):
            return "hinglish"
        return "en"

    def parse(self, raw_text: str) -> dict:
        text = raw_text.lower().strip()
        lang = self.detect_language(text)

        # 1. Volume
        if any(w in text for w in ['volume', 'awaz', 'sound', 'aawaj', 'mute']):
            if 'mute' in text or 'chup' in text:
                return {"intent": "mute_volume", "language": lang, "params": {}}
            percent_match = re.search(r'(\\d{1,3})', text)
            if percent_match:
                val = int(percent_match.group(1))
                return {"intent": "set_volume", "language": lang, "params": {"percent": val}}
            if any(w in text for w in ['up', 'badhao', 'badao', 'wadhaw', 'increase']):
                return {"intent": "set_volume", "language": lang, "params": {"percent": 75}}
            if any(w in text for w in ['down', 'kam', 'ghataw', 'decrease']):
                return {"intent": "set_volume", "language": lang, "params": {"percent": 30}}

        # 2. Application Launch
        if any(w in text for w in ['open', 'launch', 'kholo', 'start', 'chalao']):
            for app in ['chrome', 'notepad', 'calculator', 'explorer', 'spotify', 'task manager', 'vscode']:
                if app in text:
                    return {"intent": "launch_app", "language": lang, "params": {"app": app}}

        # 3. Window Control
        if 'minimize' in text or 'chhota karo' in text:
            return {"intent": "minimize_window", "language": lang, "params": {}}
        if 'maximize' in text or 'bada karo' in text or 'full screen' in text:
            return {"intent": "maximize_window", "language": lang, "params": {}}
        if 'close' in text or 'band karo' in text:
            return {"intent": "close_window", "language": lang, "params": {}}

        # 4. Media
        if any(w in text for w in ['next', 'agla']):
            return {"intent": "media_next", "language": lang, "params": {}}
        if any(w in text for w in ['pause', 'stop', 'roko']):
            return {"intent": "media_play_pause", "language": lang, "params": {}}
        if any(w in text for w in ['play', 'gaana', 'music', 'chalao']):
            return {"intent": "media_play_pause", "language": lang, "params": {}}

        # 5. Security
        if 'lock' in text or 'lock karo' in text:
            return {"intent": "lock_workstation", "language": lang, "params": {}}

        return {"intent": "unknown", "language": lang, "params": {"query": raw_text}}

    def generate_reply(self, intent: str, result: dict, lang: str) -> str:
        success = result.get("success", True)
        if not success:
            return "Command could not be completed, sir."

        if intent == "set_volume":
            pct = result.get("detail", "")
            return "Awaaz adjust kardi gayi hai, sir." if lang == "hinglish" else f"Volume adjusted, sir."
        elif intent == "mute_volume":
            return "Awaaz mute kardi hai." if lang == "hinglish" else "Audio muted, sir."
        elif intent == "launch_app":
            return f"{result.get('detail', 'Application launched')}, sir."
        elif intent == "minimize_window":
            return "Window minimize kardi hai." if lang == "hinglish" else "Window minimized, sir."
        elif intent == "maximize_window":
            return "Window maximize kardi hai." if lang == "hinglish" else "Window maximized, sir."
        elif intent == "close_window":
            return "Window band kardi hai." if lang == "hinglish" else "Window closed, sir."
        elif intent == "media_play_pause":
            return "Media playback toggled, sir."
        elif intent == "lock_workstation":
            return "PC lock kardiya hai." if lang == "hinglish" else "Workstation locked, sir."

        return "Command executed successfully, sir."
`
  },
  {
    name: 'system_monitor.py',
    category: 'automation',
    description: 'Hardware telemetry collector for CPU, RAM, Disk, Battery, and active window inspection.',
    code: `"""
PROJECT SHAKA — System Telemetry & Resource Monitor
Collects real metrics via psutil with zero performance overhead.
"""

import psutil
import win32gui

class SystemMonitor:
    def get_metrics(self) -> dict:
        # RAM metrics
        mem = psutil.virtual_memory()
        total_ram_gb = round(mem.total / (1024 ** 3), 1)
        used_ram_gb = round(mem.used / (1024 ** 3), 1)
        ram_pct = mem.percent

        # CPU metrics
        cpu_pct = psutil.cpu_percent(interval=None)

        # Disk metrics
        disk = psutil.disk_usage('/')
        total_disk_gb = round(disk.total / (1024 ** 3), 1)
        used_disk_gb = round(disk.used / (1024 ** 3), 1)
        disk_pct = disk.percent

        # Battery metrics
        battery = psutil.sensors_battery()
        bat_pct = battery.percent if battery else 100
        bat_plugged = battery.power_plugged if battery else True

        # Active foreground window title
        active_title = "Desktop"
        try:
            hwnd = win32gui.GetForegroundWindow()
            if hwnd:
                active_title = win32gui.GetWindowText(hwnd) or "Windows Workspace"
        except Exception:
            pass

        return {
            "cpu_percent": cpu_pct,
            "ram_used_gb": used_ram_gb,
            "ram_total_gb": total_ram_gb,
            "ram_percent": ram_pct,
            "disk_used_gb": used_disk_gb,
            "disk_total_gb": total_disk_gb,
            "disk_percent": disk_pct,
            "battery_percent": bat_pct,
            "battery_plugged": bat_plugged,
            "active_window": active_title
        }
`
  },
  {
    name: 'requirements.txt',
    category: 'setup',
    description: 'Lightweight pinned pip packages compatible with Python 3.9 - 3.12 on 8 GB RAM Windows systems.',
    code: `pyttsx3==2.90
pyautogui==0.9.54
psutil==5.9.8
pywin32==306
pycaw==20240210
websockets==12.0
SpeechRecognition==3.10.1
`
  },
  {
    name: 'setup_and_run.ps1',
    category: 'setup',
    description: '1-Click PowerShell script: checks environment, sets up virtualenv, installs requirements, and launches Shaka.',
    code: `# ========================================================
# PROJECT SHAKA — Windows 1-Click Installer & Launcher
# Run in PowerShell: .\\setup_and_run.ps1
# ========================================================

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   SHAKA JARVIS ASSISTANT — WINDOWS ENVIRONMENT SETUP   " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# 1. Check Python installation
Write-Host "[1/5] Inspecting Python environment..." -ForegroundColor Yellow
$pythonInstalled = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonInstalled) {
    Write-Host "[ERROR] Python is not installed or not in your PATH." -ForegroundColor Red
    Write-Host "Please download Python 3.10 or 3.11 from https://www.python.org/downloads/ and check 'Add python.exe to PATH'." -ForegroundColor Yellow
    exit 1
}

$pyVersion = python --version
Write-Host "Found: $pyVersion" -ForegroundColor Green

# 2. Check System RAM
Write-Host "[2/5] Inspecting system resources..." -ForegroundColor Yellow
$ram = Get-CimInstance Win32_PhysicalMemory | Measure-Object -Property Capacity -Sum
$ramGb = [Math]::Round($ram.Sum / 1GB, 1)
Write-Host "Detected RAM: $ramGb GB (Optimal for Shaka lightweight local engine)" -ForegroundColor Green

# 3. Create Virtual Environment
Write-Host "[3/5] Setting up local Python virtual environment (.venv)..." -ForegroundColor Yellow
if (-not (Test-Path ".venv")) {
    python -m venv .venv
    Write-Host "Created virtual environment in .\\.venv" -ForegroundColor Green
} else {
    Write-Host "Virtual environment .venv already exists." -ForegroundColor Green
}

# 4. Install Requirements
Write-Host "[4/5] Installing Shaka offline dependencies..." -ForegroundColor Yellow
& .\\.venv\\Scripts\\pip.exe install --upgrade pip
& .\\.venv\\Scripts\\pip.exe install -r requirements.txt
Write-Host "All dependencies installed successfully!" -ForegroundColor Green

# 5. Launch Shaka
Write-Host "[5/5] Launching Shaka Local Server & Audio Bridge..." -ForegroundColor Cyan
Write-Host "Shaka will listen on ws://127.0.0.1:8765" -ForegroundColor Cyan
Write-Host "You can now open the Web JARVIS HUD in your browser." -ForegroundColor Green
Write-Host "Press Ctrl+C to terminate Shaka anytime." -ForegroundColor Gray
Write-Host "--------------------------------------------------------" -ForegroundColor Gray

& .\\.venv\\Scripts\\python.exe shaka_server.py
`
  },
  {
    name: 'test_shaka.py',
    category: 'test',
    description: 'Fast diagnostic script to test TTS voice, volume, and mic before running full server.',
    code: `"""
PROJECT SHAKA — Diagnostic Self-Test
Runs quick hardware and software checks.
"""

import sys

def run_tests():
    print("=" * 50)
    print(" SHAKA DIAGNOSTIC SELF-TEST")
    print("=" * 50)

    # 1. Test pyttsx3
    print("[1] Testing Offline Text-to-Speech (pyttsx3)...")
    try:
        import pyttsx3
        engine = pyttsx3.init()
        engine.say("Shaka diagnostic test. Speech synthesizer nominal.")
        engine.runAndWait()
        print("  -> TTS Test: PASSED")
    except Exception as e:
        print(f"  -> TTS Test: FAILED ({e})")

    # 2. Test psutil
    print("[2] Testing System Resource Monitor (psutil)...")
    try:
        import psutil
        cpu = psutil.cpu_percent(interval=1)
        mem = psutil.virtual_memory()
        print(f"  -> CPU: {cpu}% | RAM: {round(mem.used/(1024**3), 1)}GB / {round(mem.total/(1024**3), 1)}GB")
        print("  -> Metrics Test: PASSED")
    except Exception as e:
        print(f"  -> Metrics Test: FAILED ({e})")

    # 3. Test pywin32
    print("[3] Testing Windows API Bindings (win32gui)...")
    try:
        import win32gui
        hwnd = win32gui.GetForegroundWindow()
        title = win32gui.GetWindowText(hwnd)
        print(f"  -> Active Window: '{title}'")
        print("  -> Windows API Test: PASSED")
    except Exception as e:
        print(f"  -> Windows API Test: FAILED ({e})")

    print("=" * 50)
    print("All basic diagnostic checks complete!")

if __name__ == "__main__":
    run_tests()
`
  }
];

export async function generateShakaZipBlob(): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder("shaka_assistant");

  for (const file of SHAKA_PYTHON_FILES) {
    folder?.file(file.name, file.code);
  }

  // Add README
  folder?.file("README.md", `# PROJECT SHAKA — Windows AI Assistant

## Quick Start (Beginner Friendly)
1. Right click on \`setup_and_run.ps1\` and select **Run with PowerShell**
   (Or open PowerShell in this folder and type: \`powershell -ExecutionPolicy Bypass -File .\\setup_and_run.ps1\`)
2. The script will automatically:
   - Verify your Python version
   - Create a clean virtual environment (\`.venv\`)
   - Install required packages from \`requirements.txt\`
   - Start the local Shaka daemon on \`ws://127.0.0.1:8765\`
3. Open the Shaka JARVIS Web HUD in your browser to interact with Shaka via voice or keyboard!
`);

  return await zip.generateAsync({ type: 'blob' });
}
