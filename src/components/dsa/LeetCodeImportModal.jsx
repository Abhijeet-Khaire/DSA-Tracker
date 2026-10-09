import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../shared/Modal';
import WebLoader from '../shared/WebLoader';
import MotionButton from '../motion/MotionButton';
import AnimatedCounter from '../motion/AnimatedCounter';
import { fetchLeetCodeStats, parseLeetCodeUsername } from '../../lib/leetcodeApi';
import { useData } from '../../context/DataContext';
import { Search, CheckCircle2, Download, ExternalLink, X, Globe, Sparkles } from 'lucide-react';
import { isReducedMotionPreferred, SPRING_SMOOTH } from '../../animations/motionConfig';

export default function LeetCodeImportModal({ isOpen, onClose }) {
  const { addXp, userProfile, saveUserProfile } = useData();
  const prefersReduced = isReducedMotionPreferred();

  const [inputVal, setInputVal] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imported, setImported] = useState(false);
  const closeTimerRef = useRef(null);

  // Sync initial input from user's saved profile if available
  useEffect(() => {
    if (isOpen) {
      setError('');
      setImported(false);
      if (!inputVal && userProfile?.leetcodeUsername) {
        setInputVal(`https://leetcode.com/u/${userProfile.leetcodeUsername}`);
      }
    }
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [isOpen, userProfile]);

  const handleFetch = async (e) => {
    e.preventDefault();
    const cleanUsername = parseLeetCodeUsername(inputVal);
    if (!cleanUsername) {
      setError('Please enter a valid LeetCode profile URL or username.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      setImported(false);
      setStats(null);

      const data = await fetchLeetCodeStats(inputVal);
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch LeetCode profile');
    } finally {
      setLoading(false);
    }
  };

  // Calculate XP earned from live solved distribution
  const earnedXp = stats
    ? Math.max(50, (stats.easySolved * 15) + (stats.mediumSolved * 30) + (stats.hardSolved * 60))
    : 50;

  const handleImportProfileAndXp = () => {
    if (!stats) return;

    // 1. Save linked LeetCode username and stats into user profile
    if (saveUserProfile) {
      saveUserProfile({
        leetcodeUsername: stats.username,
        leetcodeStats: {
          totalSolved: stats.totalSolved,
          easySolved: stats.easySolved,
          mediumSolved: stats.mediumSolved,
          hardSolved: stats.hardSolved,
          ranking: stats.ranking,
          reputation: stats.reputation,
          avatar: stats.avatar,
        },
      });
    }

    // 2. Award earned XP based on LeetCode solves
    addXp(earnedXp, `LeetCode Sync: @${stats.username} (${stats.totalSolved} Solved)`);

    setImported(true);

    // 3. Automatically close modal after brief confirmation feedback
    closeTimerRef.current = setTimeout(() => {
      onClose();
    }, 750);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import LeetCode Profile" maxWidth="max-w-lg">
      <div className="space-y-5">
        <p className="text-xs text-slate-400 leading-relaxed">
          Enter your public LeetCode profile URL or username to synchronize your statistics, global rank, and XP directly to your account.
        </p>

        {/* Input form */}
        <form onSubmit={handleFetch} className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Enter LeetCode profile URL or username"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono"
              />
              {inputVal && (
                <button
                  type="button"
                  onClick={() => setInputVal('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <MotionButton
              type="submit"
              disabled={loading || !inputVal.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-bold shrink-0 disabled:opacity-50 cursor-pointer shadow-md"
            >
              {loading ? 'Fetching...' : 'Fetch Live Profile'}
            </MotionButton>
          </div>
          <span className="text-[10px] text-slate-500 block pl-1">
            Accepts <span className="font-mono text-cyan-400">https://leetcode.com/u/your_name</span> or plain username.
          </span>
        </form>

        {loading && (
          <div className="py-6 flex justify-center">
            <WebLoader size="md" message="Connecting to LeetCode API..." showBadges={false} />
          </div>
        )}

        {error && (
          <motion.div
            initial={prefersReduced ? undefined : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-start gap-2.5"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
            <p className="flex-1">{error}</p>
          </motion.div>
        )}

        {stats && (
          <motion.div
            initial={prefersReduced ? undefined : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Header user card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={stats.avatar}
                  alt={stats.username}
                  className="w-11 h-11 rounded-xl object-cover border border-cyan-500/40 bg-slate-900 shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${stats.username}`;
                  }}
                />
                <div>
                  <h4 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                    @{stats.username}
                    <a
                      href={`https://leetcode.com/u/${stats.username}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-cyan-400 transition-colors"
                      title="Open LeetCode Profile in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <span>Rank: #{stats.ranking}</span>
                    {stats.reputation > 0 && (
                      <>
                        <span>&bull;</span>
                        <span className="text-amber-400 font-mono">{stats.reputation} Rep</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-2xl font-black text-cyan-400 font-mono">
                  <AnimatedCounter value={stats.totalSolved} />
                </span>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                  Total Solved
                </span>
              </div>
            </div>

            {/* Difficulty breakdown */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  <AnimatedCounter value={stats.easySolved} />
                </span>
                <span className="text-[10px] text-slate-400 block font-semibold">Easy</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-lg font-bold text-amber-400 font-mono">
                  <AnimatedCounter value={stats.mediumSolved} />
                </span>
                <span className="text-[10px] text-slate-400 block font-semibold">Medium</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <span className="text-lg font-bold text-rose-400 font-mono">
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
                className="p-3.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Profile and +{earnedXp} XP successfully imported! Closing...</span>
              </motion.div>
            ) : (
              <MotionButton
                onClick={handleImportProfileAndXp}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Import Profile & Add XP (+{earnedXp} XP)
              </MotionButton>
            )}
          </motion.div>
        )}
      </div>
    </Modal>
  );
}
