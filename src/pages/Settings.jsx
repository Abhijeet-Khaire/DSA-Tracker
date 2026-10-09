import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import MotionButton from '../components/motion/MotionButton';
import { 
  Settings as SettingsIcon, 
  Target, 
  Code, 
  BrainCircuit, 
  Award, 
  User, 
  Mail, 
  KeyRound, 
  Download, 
  Upload, 
  RefreshCw, 
  Trash2, 
  Sliders, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Clock, 
  Flame, 
  BookOpen, 
  Layers, 
  HelpCircle,
  Volume2,
  VolumeX,
  ShieldCheck,
  Check,
  Copy,
  Database,
  CloudOff
} from 'lucide-react';
import { isReducedMotionPreferred, SPRING_SMOOTH, SPRING_TACTILE } from '../animations/motionConfig';
import { REVISION_INTERVALS_DAYS } from '../lib/revisionEngine';
import { XP_REWARDS, RANKS } from '../lib/xpEngine';
import { Link } from 'react-router-dom';

const PROGRAMMING_LANGUAGES = [
  'C++',
  'Java',
  'Python',
  'JavaScript',
  'TypeScript',
  'Go',
  'Rust',
  'C#',
];

const TARGET_ROLES = [
  'Software Development Engineer (SDE 1)',
  'Senior Software Engineer (SDE 2+)',
  'Frontend Engineer',
  'Backend Engineer',
  'Full Stack Developer',
  'DevOps / Cloud Platform Engineer',
  'Data Engineer / AI Engineer',
];

const TARGET_COMPANIES = [
  'MAANG / Big Tech',
  'High-Growth Unicorn Startups',
  'Fintech / Quant Trading',
  'Product Companies',
  'Enterprise Software',
];

