import React from 'react';
import { motion } from 'framer-motion';
import { useData } from '../../context/DataContext';
import AnimatedCounter from '../motion/AnimatedCounter';
import { Code2, CheckCircle2, RotateCw, Trophy, Zap } from 'lucide-react';
import { isReducedMotionPreferred, SPRING_SMOOTH } from '../../animations/motionConfig';

export default function StatsOverview() {
  const { problems, tasks, xp, levelInfo } = useData();
  const prefersReduced = isReducedMotionPreferred();

  const solvedCount = problems.filter((p) => p.status === 'solved').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const dueRevisionsCount = problems.filter(
    (p) => p.status === 'solved' && p.revisionDate && p.revisionDate <= todayStr
  ).length;

  const tasksDoneCount = tasks.filter((t) => t.status === 'done').length;
  const totalTasksCount = tasks.length;

  const stats = [
    {
      title: 'Problems Solved',
      renderValue: () => <AnimatedCounter value={solvedCount} />,
      subtitle: `Total attempted: ${problems.length}`,
      icon: Code2,
      color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
      iconBg: 'bg-cyan-500/20 text-cyan-400',
    },
    {
      title: 'Revisions Due Today',
      renderValue: () => <AnimatedCounter value={dueRevisionsCount} />,
      subtitle: dueRevisionsCount > 0 ? 'Action required!' : 'All clear for today',
      icon: RotateCw,
      color: dueRevisionsCount > 0 
        ? 'from-rose-500/20 to-orange-500/20 text-rose-400 border-rose-500/30' 
        : 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
      iconBg: dueRevisionsCount > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400',
    },
    {
      title: 'Tasks Completed',
      renderValue: () => (
        <span>
          <AnimatedCounter value={tasksDoneCount} /> / {totalTasksCount}
        </span>
      ),
      subtitle: `${totalTasksCount - tasksDoneCount} remaining`,
      icon: CheckCircle2,
      color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30',
      iconBg: 'bg-purple-500/20 text-purple-400',
    },
    {
      title: 'Total XP & Rank',
      renderValue: () => <AnimatedCounter value={xp} suffix=" XP" />,
      subtitle: levelInfo.title,
      icon: Zap,
      color: 'from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30',
      iconBg: 'bg-amber-500/20 text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={idx}
            whileHover={prefersReduced ? undefined : { y: -3, scale: 1.015 }}
            transition={SPRING_SMOOTH}
            className={`p-5 rounded-2xl glass-panel bg-gradient-to-br ${stat.color} border shadow-lg cursor-default group`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{stat.title}</span>
              <motion.div 
                whileHover={prefersReduced ? undefined : { rotate: 8, scale: 1.1 }}
                className={`p-2 rounded-xl ${stat.iconBg} transition-transform`}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
            </div>
            <div className="text-2xl font-extrabold text-white tracking-tight">{stat.renderValue()}</div>
            <p className="text-xs text-slate-400 mt-1 font-medium">{stat.subtitle}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
