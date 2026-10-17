import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize Gemini SDK with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Server-side Gemini reasoning API endpoint
app.post('/api/ai/reason', async (req, res) => {
  try {
    const { prompt, conversationHistory = [], language = 'English', mode = 'online' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    if (!ai) {
      // Local fallback reasoning if no API key is attached
      const fallbackResponse = `[Offline Brain]: Received command "${prompt}". Operating in local deterministic mode.`;
      res.json({ text: fallbackResponse, languageDetected: language, source: 'offline-local-brain' });
      return;
    }

    const systemInstruction = `You are SHAKA, a futuristic JARVIS-style personal AI assistant for a Windows PC.
You are running as the user's personal companion.
Language instruction: The user may speak English, Hindi, Urdu, Hinglish, Roman Urdu, or Roman Punjabi.
Respond naturally in the EXACT SAME LANGUAGE/DIALECT as the user's prompt whenever possible.
If the prompt is in Hinglish, reply in friendly, concise, natural Hinglish.
Tone: Confident, crisp, polite, friendly female JARVIS voice persona. Keep responses under 2-3 sentences for voice delivery.
Do not recommend dangerous or unverified system commands.
Current PC hardware context: 8 GB RAM, Windows 10/11, Intel Integrated Graphics.`;

    const contents = [
      ...conversationHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })),
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const text = response.text || "Command processed, sir.";
    res.json({ text, source: 'gemini-3.8-flash' });
  } catch (err: any) {
    console.error('Gemini reasoning error:', err);
    res.status(500).json({ 
      error: 'AI Reasoning failed', 
      details: err?.message || 'Unknown error',
      fallbackText: "I am having trouble reaching cloud intelligence, Sir. Operating in local offline mode."
    });
  }
});

// System check / status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    name: 'Project Shaka Local Bridge Gateway',
    version: '1.0.0',
    status: 'ONLINE',
    hasGeminiKey: !!apiKey,
    recommendedModel: 'gemini-3.8-flash',
    localSocketPort: 8765,
    systemTarget: 'Windows 10/11 x64',
    timestamp: new Date().toISOString()
  });
});

async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Shaka Assistant server running at http://localhost:${PORT}`);
  });
}

startServer();
