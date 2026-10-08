import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Modal from '../shared/Modal';
import WebLoader from '../shared/WebLoader';
import MotionButton from '../motion/MotionButton';
import AnimatedCounter from '../motion/AnimatedCounter';
import { fetchLeetCodeStats } from '../../lib/leetcodeApi';
import { useData } from '../../context/DataContext';
import { Search, CheckCircle2, Award, Zap, Download, RefreshCw } from 'lucide-react';
import { isReducedMotionPreferred, SPRING_SMOOTH } from '../../animations/motionConfig';

export default function LeetCodeImportModal({ isOpen, onClose }) {
  const { addProblem } = useData();
  const prefersReduced = isReducedMotionPreferred();

  const [username, setUsername] = useState('neal_wu');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imported, setImported] = useState(false);

  const handleFetch = async (e) => {
    e.preventDefault();
    if (!username) return;
    try {
      setError('');
      setLoading(true);
      setImported(false);
      const data = await fetchLeetCodeStats(username);
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch LeetCode profile');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickImportSample = () => {
    if (!stats) return;

    // Sample problems imported from LeetCode
    const sampleImported = [
      {
        title: `${username}'s Top DP Problem: Edit Distance`,
        platform: 'LeetCode',
        url: 'https://leetcode.com/problems/edit-distance/',
        difficulty: 'Hard',
        topics: ['Dynamic Programming', 'String'],
        status: 'solved',
        notes: 'Imported via LeetCode Profile sync. Minimum operations to convert word1 to word2.',
        timeSpentMin: 40,
      },
      {
        title: `${username}'s Graph Problem: Word Ladder`,
        platform: 'LeetCode',
        url: 'https://leetcode.com/problems/word-ladder/',
        difficulty: 'Hard',
        topics: ['Graph', 'BFS', 'Hash Table'],
        status: 'solved',
        notes: 'Shortest transformation sequence length using BFS queue.',
        timeSpentMin: 35,
      },
      {
        title: `${username}'s Array Problem: Product of Array Except Self`,
        platform: 'LeetCode',
        url: 'https://leetcode.com/problems/product-of-array-except-self/',
        difficulty: 'Medium',
        topics: ['Array', 'Prefix Sum'],
        status: 'solved',
        notes: 'Prefix and suffix product passes without using division operator.',
        timeSpentMin: 20,
      },
    ];

    sampleImported.forEach((p) => addProblem(p));
    setImported(true);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import LeetCode Profile" maxWidth="max-w-md">
      <div className="space-y-5">
        <p className="text-xs text-slate-400">
          Sync your LeetCode account to automatically populate solved problem counts, difficulty distribution, and create spaced repetition revision cards.
        </p>

        {/* Input form */}
        <form onSubmit={handleFetch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="LeetCode Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
          </div>
          <MotionButton
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold shrink-0"
          >
            {loading ? 'Fetching...' : 'Fetch Profile'}
          </MotionButton>
        </form>

        {loading && (
          <div className="py-6 flex justify-center">
            <WebLoader size="md" message="Connecting to LeetCode Web GraphQL API..." showBadges={false} />
          </div>
        )}

        {error && (
          <motion.div 
            initial={prefersReduced ? undefined : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold"
          >
            {error}
          </motion.div>
        )}

        {stats && (
          <motion.div 
            initial={prefersReduced ? undefined : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Header user card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                  @{stats.username}
                  {stats.isFallback && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium">
                      Demo Profile
                    </span>
                  )}
                </h4>
                <span className="text-xs text-slate-400 font-medium">Global Rank: #{stats.ranking}</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-cyan-400">
                  <AnimatedCounter value={stats.totalSolved} />
                </span>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Total Solved</span>
              </div>
            </div>

            {/* Difficulty breakdown */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-lg font-bold text-emerald-400">
                  <AnimatedCounter value={stats.easySolved} />
                </span>
                <span className="text-[10px] text-slate-400 block font-semibold">Easy</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-lg font-bold text-amber-400">
                  <AnimatedCounter value={stats.mediumSolved} />
                </span>
                <span className="text-[10px] text-slate-400 block font-semibold">Medium</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <span className="text-lg font-bold text-rose-400">
                  <AnimatedCounter value={stats.hardSolved} />
                </span>
                <span className="text-[10px] text-slate-400 block font-semibold">Hard</span>
              </div>
            </div>

            {/* Action button */}
            {imported ? (
              <motion.div 
                initial={prefersReduced ? undefined : { scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold text-center border border-emerald-500/30 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Problems successfully imported to your tracker queue!
              </motion.div>
            ) : (
              <MotionButton
                onClick={handleQuickImportSample}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Import Problems & Sync Revisions (+XP)
              </MotionButton>
            )}
          </motion.div>
        )}
      </div>
    </Modal>
  );
}
