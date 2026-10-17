import React, { useState } from 'react';
import { Database, Plus, Trash2, Search, Download, RefreshCw, Zap, ShieldAlert, Check } from 'lucide-react';
import { MemoryItem, RoutineItem, LanguageCode } from '../types/shaka';

interface MemoryRoutinesModalProps {
  memoryItems: MemoryItem[];
  routines: RoutineItem[];
  onAddMemory: (key: string, value: string, category: 'preference' | 'routine' | 'fact' | 'authorized_path') => void;
  onDeleteMemory: (id: string) => void;
  onClearAllMemory: () => void;
  onAddRoutine: (routine: Omit<RoutineItem, 'id'>) => void;
  onToggleRoutine: (id: string) => void;
  onDeleteRoutine: (id: string) => void;
}

export const MemoryRoutinesModal: React.FC<MemoryRoutinesModalProps> = ({
  memoryItems,
  routines,
  onAddMemory,
  onDeleteMemory,
  onClearAllMemory,
  onAddRoutine,
  onToggleRoutine,
  onDeleteRoutine,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'memory' | 'routines'>('memory');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New memory form state
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCat, setNewCat] = useState<'preference' | 'routine' | 'fact' | 'authorized_path'>('preference');
  const [showAddMemory, setShowAddMemory] = useState(false);

  // New routine form state
  const [routineName, setRoutineName] = useState('');
  const [routineTrigger, setRoutineTrigger] = useState('');
  const [routineLang, setRoutineLang] = useState<LanguageCode>('en');
  const [routineActionText, setRoutineActionText] = useState('');
  const [showAddRoutine, setShowAddRoutine] = useState(false);

  const filteredMemory = memoryItems.filter(item => 
    item.key.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;
    onAddMemory(newKey.trim(), newValue.trim(), newCat);
    setNewKey('');
    setNewValue('');
    setShowAddMemory(false);
  };

  const handleCreateRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routineName.trim() || !routineTrigger.trim() || !routineActionText.trim()) return;
    const actions = routineActionText.split('\n').filter(a => a.trim().length > 0);
    onAddRoutine({
      name: routineName.trim(),
      triggerPhrase: routineTrigger.trim(),
      language: routineLang,
      actions,
      enabled: true,
    });
    setRoutineName('');
    setRoutineTrigger('');
    setRoutineActionText('');
    setShowAddRoutine(false);
  };

  const exportMemoryJson = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      assistant: "Shaka JARVIS OS",
      memory: memoryItems,
      routines: routines,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shaka_persistent_memory_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="hud-panel rounded-xl p-6 border border-cyan-500/20 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-cyan-500/15 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide">Persistent Memory & Custom Routines</h3>
            <p className="text-xs text-slate-400">Local-first encrypted storage. Never transmits passwords or credentials.</p>
          </div>
        </div>

        {/* Sub-tabs & Action Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveSubTab('memory')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeSubTab === 'memory'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Stored Knowledge ({memoryItems.length})
            </button>
            <button
              onClick={() => setActiveSubTab('routines')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeSubTab === 'routines'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Voice Routines ({routines.length})
            </button>
          </div>

          <button
            onClick={exportMemoryJson}
            className="p-1.5 rounded-lg border border-slate-800 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300 transition-colors"
            title="Export local memory as JSON"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {activeSubTab === 'memory' ? (
        <div className="flex flex-col gap-4">
          {/* Controls bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search memories, preferences..."
                className="w-full bg-[#070A0F] border border-cyan-500/20 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400/60 font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddMemory(!showAddMemory)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-400 text-slate-950 font-semibold text-xs hover:bg-cyan-300 transition-colors shadow-[0_0_12px_rgba(0,229,255,0.3)]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Memory</span>
              </button>

              {memoryItems.length > 0 && (
                <button
                  onClick={onClearAllMemory}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-300 hover:bg-rose-950/30 text-xs transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Wipe All</span>
                </button>
              )}
            </div>
          </div>

          {/* Add Memory Modal / Form */}
          {showAddMemory && (
            <form onSubmit={handleCreateMemory} className="bg-slate-900/60 p-4 rounded-lg border border-cyan-500/30 flex flex-col gap-3">
              <div className="text-xs font-semibold text-cyan-300">New Persistent Memory Entry</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Key (e.g. Favorite Browser, Home City)"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="bg-[#070A0F] border border-slate-700 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                  required
                />
                <input
                  type="text"
                  placeholder="Value (e.g. Google Chrome, Lahore)"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="bg-[#070A0F] border border-slate-700 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 sm:col-span-2"
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <select
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value as any)}
                  className="bg-[#070A0F] border border-slate-700 rounded p-1.5 text-xs text-slate-200"
                >
                  <option value="preference">Preference</option>
                  <option value="fact">Personal Fact</option>
                  <option value="authorized_path">Authorized Folder Path</option>
                  <option value="routine">Routine</option>
                </select>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMemory(false)}
                    className="px-3 py-1 rounded text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded bg-cyan-400 text-slate-950 font-semibold text-xs"
                  >
                    Save Memory
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Memory List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
            {filteredMemory.length === 0 ? (
              <div className="col-span-2 py-8 text-center text-xs text-slate-500">
                No matching memory entries found.
              </div>
            ) : (
              filteredMemory.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-[#070A0F]/90 border border-slate-800 hover:border-cyan-500/30 flex items-start justify-between gap-3 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200">{item.key}</span>
                      <span className="text-[10px] font-mono text-cyan-400/80 px-1 py-0.2 rounded bg-cyan-950/50 uppercase">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-slate-400 break-words">{item.value}</div>
                    <div className="text-[10px] text-slate-600 font-mono mt-1">
                      Updated: {new Date(item.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteMemory(item.id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                    title="Delete memory entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Routines Sub-tab */
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Create multi-action voice macros triggered by a single custom phrase.
            </p>
            <button
              onClick={() => setShowAddRoutine(!showAddRoutine)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-400 text-slate-950 font-semibold text-xs hover:bg-cyan-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Routine</span>
            </button>
          </div>

          {/* New Routine Form */}
          {showAddRoutine && (
            <form onSubmit={handleCreateRoutine} className="bg-slate-900/60 p-4 rounded-lg border border-cyan-500/30 flex flex-col gap-3">
              <div className="text-xs font-semibold text-cyan-300">Create New Voice Routine</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Routine Name (e.g. Morning Work Mode)"
                  value={routineName}
                  onChange={(e) => setRoutineName(e.target.value)}
                  className="bg-[#070A0F] border border-slate-700 rounded p-2 text-xs text-slate-200"
                  required
                />
                <input
                  type="text"
                  placeholder='Trigger Phrase (e.g. "Shaka, work time" or "kaam shuru")'
                  value={routineTrigger}
                  onChange={(e) => setRoutineTrigger(e.target.value)}
                  className="bg-[#070A0F] border border-slate-700 rounded p-2 text-xs text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  Actions to execute (one action command per line):
                </label>
                <textarea
                  rows={3}
                  placeholder={`open Chrome\nvolume 40 percent\nopen Spotify`}
                  value={routineActionText}
                  onChange={(e) => setRoutineActionText(e.target.value)}
                  className="w-full bg-[#070A0F] border border-slate-700 rounded p-2 text-xs text-slate-200 font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRoutine(false)}
                  className="px-3 py-1 rounded text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-cyan-400 text-slate-950 font-semibold text-xs"
                >
                  Create Routine
                </button>
              </div>
            </form>
          )}

          {/* Routines List */}
          <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
            {routines.map((routine) => (
              <div
                key={routine.id}
                className="p-3.5 rounded-lg bg-[#070A0F]/90 border border-slate-800 hover:border-cyan-500/30 flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{routine.name}</span>
                      <span className="text-[10px] font-mono text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">
                        Trigger: "{routine.triggerPhrase}"
                      </span>
                    </div>

                    {/* Action sequence */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {routine.actions.map((act, idx) => (
                        <span 
                          key={idx}
                          className="text-[11px] font-mono text-slate-300 px-2 py-0.5 rounded bg-slate-900 border border-slate-800"
                        >
                          {idx + 1}. {act}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleRoutine(routine.id)}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                      routine.enabled
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {routine.enabled ? 'ACTIVE' : 'DISABLED'}
                  </button>

                  <button
                    onClick={() => onDeleteRoutine(routine.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
