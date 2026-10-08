import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import MotionButton from '../components/motion/MotionButton';
import { Settings as SettingsIcon, Database, ShieldCheck, Download, RefreshCw, Zap, Sliders, Sparkles, Trash2, Globe } from 'lucide-react';
import { isReducedMotionPreferred, SPRING_SMOOTH } from '../animations/motionConfig';
import WebLoader from '../components/shared/WebLoader';
import WebLoadingScreen from '../components/shared/WebLoadingScreen';

export default function Settings() {
  const { currentUser, isDemoMode } = useAuth();
  const { problems, tasks, xp, loadStarterData, clearUserData } = useData();

  const [reducedMotion, setReducedMotion] = useState(() => isReducedMotionPreferred());
  const [actionMessage, setActionMessage] = useState('');
  const [isFullscreenLoaderActive, setIsFullscreenLoaderActive] = useState(false);

  const handleToggleReducedMotion = () => {
    const nextVal = !reducedMotion;
    setReducedMotion(nextVal);
    localStorage.setItem('grindtrack_reduced_motion', String(nextVal));
    window.dispatchEvent(new Event('storage'));
  };

  const handleExport = () => {
    const data = {
      exportDate: new Date().toISOString(),
      user: currentUser ? currentUser.email : 'demo',
      uid: currentUser?.uid || 'demo_user_123',
      xp,
      problems,
      tasks,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grindtrack-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadStarterData = async () => {
    if (window.confirm('Load curated starter DSA problems and daily tasks into your account?')) {
      await loadStarterData();
      setActionMessage('Curated starter pack loaded successfully!');
      setTimeout(() => setActionMessage(''), 3500);
    }
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to delete all problems, tasks, and reset XP for this account? This cannot be undone.')) {
      await clearUserData();
      setActionMessage('Your account data has been reset.');
      setTimeout(() => setActionMessage(''), 3500);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-3">
          <motion.div 
            whileHover={reducedMotion ? undefined : { rotate: 90 }}
            transition={SPRING_SMOOTH}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 cursor-default"
          >
            <SettingsIcon className="w-6 h-6" />
          </motion.div>
          Settings & Data Management
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your account profile, motion accessibility preferences, and database synchronization.
        </p>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" /> {actionMessage}
        </div>
      )}

      {/* Interface & Motion Accessibility Settings */}
      <div className="p-6 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
          <Sliders className="w-5 h-5 text-cyan-400" /> Interface & Motion Accessibility
        </div>
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="font-bold text-slate-200 text-sm block">Reduced Motion Mode</span>
            <span className="text-xs text-slate-400">
              Disables playful bouncy springs, floating particles, and large sliding page transitions.
            </span>
          </div>
          {/* Animated Toggle Switch */}
          <button
            onClick={handleToggleReducedMotion}
            className={`w-14 h-8 rounded-full p-1 transition-colors relative cursor-pointer border ${
              reducedMotion 
                ? 'bg-cyan-500 border-cyan-400' 
                : 'bg-slate-800 border-slate-700'
            }`}
            aria-label="Toggle Reduced Motion"
          >
            <motion.div
              layout
              transition={SPRING_SMOOTH}
              className={`w-6 h-6 rounded-full bg-white shadow-md ${
                reducedMotion ? 'ml-auto' : 'ml-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Account Profile Status */}
      <div className="p-6 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
          <ShieldCheck className="w-5 h-5 text-cyan-400" /> Account & Isolation Status
        </div>
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-slate-400 block">Current User:</span>
              <span className="font-bold text-slate-200 text-sm">
                {currentUser ? currentUser.email : 'Not logged in'}
              </span>
            </div>
            <span className={`px-3 py-1 rounded-full font-bold self-start sm:self-auto ${isDemoMode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
              {isDemoMode ? 'Local Demo Mode (Sandboxed)' : 'Firebase Cloud Sync (Isolated User)'}
            </span>
          </div>

          {!isDemoMode && currentUser && (
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div>
                <span className="text-slate-400 block">User Name & ID:</span>
                <span className="font-bold text-slate-200">
                  {currentUser.displayName || 'Member'} &bull; <code className="text-cyan-400 font-mono text-[11px]">{currentUser.uid}</code>
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Dedicated Database Paths:</span>
                <div className="space-y-1 mt-1 font-mono text-[11px]">
                  <div><code className="text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">/users/{currentUser.uid}</code> <span className="text-slate-500 font-sans">(Profile, XP, Streak, Badges, Roadmap)</span></div>
                  <div><code className="text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">/users/{currentUser.uid}/problems</code> <span className="text-slate-500 font-sans">(DSA problems & spaced repetitions)</span></div>
                  <div><code className="text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">/users/{currentUser.uid}/tasks</code> <span className="text-slate-500 font-sans">(Daily accountability tasks)</span></div>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Your problems, tasks, streak, roadmap, and XP are stored separately inside your private document. Other users cannot read or modify your data.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Firebase Config Info */}
      <div className="p-6 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
          <Database className="w-5 h-5 text-purple-400" /> Firebase Connection
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Project ID: <code className="text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">dsa-tracker-197f7</code>
          <br />
          Auth Domain: <code className="text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 mt-1 inline-block">dsa-tracker-197f7.firebaseapp.com</code>
        </p>
      </div>

      {/* Backup & Data Controls */}
      <div className="p-6 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-slate-200 font-bold text-sm">Data Tools & Backup</h3>
        <div className="flex flex-wrap gap-4">
          <MotionButton
            onClick={handleExport}
            className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-cyan-400" /> Export My Data (.json)
          </MotionButton>

          <MotionButton
            onClick={handleLoadStarterData}
            className="px-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" /> Load Starter Pack
          </MotionButton>

          <MotionButton
            onClick={handleClearData}
            className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Reset / Clear My Data
          </MotionButton>
        </div>
      </div>

      {/* Web Loading Animation Showcase */}
      <div className="p-6 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
              <Globe className="w-5 h-5 text-cyan-400 animate-spin" /> Web Loading Animation
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Reactive cyber web loading animation with dynamic SVG spiderweb strands, orbiting data packets, and live network telemetry.
            </p>
          </div>
          <MotionButton
            onClick={() => {
              setIsFullscreenLoaderActive(true);
              setTimeout(() => setIsFullscreenLoaderActive(false), 3500);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-2 shrink-0 shadow-lg shadow-cyan-500/20"
          >
            <Globe className="w-4 h-4" /> Launch Fullscreen Demo (3.5s)
          </MotionButton>
        </div>

        {/* In-page live preview card */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col items-center justify-center">
          <span className="text-[10px] font-mono text-cyan-400/80 uppercase tracking-wider mb-2">Live Component Preview</span>
          <WebLoader size="md" showProgress={true} showBadges={true} />
        </div>
      </div>

      {/* Fullscreen Overlay Demo */}
      {isFullscreenLoaderActive && (
        <div onClick={() => setIsFullscreenLoaderActive(false)} className="cursor-pointer">
          <WebLoadingScreen isVisible={true} message="Simulating Web Mesh Handshake • Click to exit" />
        </div>
      )}
    </div>
  );
}
