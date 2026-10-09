import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import ProblemList from '../components/dsa/ProblemList';
import TopicProgressChart from '../components/dsa/TopicProgressChart';
import DifficultyChart from '../components/dsa/DifficultyChart';
import LeetCodeImportModal from '../components/dsa/LeetCodeImportModal';
import RoadmapTracker from '../components/dsa/RoadmapTracker';
import MotionButton from '../components/motion/MotionButton';
import { Code2, BarChart2, Download, BookMarked, Layers } from 'lucide-react';
import { isReducedMotionPreferred, SPRING_SMOOTH, SPRING_TACTILE } from '../animations/motionConfig';

export default function DSATracker() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('roadmap') || searchParams.get('tab') === 'roadmaps' ? 'roadmaps' : 'problems';
  const [activeTab, setActiveTab] = useState(initialTab); // 'problems' | 'roadmaps'
  const [isImportOpen, setIsImportOpen] = useState(false);
  const prefersReduced = isReducedMotionPreferred();

  useEffect(() => {
    if (searchParams.get('roadmap') || searchParams.get('tab') === 'roadmaps') {
      setActiveTab('roadmaps');
    }
  }, [searchParams]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Tab selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-3">
            <motion.div 
              whileHover={prefersReduced ? undefined : { scale: 1.1, rotate: -5 }}
              className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 cursor-default"
            >
              <Code2 className="w-6 h-6" />
            </motion.div>
            DSA Problem Tracker & Roadmaps
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your problem queue, automated revision schedules, and MAANG study sheets.
          </p>
        </div>

        {/* Tab switcher buttons with layoutId sliding pill */}
        <LayoutGroup id="dsaTrackerTabs">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shrink-0">
            <button
              onClick={() => setActiveTab('problems')}
              className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer select-none ${
                activeTab === 'problems' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {activeTab === 'problems' && (
                <motion.div
                  layoutId={prefersReduced ? undefined : "dsaTabIndicator"}
                  transition={SPRING_SMOOTH}
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 shadow-md -z-10"
                />
              )}
              <Layers className="w-4 h-4" /> My Problems
            </button>

            <button
              onClick={() => setActiveTab('roadmaps')}
              className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer select-none ${
                activeTab === 'roadmaps' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {activeTab === 'roadmaps' && (
                <motion.div
                  layoutId={prefersReduced ? undefined : "dsaTabIndicator"}
                  transition={SPRING_SMOOTH}
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 shadow-md -z-10"
                />
              )}
              <BookMarked className="w-4 h-4" /> Curated Roadmaps
            </button>
          </div>
        </LayoutGroup>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'problems' ? (
          <motion.div
            key="problems-tab"
            initial={prefersReduced ? undefined : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {/* Top Actions & Visual Analytics */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider">Queue Analytics</h3>
              <MotionButton
                onClick={() => setIsImportOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 text-xs font-extrabold flex items-center gap-2 shadow-md"
              >
                <Download className="w-4 h-4" /> Import LeetCode Profile
              </MotionButton>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div 
                whileHover={prefersReduced ? undefined : { y: -2 }}
                transition={SPRING_SMOOTH}
                className="p-6 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800"
              >
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Top Topic Mastery</h3>
                </div>
                <TopicProgressChart />
              </motion.div>

              <motion.div 
                whileHover={prefersReduced ? undefined : { y: -2 }}
                transition={SPRING_SMOOTH}
                className="p-6 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800"
              >
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Difficulty Breakdown</h3>
                </div>
                <DifficultyChart />
              </motion.div>
            </div>

            {/* Problem Manager Table */}
            <ProblemList />
          </motion.div>
        ) : (
          <motion.div
            key="roadmaps-tab"
            initial={prefersReduced ? undefined : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* Curated Roadmaps Tab */}
            <RoadmapTracker />
          </motion.div>
        )}
      </AnimatePresence>

      {/* LeetCode Import Modal */}
      <LeetCodeImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />
    </div>
  );
}