export default function Settings() {
  const { currentUser, sendPasswordReset } = useAuth();
  const { 
    problems, 
    tasks, 
    notes,
    xp, 
    levelInfo, 
    userProfile, 
    saveUserProfile, 
    purgeDemoData, 
    clearUserData, 
    importUserData,
    calculateStreak,
    firestoreSyncStatus,
    firestoreErrorDetails,
    testFirestoreConnection
  } = useData();

  const fileInputRef = useRef(null);

  // Active Category Tab
  const [activeTab, setActiveTab] = useState('study'); // 'study' | 'account' | 'guides' | 'data' | 'appearance'

  // Preferences State
  const [reducedMotion, setReducedMotion] = useState(() => isReducedMotionPreferred());
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('grindtrack_sound_fx') !== 'false');
  
  // Study Goals State
  const [dailyProblemGoal, setDailyProblemGoal] = useState(() => userProfile?.dailyProblemGoal || 2);
  const [dailyTaskGoal, setDailyTaskGoal] = useState(() => userProfile?.dailyTaskGoal || 3);
  const [preferredLanguage, setPreferredLanguage] = useState(() => userProfile?.preferredLanguage || 'C++');
  const [targetRole, setTargetRole] = useState(() => userProfile?.targetRole || 'Software Development Engineer (SDE 1)');
  const [targetCompany, setTargetCompany] = useState(() => userProfile?.targetCompany || 'MAANG / Big Tech');
  const [targetInterviewDate, setTargetInterviewDate] = useState(() => userProfile?.targetInterviewDate || '');

  // UI Feedback
  const [actionMessage, setActionMessage] = useState({ text: '', type: 'success' });
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);

  const showNotification = (text, type = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage({ text: '', type: 'success' }), 4500);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const res = await testFirestoreConnection();
      showNotification(res.message, res.success ? 'success' : 'error');
    } catch (err) {
      showNotification(err.message || 'Connection test failed', 'error');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleCopyRules = () => {
    const rulesCode = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /{allSubcollections=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}`;
    navigator.clipboard.writeText(rulesCode);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 3000);
    showNotification('Firestore rules copied to clipboard!');
  };

  const handleToggleReducedMotion = () => {
    const nextVal = !reducedMotion;
    setReducedMotion(nextVal);
    localStorage.setItem('grindtrack_reduced_motion', String(nextVal));
    window.dispatchEvent(new Event('storage'));
    showNotification(`Reduced Motion ${nextVal ? 'enabled' : 'disabled'}`);
  };

  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    localStorage.setItem('grindtrack_sound_fx', String(nextVal));
    showNotification(`Sound effects ${nextVal ? 'enabled' : 'muted'}`);
  };

  // Save Study & Goal Preferences
  const handleSaveStudyGoals = async (e) => {
    if (e) e.preventDefault();
    setIsSavingPreferences(true);
    try {
      await saveUserProfile({
        dailyProblemGoal: Number(dailyProblemGoal),
        dailyTaskGoal: Number(dailyTaskGoal),
        preferredLanguage,
        targetRole,
        targetCompany,
        targetInterviewDate,
      });
      showNotification('Study preferences and daily targets saved!');
    } catch (err) {
      showNotification('Failed to save study preferences.', 'error');
    } finally {
      setIsSavingPreferences(false);
    }
  };

  // Password Reset Email
  const handlePasswordReset = async () => {
    if (!currentUser?.email) {
      showNotification('No email registered for current session.', 'error');
      return;
    }
    setIsSendingReset(true);
    try {
      await sendPasswordReset(currentUser.email);
      showNotification(`Password reset link sent to ${currentUser.email}! Check your inbox.`, 'success');
    } catch (err) {
      showNotification(err.message || 'Failed to send password reset email.', 'error');
    } finally {
      setIsSendingReset(false);
    }
  };

  // Export JSON Backup
  const handleExport = () => {
    const data = {
      exportVersion: '2.0',
      exportDate: new Date().toISOString(),
      user: currentUser ? currentUser.email : 'local_user',
      xp,
      problems,
      tasks,
      notes,
      userProfile,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grindtrack-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Backup JSON exported successfully!');
  };

  // Import JSON Backup
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedData = JSON.parse(text);

      if (!importedData.problems && !importedData.tasks && typeof importedData.xp !== 'number') {
        showNotification('Invalid backup file. Missing GrindTrack data format.', 'error');
        return;
      }

      if (window.confirm(`Restore backup from ${file.name}? This will update your solved problems and tasks.`)) {
        await importUserData(importedData);
        showNotification(`Successfully restored ${importedData.problems?.length || 0} problems & ${importedData.tasks?.length || 0} tasks!`);
      }
    } catch (err) {
      showNotification('Failed to parse JSON backup file.', 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePurgeDemoData = async () => {
    if (window.confirm('Remove all demo problems (Two Sum, LRU Cache, etc.) and mock starter tasks from your account?')) {
      await purgeDemoData();
      showNotification('Demo data successfully removed from your account!');
    }
  };

  const handleClearData = async () => {
    if (window.confirm('WARNING: Are you sure you want to permanently reset all problems, tasks, and XP for this account? This action cannot be undone.')) {
      await clearUserData();
      showNotification('Your account data has been reset.', 'error');
    }
  };

  const streak = calculateStreak();

  return (
    <div className="space-y-8 pb-16 max-w-5xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-3">
          <motion.div 
            whileHover={reducedMotion ? undefined : { rotate: 90 }}
            transition={SPRING_SMOOTH}
            className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 cursor-default"
          >
            <SettingsIcon className="w-6 h-6" />
          </motion.div>
          Settings & Preferences
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Customize your daily grind targets, spaced repetition workflow, account preferences, and data backups.
        </p>
      </div>

      {/* Action Notification Banner */}
      <AnimatePresence>
        {actionMessage.text && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 ${
              actionMessage.type === 'error'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
          >
            {actionMessage.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Tabs */}
      <LayoutGroup id="settingsNavTabs">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto no-scrollbar">
          {[
            { id: 'study', label: 'Study & Daily Goals', icon: Target },
            { id: 'guides', label: 'Spaced Repetition & XP Guide', icon: BrainCircuit },
            { id: 'account', label: 'Account & Security', icon: User },
            { id: 'data', label: 'Data & Backups', icon: Download },
            { id: 'appearance', label: 'Accessibility & Sound', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer select-none ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId={reducedMotion ? undefined : "settingsActiveTab"}
                    transition={SPRING_SMOOTH}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 shadow-md -z-10"
                  />
                )}
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>

      {/* TAB 1: Study & Daily Goals */}
      {activeTab === 'study' && (
        <motion.div 
          initial={reducedMotion ? undefined : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING_SMOOTH}
          className="space-y-6"
        >
          {/* Daily Practice Targets */}
          <div className="p-6 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-100">Daily Preparation Targets</h2>
                  <p className="text-xs text-slate-400">Define your daily problem quota and accountability goals</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Active Streak: {streak} {streak === 1 ? 'day' : 'days'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Daily Problems Target */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Daily DSA Target (Problems/Day)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 5].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setDailyProblemGoal(count)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                        dailyProblemGoal === count
                          ? 'bg-cyan-500 text-white border-cyan-400 shadow-lg shadow-cyan-500/20'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      {count} {count === 1 ? 'Problem' : 'Problems'}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500">
                  Recommended: 2 problems per day builds steady retention without burnout.
                </p>
              </div>

              {/* Daily Tasks Target */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Daily Habit Tasks Target (Tasks/Day)
                </label>
                <div className="flex items-center gap-2">
                  {[2, 3, 4, 6].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setDailyTaskGoal(count)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                        dailyTaskGoal === count
                          ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-600/20'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      {count} {count === 1 ? 'Task' : 'Tasks'}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500">
                  Non-negotiable habits: Revision, mock contest, CS fundamentals, System Design.
                </p>
              </div>
            </div>

            {/* Language & Target Career */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-cyan-400" /> Primary Coding Language
                </label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                >
                  {PROGRAMMING_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500">
                  Sets your default language preference for problem solution templates.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-purple-400" /> Target Career Role
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                >
                  {TARGET_ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500">
                  Customizes suggested DSA focus areas (e.g. Graphs, DP, Concurrency).
                </p>
              </div>
            </div>

            {/* Target Company & Interview Target Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Target Company Tier
                </label>
                <select
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                >
                  {TARGET_COMPANIES.map((comp) => (
                    <option key={comp} value={comp}>{comp}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Target Interview / Season Date
                </label>
                <input
                  type="date"
                  value={targetInterviewDate}
                  onChange={(e) => setTargetInterviewDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                />
                <p className="text-[11px] text-slate-500">
                  Keep your countdown visible across your command center.
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <MotionButton
                onClick={handleSaveStudyGoals}
                disabled={isSavingPreferences}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                {isSavingPreferences ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Save Study Preferences
                  </>
                )}
              </MotionButton>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 2: Spaced Repetition & XP Guide */}
      {activeTab === 'guides' && (
        <motion.div 
          initial={reducedMotion ? undefined : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING_SMOOTH}
          className="space-y-6"
        >
          {/* Spaced Repetition Engine Breakdown */}
          <div className="p-6 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-4">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-100">Spaced Repetition Recall Engine</h2>
                <p className="text-xs text-slate-400">How GrindTrack prevents the forgetting curve for DSA patterns</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              When you mark a problem as <span className="text-emerald-400 font-semibold">Solved</span>, GrindTrack automatically schedules future review sessions using the progressive Leitner memory schedule. Each successful revision reinforces pattern recognition:
            </p>

            {/* Interactive Schedule Visualizer */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[
                { step: 'Stage 1', days: '+1 Day', label: 'Initial Recall', desc: 'Verify problem approach within 24h' },
                { step: 'Stage 2', days: '+3 Days', label: 'Consolidation', desc: 'Re-implement core algorithmic loop' },
                { step: 'Stage 3', days: '+7 Days', label: 'One-Week Retention', desc: 'Code from scratch without hints' },
                { step: 'Stage 4', days: '+14 Days', label: 'Pattern Fortification', desc: 'Identify edge cases & variations' },
                { step: 'Stage 5', days: '+30 Days', label: 'Mastered Memory', desc: 'Long-term memory consolidated' },
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-cyan-500/40 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">{item.step}</span>
                    <span className="text-xs font-bold text-slate-200">{item.days}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200">{item.label}</h4>
                  <p className="text-[11px] text-slate-500 leading-tight">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Status Legend */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-300 mb-2">Revision Queue Status Legend</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-rose-500 shadow-md shadow-rose-500/30" />
                  <div>
                    <span className="text-xs font-bold text-rose-400 block">Overdue</span>
                    <span className="text-[11px] text-slate-500">Scheduled date has passed; needs immediate review</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-amber-400 shadow-md shadow-amber-400/30 animate-pulse" />
                  <div>
                    <span className="text-xs font-bold text-amber-300 block">Due Today</span>
                    <span className="text-[11px] text-slate-500">Scheduled for today; tackles in Today's Focus panel</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/30" />
                  <div>
                    <span className="text-xs font-bold text-emerald-400 block">Upcoming</span>
                    <span className="text-[11px] text-slate-500">Scheduled in upcoming days; memory is currently fresh</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gamification & XP System Rules */}
          <div className="p-6 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-100">XP Scoring & Rank Progression</h2>
                  <p className="text-xs text-slate-400">Earn experience points to climb developer ranks</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Your Current Rank:</span>
                <span className="text-xs font-bold text-cyan-400">{levelInfo.title} (Level {levelInfo.level})</span>
              </div>
            </div>

            {/* XP Earning Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { title: 'Easy Problem', xp: `+${XP_REWARDS.PROBLEM_EASY} XP`, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                { title: 'Medium Problem', xp: `+${XP_REWARDS.PROBLEM_MEDIUM} XP`, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                { title: 'Hard Problem', xp: `+${XP_REWARDS.PROBLEM_HARD} XP`, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
                { title: 'Spaced Revision', xp: `+${XP_REWARDS.PROBLEM_REVISION} XP`, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
                { title: 'Daily Task', xp: `+${XP_REWARDS.TASK_COMPLETE} XP`, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
                { title: 'Streak Bonus', xp: `+${XP_REWARDS.DAILY_STREAK_BONUS} XP`, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
              ].map((item, i) => (
                <div key={i} className={`p-3 rounded-xl border text-center space-y-1 ${item.color}`}>
                  <span className="text-[11px] font-semibold block text-slate-300">{item.title}</span>
                  <span className="text-sm font-black">{item.xp}</span>
                </div>
              ))}
            </div>

            {/* Ranks Ladder */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-300 mb-3">All Developer Ranks</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {RANKS.map((rank) => {
                  const isCurrent = levelInfo.level === rank.level;
                  return (
                    <div
                      key={rank.level}
                      className={`p-3 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-slate-900 border-cyan-500/80 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-500/30'
                          : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-mono text-slate-500 font-bold">LVL {rank.level}</span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-500 text-slate-950">YOU</span>
                        )}
                      </div>
                      <h5 className="text-xs font-bold text-slate-200 truncate">{rank.title}</h5>
                      <span className="text-[10px] text-slate-500 block">{rank.minXp} XP</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 3: Account & Security */}
      {activeTab === 'account' && (
        <motion.div 
          initial={reducedMotion ? undefined : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING_SMOOTH}
          className="space-y-6"
        >
          {/* User Profile Card */}
          <div className="p-6 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-4">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-100">Account Overview & Sync</h2>
                <p className="text-xs text-slate-400">Authenticated profile details and cloud backup sync</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-cyan-500/20">
                  {currentUser?.photoURL ? (
                    <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    (currentUser?.displayName || currentUser?.email || 'U')[0].toUpperCase()
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-100">
                      {currentUser?.displayName || userProfile?.displayName || 'GrindTrack Member'}
                    </h3>
                    {firestoreSyncStatus === 'synced' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Cloud Synced
                      </span>
                    )}
                    {firestoreSyncStatus === 'syncing' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Syncing...
                      </span>
                    )}
                    {firestoreSyncStatus === 'permission_error' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Firestore Rules Needed
                      </span>
                    )}
                    {firestoreSyncStatus === 'offline' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30 flex items-center gap-1">
                        <CloudOff className="w-3 h-3" /> Local Mode
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{currentUser?.email || 'Logged in locally'}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Target: <span className="text-slate-300 font-medium">{userProfile?.targetRole || 'Software Engineer'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Link
                  to="/profile"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" /> View Public Profile
                </Link>
              </div>
            </div>

            {/* Cloud Database Sync Health & Diagnostics */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-200 text-xs flex items-center gap-2">
                    <Database className="w-4 h-4 text-cyan-400" /> Cloud Database Connection (Firestore)
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    {firestoreSyncStatus === 'synced' && 'Your problems, tasks, and stats are continuously synchronized to Firestore.'}
                    {firestoreSyncStatus === 'syncing' && 'Verifying connectivity to Firestore cloud database...'}
                    {firestoreSyncStatus === 'permission_error' && 'Firestore rejected write permissions (cloud rules unconfigured). Local data is safe.'}
                    {firestoreSyncStatus === 'offline' && 'Working locally in browser cache. Sign in to enable Firestore sync.'}
                  </span>
                </div>

                <MotionButton
                  onClick={handleTestConnection}
                  disabled={testingConnection || !currentUser}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-2 disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  {testingConnection ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Testing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" /> Test Cloud Connection
                    </>
                  )}
                </MotionButton>
              </div>

              {/* Firestore Permission Resolution Card */}
              {firestoreSyncStatus === 'permission_error' && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="font-bold text-amber-300">Firestore Cloud Rules Update Required</p>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        Firebase returned <span className="font-mono text-rose-400">Missing or insufficient permissions</span>. Your data is currently preserved safely in local storage. To activate live database cloud sync on project <span className="font-mono text-cyan-300 font-bold">dsa-tracker-197f7</span>, update your Firestore Security Rules in the Firebase Console:
                      </p>
                    </div>
                  </div>

                  <div className="relative rounded-lg bg-slate-950 p-3 border border-slate-800 font-mono text-[11px] text-cyan-300/90 overflow-x-auto">
                    <pre>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /{allSubcollections=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}`}</pre>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <MotionButton
                      onClick={handleCopyRules}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedRules ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedRules ? 'Copied to Clipboard!' : 'Copy Rules Snippet'}
                    </MotionButton>

                    <a
                      href="https://console.firebase.google.com/project/dsa-tracker-197f7/firestore/rules"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-cyan-400" /> Open Firebase Rules Console
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Account Security & Password Reset */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="font-bold text-slate-200 text-xs flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-purple-400" /> Password & Security
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Send a secure verification email to reset your account password.
                </span>
              </div>

              <MotionButton
                onClick={handlePasswordReset}
                disabled={isSendingReset}
                className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-2 disabled:opacity-50 shrink-0"
              >
                {isSendingReset ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" /> Send Password Reset Email
                  </>
                )}
              </MotionButton>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 4: Data & Backups */}
      {activeTab === 'data' && (
        <motion.div 
          initial={reducedMotion ? undefined : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING_SMOOTH}
          className="space-y-6"
        >
          {/* Data Export & Import */}
          <div className="p-6 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 space-y-6">
            <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-4">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-100">Data Management & Backups</h2>
                <p className="text-xs text-slate-400">Export your solved questions and notes or restore from a backup</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Export Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <Download className="w-4 h-4 text-cyan-400" /> Export JSON Backup
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Download an offline JSON copy containing all {problems.length} problems, {tasks.length} tasks, custom notes, revision history, and current XP.
                  </p>
                </div>
                <MotionButton
                  onClick={handleExport}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-750 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 text-cyan-400" /> Export My Data (.json)
                </MotionButton>
              </div>

              {/* Import Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <Upload className="w-4 h-4 text-purple-400" /> Restore from JSON Backup
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Restore previously exported GrindTrack data from another machine or backup file to sync your progress.
                  </p>
                </div>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <MotionButton
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4 text-purple-400" /> Select Backup File (.json)
                  </MotionButton>
                </div>
              </div>
            </div>

            {/* Purge Demo Data Option */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="font-bold text-slate-200 text-xs flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-amber-400" /> Purge Demo Data
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Instantly remove any residual demo problems (Two Sum, LRU Cache, etc.) and mock starter tasks from your account.
                </span>
              </div>
              <MotionButton
                onClick={handlePurgeDemoData}
                className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Remove Demo Data
              </MotionButton>
            </div>

            {/* Danger Zone */}
            <div className="p-4 rounded-xl bg-rose-950/10 border border-rose-500/20 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> Danger Zone
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Permanently delete all logged problems, custom revision dates, completed daily tasks, and reset your XP score back to 0.
              </p>
              <div>
                <MotionButton
                  onClick={handleClearData}
                  className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Reset All My Data
                </MotionButton>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 5: Accessibility & Sound */}
      {activeTab === 'appearance' && (
        <motion.div 
          initial={reducedMotion ? undefined : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING_SMOOTH}
          className="space-y-6"
        >
          <div className="p-6 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 space-y-6">
            <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-4">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-100">Interface & Accessibility Preferences</h2>
                <p className="text-xs text-slate-400">Configure visual motion sensitivity, sound effects, and feedback</p>
              </div>
            </div>

            {/* Reduced Motion Toggle */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 text-sm block">Reduced Motion Mode</span>
                <span className="text-xs text-slate-400">
                  Replaces bouncy spring transitions with subtle cross-fades for motion sensitivity.
                </span>
              </div>
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

            {/* Sound FX Toggle */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 text-sm block flex items-center gap-2">
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                  Sound & Celebration Haptics
                </span>
                <span className="text-xs text-slate-400">
                  Play subtle auditory celebration chime when leveling up or completing daily streaks.
                </span>
              </div>
              <button
                onClick={handleToggleSound}
                className={`w-14 h-8 rounded-full p-1 transition-colors relative cursor-pointer border ${
                  soundEnabled 
                    ? 'bg-purple-600 border-purple-500' 
                    : 'bg-slate-800 border-slate-700'
                }`}
                aria-label="Toggle Sound Effects"
              >
                <motion.div
                  layout
                  transition={SPRING_SMOOTH}
                  className={`w-6 h-6 rounded-full bg-white shadow-md ${
                    soundEnabled ? 'ml-auto' : 'ml-0'
                  }`}
                />
              </button>
            </div>

            {/* Quick Tips & Keyboard Shortcuts */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
              <span className="font-bold text-slate-200 text-xs flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" /> Keyboard Shortcuts
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Open Command Palette</span>
                  <kbd className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px] border border-slate-700">⌘K / Ctrl+K</kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Quick Search Navigation</span>
                  <kbd className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px] border border-slate-700">/</kbd>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
