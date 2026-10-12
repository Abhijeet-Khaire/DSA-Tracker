import React from 'react';
import { motion } from 'framer-motion';
import { 
  Code2, 
  BookOpen, 
  Trophy, 
  Timer, 
  BarChart3, 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  ShieldCheck,
  Zap
} from 'lucide-react';

const FEATURES = [
  {
    icon: Code2,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/15 border-cyan-500/30',
    title: '450+ Curated Problems & Patterns',
    description: 'Track Blind 75, Striver SDE, & NeetCode 150 with spaced repetition, difficulty filters, and platform tags.',
    badge: 'Blind 75 & Striver',
    badgeColor: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20',
  },
  {
    icon: BookOpen,
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/15 border-purple-500/30',
    title: 'Mac-Style WYSIWYG Notes & Highlighters',
    description: 'Apple Notes-inspired rich editor with 5 real-time glowing highlighters, code template drawer, and Markdown (.md) export.',
    badge: 'Live Highlighting',
    badgeColor: 'text-purple-300 bg-purple-500/10 border-purple-500/20',
  },
  {
    icon: Trophy,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/15 border-amber-500/30',
    title: 'Gamified XP & 18 Achievement Badges',
    description: 'Level up from Novice to Grandmaster. Gain XP on completed tasks, celebrate milestones with confetti, and maintain daily streaks.',
    badge: 'XP & Badges',
    badgeColor: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
  },
  {
    icon: Timer,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/15 border-emerald-500/30',
    title: 'Integrated Pomodoro Sprint Timer',
    description: 'Combat coding burnout with deep-work sprints directly linked to your DSA problems and revision schedule.',
    badge: 'Deep Work',
    badgeColor: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: BarChart3,
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/15 border-rose-500/30',
    title: 'Interview Readiness & Resume Profiler',
    description: 'Visual topic distribution heatmaps, difficulty radar breakdown, and instant portfolio export to share with recruiters.',
    badge: 'Visual Analytics',
    badgeColor: 'text-rose-300 bg-rose-500/10 border-rose-500/20',
  },
];

export default function AuthFeatureShowcase() {
  return (
    <div className="flex flex-col justify-between h-full p-8 lg:p-12 space-y-8 relative overflow-hidden select-none">
      {/* Decorative ambient glowing background circles */}
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      {/* Brand & Mission Header */}
      <div className="space-y-4 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/15 to-purple-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>The Ultimate DSA & Interview Preparation OS</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Crack Technical Interviews with <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">Structured Precision</span>
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
            Say goodbye to messy spreadsheets. Track solved problems, craft highlighted algorithmic pattern notes, stay consistent with gamified streaks, and walk into FAANG interviews prepared.
          </p>
        </div>
      </div>

      {/* Features List */}
      <div className="space-y-3 relative z-10">
        {FEATURES.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08, duration: 0.35 }}
              className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-200 group/feature backdrop-blur-sm"
            >
              <div className={`p-2.5 rounded-xl border ${item.iconBg} ${item.iconColor} shrink-0 group-hover/feature:scale-105 transition-transform`}>
                <IconComponent className="w-4 h-4" />
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-slate-100 group-hover/feature:text-cyan-300 transition-colors truncate">
                    {item.title}
                  </h3>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${item.badgeColor} shrink-0 hidden sm:inline-block`}>
                    {item.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Proof & Stats Banner */}
      <div className="pt-4 border-t border-slate-800/80 relative z-10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-1.5 text-cyan-400">
          <Flame className="w-4 h-4 fill-cyan-400/20 text-cyan-400" />
          <span className="font-bold text-slate-200">Daily Streak Multiplier</span>
        </div>
        <div className="flex items-center gap-1.5 text-purple-400">
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span className="text-slate-300">Firebase Cloud Auto-Sync</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">100% Free & Open</span>
        </div>
      </div>
    </div>
  );
}
