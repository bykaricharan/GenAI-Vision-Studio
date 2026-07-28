import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Moon,
  BookOpen,
  Laptop,
  RotateCcw,
  Info,
  Download,
  CheckCircle2,
  X,
  Settings as SettingsIcon,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useSettings } from '../context/SettingsContext';

export const Settings: React.FC = () => {
  const { settings, updateSettings, resetPreferences, exportProgress } = useSettings();

  // Modal & Toast State
  const [confirmResetModal, setConfirmResetModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExport = () => {
    exportProgress();
    showToast('Learning progress exported successfully!');
  };

  const handleConfirmReset = () => {
    resetPreferences();
    setConfirmResetModal(false);
    showToast('All settings restored to default values.');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-4">
      {/* Header Banner */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400 font-mono">
          <SettingsIcon className="h-4 w-4" />
          <span>Application Settings</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Settings
        </h1>
        <p className="text-sm text-slate-400 font-sans">
          Customize platform appearance, educational difficulty depth, presentation demo mode, and local application preferences.
        </p>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2 shadow-lg"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 1: APPEARANCE                                             */}
      {/* ----------------------------------------------------------------- */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2 font-mono">
          <Moon className="h-4 w-4 text-indigo-400" />
          Appearance
        </h2>

        <Card className="border-slate-800 bg-[#1E293B]/80 p-6 space-y-6 rounded-2xl shadow-lg">
          {/* Theme Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-slate-300 block">Theme</label>
            <div className="grid grid-cols-3 gap-2.5 font-mono text-xs">
              {(['Dark', 'Light', 'System'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    updateSettings({ theme: t });
                    showToast(`Theme updated to ${t} Mode`);
                  }}
                  className={`py-2.5 px-3 rounded-xl border font-bold transition-all cursor-pointer ${
                    settings.theme === t
                      ? 'border-indigo-500 bg-indigo-500/20 text-white shadow-md'
                      : 'border-slate-800 bg-[#0F172A] text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 pt-2 border-t border-slate-800/80">
            {/* Accent Color */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-slate-300 block">Accent Color</label>
              <div className="grid grid-cols-4 gap-2 font-mono text-xs">
                {[
                  { name: 'Sky', color: 'bg-sky-400' },
                  { name: 'Emerald', color: 'bg-emerald-400' },
                  { name: 'Indigo', color: 'bg-indigo-400' },
                  { name: 'Amber', color: 'bg-amber-400' },
                ].map((a) => (
                  <button
                    key={a.name}
                    onClick={() => {
                      updateSettings({ accentColor: a.name as typeof settings.accentColor });
                      showToast(`Accent color set to ${a.name}`);
                    }}
                    className={`py-2 px-2 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      settings.accentColor === a.name
                        ? 'border-white bg-slate-800 text-white shadow-md'
                        : 'border-slate-800 bg-[#0F172A] text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${a.color}`} />
                    <span className="text-[11px]">{a.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-slate-300 block">Font Size</label>
              <select
                value={settings.fontSize}
                onChange={(e) => {
                  const size = e.target.value as typeof settings.fontSize;
                  updateSettings({ fontSize: size });
                  showToast(`Font size set to ${size}`);
                }}
                className="w-full rounded-xl border border-slate-800 bg-[#0F172A] py-2.5 px-3 text-xs text-white focus:border-indigo-500 focus:outline-none font-mono"
              >
                <option value="Small">Small (13px)</option>
                <option value="Medium">Medium (14px - Default)</option>
                <option value="Large">Large (16px)</option>
              </select>
            </div>
          </div>
        </Card>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 2: LEARNING EXPERIENCE                                   */}
      {/* ----------------------------------------------------------------- */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2 font-mono">
          <BookOpen className="h-4 w-4 text-emerald-400" />
          Learning Experience
        </h2>

        <Card className="border-slate-800 bg-[#1E293B]/80 p-6 space-y-6 rounded-2xl shadow-lg font-mono text-xs">
          {/* Learning Level */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">Learning Level</label>
            <div className="grid grid-cols-3 gap-2.5">
              {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    updateSettings({ learningMode: lvl });
                    showToast(`Learning difficulty set to ${lvl}`);
                  }}
                  className={`py-2.5 px-3 rounded-xl border font-bold transition-all cursor-pointer ${
                    settings.learningMode === lvl
                      ? 'border-emerald-500 bg-emerald-500/20 text-white shadow-md'
                      : 'border-slate-800 bg-[#0F172A] text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            {/* Show Backend Workflow */}
            <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-[#0F172A] border border-slate-800/80">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-200 block">Show Backend Workflow</span>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  Displays the AI execution pipeline while using educational modules.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.displayBackendDetails}
                onChange={(e) => {
                  updateSettings({ displayBackendDetails: e.target.checked });
                  showToast(`Backend workflow details ${e.target.checked ? 'enabled' : 'hidden'}`);
                }}
                className="h-4 w-4 rounded accent-emerald-500 cursor-pointer shrink-0 mt-1"
              />
            </div>

            {/* Show Educational Tooltips */}
            <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-[#0F172A] border border-slate-800/80">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-200 block">Show Educational Tooltips</span>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  Displays contextual help tooltips on technical parameters.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.showTooltips}
                onChange={(e) => {
                  updateSettings({ showTooltips: e.target.checked });
                  showToast(`Tooltips ${e.target.checked ? 'enabled' : 'hidden'}`);
                }}
                className="h-4 w-4 rounded accent-emerald-500 cursor-pointer shrink-0 mt-1"
              />
            </div>
          </div>
        </Card>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 3: PRESENTATION MODE                                      */}
      {/* ----------------------------------------------------------------- */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2 font-mono">
          <Laptop className="h-4 w-4 text-purple-400" />
          Presentation Mode
        </h2>

        <Card className="border-slate-800 bg-[#1E293B]/80 p-6 rounded-2xl shadow-lg font-mono text-xs">
          <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-[#0F172A] border border-slate-800/80">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">Demo Mode</span>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                Slows animations, highlights active workflow nodes, and hides debugging for classroom demonstrations and project presentations.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.demoMode}
              onChange={(e) => {
                updateSettings({ demoMode: e.target.checked });
                showToast(`Presentation Demo Mode ${e.target.checked ? 'Enabled' : 'Disabled'}`);
              }}
              className="h-4 w-4 rounded accent-purple-500 cursor-pointer shrink-0 mt-1"
            />
          </div>
        </Card>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 4: DATA                                                   */}
      {/* ----------------------------------------------------------------- */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2 font-mono">
          <RotateCcw className="h-4 w-4 text-rose-400" />
          Data
        </h2>

        <Card className="border-slate-800 bg-[#1E293B]/80 p-6 rounded-2xl shadow-lg font-mono text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 font-bold transition-all cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Export Learning Progress</span>
            </button>

            <button
              onClick={() => setConfirmResetModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold transition-all cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset Settings</span>
            </button>
          </div>
        </Card>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 5: ABOUT                                                  */}
      {/* ----------------------------------------------------------------- */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2 font-mono">
          <Info className="h-4 w-4 text-slate-400" />
          About
        </h2>

        <Card className="border-slate-800 bg-[#1E293B]/80 p-6 rounded-2xl shadow-lg space-y-3 font-sans text-xs text-slate-300">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-white">GenAI Vision Studio</h3>
              <span className="text-[11px] font-mono text-slate-400">Version 1.0</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30 font-mono font-bold text-[10px]">
              Production Build
            </span>
          </div>

          <p className="text-slate-300 leading-relaxed">
            Interactive Educational Enterprise AI Platform designed to teach modern Generative AI architecture through visual workflows and live telemetry.
          </p>

          <div className="pt-2 border-t border-slate-800/80 font-mono text-[11px] text-slate-400">
            <span className="text-slate-500 block mb-1 font-bold">Technology Stack</span>
            <div className="flex flex-wrap gap-2 text-slate-300">
              {['React', 'FastAPI', 'LangChain', 'LangGraph', 'OpenAI', 'ChromaDB', 'Supabase', 'LangSmith'].map((tech) => (
                <span key={tech} className="px-2 py-0.5 rounded bg-[#0F172A] border border-slate-800 text-[10px]">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* CONFIRM RESET DIALOG MODAL */}
      <AnimatePresence>
        {confirmResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full bg-[#1E293B] border border-slate-700 p-6 rounded-2xl space-y-4 font-sans text-xs text-slate-300 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white font-mono">Reset All Settings?</h3>
                <button
                  onClick={() => setConfirmResetModal(false)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="leading-relaxed">
                Are you sure you want to restore default theme, accent color, font size, and learning experience preferences?
              </p>

              <div className="flex items-center gap-3 pt-2 font-mono">
                <button
                  onClick={handleConfirmReset}
                  className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-500 py-2.5 text-xs font-bold text-white transition-all cursor-pointer"
                >
                  Confirm Reset
                </button>
                <button
                  onClick={() => setConfirmResetModal(false)}
                  className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-bold text-slate-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
