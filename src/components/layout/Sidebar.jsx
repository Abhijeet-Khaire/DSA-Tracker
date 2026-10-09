import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, LayoutGroup } from 'framer-motion';
import { 
  LayoutDashboard, 
  Code2, 
  CheckSquare, 
  Trophy, 
  Settings, 
  Zap,
  BookOpen,
  Award,
  ChevronRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { isReducedMotionPreferred, SPRING_SMOOTH } from '../../animations/motionConfig';

export default function Sidebar() {
  const { problems, tasks } = useData();
  const prefersReduced = isReducedMotionPreferred();

  const todayStr = new Date().toISOString().split('T')[0];
  const dueRevisionsCount = problems.filter(
    (p) => p.status === 'solved' && p.revisionDate && p.revisionDate <= todayStr
  ).length;

  const pendingTasksCount = tasks.filter((t) => t.status === 'pending').length;

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { 
      label: 'DSA Tracker', 
      path: '/dsa', 
      icon: Code2,
      badge: dueRevisionsCount > 0 ? dueRevisionsCount : null,
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
    },
    { 
      label: 'Daily Tasks', 
      path: '/tasks', 
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : null,
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
    },
    { label: 'Notes', path: '/notes', icon: BookOpen },
    { label: 'Achievements', path: '/achievements', icon: Trophy },
    { label: 'DSA Resume', path: '/profile', icon: Award },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900/80 border-r border-slate-800/80 backdrop-blur-xl flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto relative z-30 transition-all duration-300">
      <div>
        {/* Brand Logo Header with Interactive Glow & Micro-animation */}
        <motion.div 
          whileHover={prefersReduced ? undefined : { scale: 1.01 }}
          className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3 group cursor-pointer select-none"
        >
          <motion.div 
            whileHover={prefersReduced ? undefined : { scale: 1.14, rotate: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/30"
          >
            <Zap className="w-5 h-5 text-white fill-white animate-pulse" />
          </motion.div>
          <div>
            <h1 className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400 font-sans tracking-tight">
              GrindTrack
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">DSA & Habit OS</p>
          </div>
        </motion.div>

        {/* Navigation Items with Animated Active Pill & Hover Icons */}
        <nav className="p-4 space-y-2">
          <LayoutGroup id="sidebarNav">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `group relative flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-colors duration-150 outline-none select-none ${
                      isActive
                        ? 'text-cyan-300 font-bold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Unified Active Sliding Pill (Background + Border + Inset Indicator) */}
                      {isActive && (
                        <motion.div
                          layoutId={prefersReduced ? undefined : "activeNavPill"}
                          transition={SPRING_SMOOTH}
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 via-purple-500/15 to-transparent border border-cyan-500/40 shadow-lg shadow-cyan-500/10 pointer-events-none -z-10"
                        >
                          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-full shadow-sm shadow-cyan-400/50" />
                        </motion.div>
                      )}

                      <div className="flex items-center gap-3">
                        <motion.div
                          whileHover={prefersReduced ? undefined : { scale: 1.15, rotate: 5 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        >
                          <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                        </motion.div>
                        <span className="transition-colors duration-200">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <motion.span 
                            initial={false}
                            animate={{ scale: 1 }}
                            className={`px-2 py-0.5 text-xs font-extrabold rounded-full border shadow-sm ${item.badgeColor}`}
                          >
                            {item.badge}
                          </motion.span>
                        )}
                        <ChevronRight className={`w-4 h-4 transition-all duration-200 ${isActive ? 'text-cyan-400 opacity-100 translate-x-0' : 'opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 text-slate-400'}`} />
                      </div>
                    </>
                  )}
                </NavLink>
              );
            })}
          </LayoutGroup>
        </nav>
      </div>

      {/* Spaced Repetition Motivational Card */}
      <motion.div 
        whileHover={prefersReduced ? undefined : { y: -2 }}
        transition={SPRING_SMOOTH}
        className="p-4 m-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 shadow-inner group hover:border-cyan-500/40 transition-colors"
      >
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-xs font-semibold text-slate-300">Spaced Repetition Tip</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Revising a solved problem at 1d, 3d, 7d & 14d intervals builds 95%+ long-term retention for coding interviews!
        </p>
      </motion.div>
    </aside>
  );
}
