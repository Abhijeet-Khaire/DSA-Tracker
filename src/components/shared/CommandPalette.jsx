import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { Search, Code2, CheckSquare, Trophy, Settings, Sun, Moon, LayoutDashboard, X, Globe } from 'lucide-react';
import { modalBackdropVariants, modalContentVariants } from '../../animations/variants';
import { isReducedMotionPreferred, SPRING_SMOOTH, SPRING_TACTILE } from '../../animations/motionConfig';
import WebLoadingScreen from './WebLoadingScreen';

export default function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { problems, tasks } = useData();
  const { theme, toggleTheme } = useTheme();
  const prefersReduced = isReducedMotionPreferred();

  const [query, setQuery] = useState('');
  const [showWebLoader, setShowWebLoader] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(true);
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredProblems = problems.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  const palettePortal = (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-[110] flex items-start justify-center pt-20 p-4 bg-slate-950/80 backdrop-blur-md"
          onClick={onClose}
          variants={prefersReduced ? undefined : modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div 
            className="relative w-full max-w-xl glass-panel bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            variants={prefersReduced ? undefined : modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Search input */}
            <div className="flex items-center px-4 py-3 border-b border-slate-800">
              <Search className="w-5 h-5 text-cyan-400 mr-3" />
              <input
                type="text"
                autoFocus
                placeholder="Search problems, tasks, or commands..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-slate-100 text-sm focus:outline-none"
              />
              <motion.button 
                onClick={onClose} 
                whileHover={prefersReduced ? undefined : { scale: 1.15, rotate: 90 }}
                whileTap={prefersReduced ? undefined : { scale: 0.9 }}
                transition={SPRING_TACTILE}
                className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                aria-label="Close command palette"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Results list */}
            <div className="p-3 max-h-96 overflow-y-auto space-y-3">
              {!query && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-1">
                    Quick Navigation
                  </span>
                  <motion.button
                    whileHover={prefersReduced ? undefined : { x: 3 }}
                    whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                    onClick={() => handleNavigate('/')}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800/80 hover:text-cyan-400 flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </motion.button>
                  <motion.button
                    whileHover={prefersReduced ? undefined : { x: 3 }}
                    whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                    onClick={() => handleNavigate('/dsa')}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800/80 hover:text-cyan-400 flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <Code2 className="w-4 h-4" /> DSA Problem Tracker
                  </motion.button>
                  <motion.button
                    whileHover={prefersReduced ? undefined : { x: 3 }}
                    whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                    onClick={() => handleNavigate('/tasks')}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800/80 hover:text-cyan-400 flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <CheckSquare className="w-4 h-4" /> Daily Tasks
                  </motion.button>
                  <motion.button
                    whileHover={prefersReduced ? undefined : { x: 3 }}
                    whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                    onClick={() => {
                      toggleTheme();
                      onClose();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800/80 hover:text-amber-400 flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                    Toggle Theme ({theme === 'dark' ? 'Light Mode' : 'Dark Mode'})
                  </motion.button>
                  <motion.button
                    whileHover={prefersReduced ? undefined : { x: 3 }}
                    whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                    onClick={() => {
                      onClose();
                      setShowWebLoader(true);
                      setTimeout(() => setShowWebLoader(false), 3200);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800/80 hover:text-cyan-400 flex items-center gap-3 transition-colors cursor-pointer"
                  >
                    <Globe className="w-4 h-4 text-cyan-400 animate-spin" />
                    Preview Web Loading Animation
                  </motion.button>
                </div>
              )}

              {filteredProblems.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-1">
                    DSA Problems
                  </span>
                  {filteredProblems.map((prob) => (
                    <motion.div
                      key={prob.id}
                      whileHover={prefersReduced ? undefined : { x: 3 }}
                      whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                      onClick={() => handleNavigate('/dsa')}
                      className="p-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <span className="font-semibold text-slate-200">{prob.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-cyan-400 font-medium">
                        {prob.difficulty}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {ReactDOM.createPortal(palettePortal, document.body)}
      {showWebLoader && ReactDOM.createPortal(
        <div onClick={() => setShowWebLoader(false)} className="cursor-pointer">
          <WebLoadingScreen isVisible={true} message="Web Network Simulation Active • Click anywhere to dismiss" />
        </div>,
        document.body
      )}
    </>
  );
}
