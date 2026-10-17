import React, { useState } from 'react';
import { Download, FileCode, Copy, Check, Terminal, ShieldCheck, Play, FolderArchive, ArrowRight, Laptop } from 'lucide-react';
import { SHAKA_PYTHON_FILES, generateShakaZipBlob } from '../services/pythonPackageGenerator';
import { PythonPackageFile } from '../types/shaka';

export const PythonPackageViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<PythonPackageFile>(SHAKA_PYTHON_FILES[0]);
  const [copiedFileName, setCopiedFileName] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(1);

  const copyCode = (code: string, fileName: string) => {
    navigator.clipboard.writeText(code);
    setCopiedFileName(fileName);
    setTimeout(() => setCopiedFileName(null), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const blob = await generateShakaZipBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'shaka_assistant_windows.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Hero Banner: Beginner Windows Setup */}
      <div className="hud-panel rounded-xl p-6 border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-slate-950 via-[#0A111F] to-[#070A0F]">
        <div className="flex flex-col gap-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <Laptop className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono text-cyan-300 tracking-wider uppercase font-semibold">
              Windows PC Package · 8 GB RAM Optimized
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Run Shaka Locally On Your Windows Machine
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            All 8 modular Python automation files are prepared below. You can download the complete project as a pre-bundled <strong className="text-cyan-300">.zip archive</strong> or copy each file individually. Run the 1-click PowerShell installer to start your local AI server.
          </p>
        </div>

        {/* 1-Click Download Button */}
        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all shrink-0 cursor-pointer disabled:opacity-50"
        >
          <FolderArchive className="w-5 h-5 text-slate-950" />
          <span>{isZipping ? 'Bundling Zip...' : 'Download Shaka Package (.zip)'}</span>
        </button>
      </div>

      {/* Beginner Step-by-Step Flow Guide */}
      <div className="hud-panel rounded-xl p-5 border border-cyan-500/20 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-cyan-500/15">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Beginner Setup Checklist (5 Simple Steps)
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Hardware Verified: 8GB RAM + Intel Graphics</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            { step: 1, title: 'Extract Zip', desc: 'Unzip shaka_assistant_windows.zip to C:\\Shaka' },
            { step: 2, title: 'Open PowerShell', desc: 'Press Win+X and choose Windows PowerShell' },
            { step: 3, title: 'Navigate Folder', desc: 'Type: cd C:\\Shaka in your PowerShell window' },
            { step: 4, title: 'Run 1-Click Script', desc: 'Execute: .\\setup_and_run.ps1' },
            { step: 5, title: 'Voice Live', desc: 'Say "Shaka" to control Windows apps and audio' },
          ].map((s) => (
            <div
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                activeStep === s.step
                  ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                  : 'border-slate-800 bg-slate-900/30 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-[10px] font-mono font-semibold text-cyan-400 mb-1">
                STEP {s.step}
              </div>
              <div className="text-xs font-bold text-white mb-0.5">{s.title}</div>
              <div className="text-[11px] text-slate-400 leading-snug">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Code File Explorer & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left List of Files */}
        <div className="lg:col-span-4 flex flex-col gap-2">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider px-1">
            Project Files ({SHAKA_PYTHON_FILES.length})
          </div>

          <div className="flex flex-col gap-1.5">
            {SHAKA_PYTHON_FILES.map((file) => (
              <button
                key={file.name}
                onClick={() => setSelectedFile(file)}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1 ${
                  selectedFile.name === file.name
                    ? 'border-cyan-400/70 bg-cyan-950/50 text-cyan-200 shadow-[0_0_12px_rgba(0,229,255,0.15)]'
                    : 'border-slate-800/80 hover:border-slate-700 bg-slate-900/30 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-white flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{file.name}</span>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 uppercase">
                    {file.category}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1">{file.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Code Viewer */}
        <div className="lg:col-span-8 hud-panel rounded-xl border border-cyan-500/20 flex flex-col overflow-hidden">
          {/* Viewer Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/15 bg-slate-950/80">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold text-white">{selectedFile.name}</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">{selectedFile.description}</span>
            </div>

            <button
              onClick={() => copyCode(selectedFile.code, selectedFile.name)}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded-lg border border-slate-700 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-colors bg-slate-900/60"
            >
              {copiedFileName === selectedFile.name ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code Body */}
          <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[460px] bg-[#05070B] leading-relaxed selection:bg-cyan-500/30 selection:text-cyan-100">
            <code>{selectedFile.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
