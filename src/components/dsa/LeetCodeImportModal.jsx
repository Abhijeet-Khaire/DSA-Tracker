import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../shared/Modal';
import WebLoader from '../shared/WebLoader';
import MotionButton from '../motion/MotionButton';
import AnimatedCounter from '../motion/AnimatedCounter';
import { fetchLeetCodeStats, parseLeetCodeUsername } from '../../lib/leetcodeApi';
import { useData } from '../../context/DataContext';
import { Search, CheckCircle2, Download, ExternalLink, X, Code2, Globe } from 'lucide-react';
import { isReducedMotionPreferred, SPRING_SMOOTH } from '../../animations/motionConfig';

export default function LeetCodeImportModal({ isOpen, onClose }) {
  const { problems, addProblem, addXp, userProfile, saveUserProfile } = useData();
  const prefersReduced = isReducedMotionPreferred();

  const [inputVal, setInputVal] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imported, setImported] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  // Sync initial input from user's saved profile if available
  useEffect(() => {
    if (isOpen) {
      setError('');
      setImported(false);
      if (!inputVal && userProfile?.leetcodeUsername) {
        setInputVal(`https://leetcode.com/u/${userProfile.leetcodeUsername}`);
      }
    }
  }, [isOpen, userProfile]);

  const handleFetch = async (e) => {
    e.preventDefault();
    const cleanUsername = parseLeetCodeUsername(inputVal);
    if (!cleanUsername) {
      setError('Please enter your LeetCode profile URL (e.g. https://leetcode.com/u/your_username) or username.');
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

  const handleImportProblems = () => {
    if (!stats) return;

    let addedCount = 0;
    const existingTitles = new Set((problems || []).map((p) => p.title.toLowerCase().trim()));

    if (stats.recentSubmissions && stats.recentSubmissions.length > 0) {
      stats.recentSubmissions.forEach((sub) => {
        const cleanTitle = sub.title?.trim();
        if (!cleanTitle || existingTitles.has(cleanTitle.toLowerCase())) return;

        const titleSlug = sub.titleSlug || cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        // Infer difficulty if not directly available
        let difficulty = sub.difficulty;
        if (!difficulty) {
          if (stats.hardSolved > stats.easySolved) difficulty = 'Hard';
          else if (stats.mediumSolved > stats.easySolved) difficulty = 'Medium';
          else difficulty = 'Easy';
        }

        addProblem({
          title: cleanTitle,
          platform: 'LeetCode',
          url: `https://leetcode.com/problems/${titleSlug}/`,
          difficulty,
          topics: ['LeetCode Import', sub.lang ? sub.lang.toUpperCase() : 'Algorithms'],
          status: 'solved',
          notes: `Imported from @${stats.username}'s LeetCode profile on ${new Date().toISOString().split('T')[0]}.`,
          timeSpentMin: 25,
        });

        existingTitles.add(cleanTitle.toLowerCase());
        addedCount++;
      });
    }

    // Save linked LeetCode username to profile
    if (saveUserProfile) {
      saveUserProfile({ leetcodeUsername: stats.username });
    }

    addXp(50, `LeetCode Sync: @${stats.username}`);
    setImportedCount(addedCount);
    setImported(true);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import LeetCode Profile" maxWidth="max-w-lg">
      <div className="space-y-5">
        <p className="text-xs text-slate-400 leading-relaxed">
          Paste your public LeetCode profile URL to fetch your live statistics, global rank, and import your real solved submissions into your DSA tracker queue.
        </p>

        {/* Input form */}
        <form onSubmit={handleFetch} className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="https://leetcode.com/u/username or username"
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

            {/* Preview of actual recent submissions */}
            {stats.recentSubmissions && stats.recentSubmissions.length > 0 ? (
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <Code2 className="w-3.5 h-3.5" /> Recent Solved Submissions ({stats.recentSubmissions.length})
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">Ready to Import</span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
                  {stats.recentSubmissions.map((sub, i) => (
                    <div
                      key={sub.titleSlug || i}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs"
                    >
                      <span className="text-slate-200 truncate font-medium max-w-[280px]">
                        {sub.title}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 shrink-0">
                        {sub.lang ? sub.lang.toUpperCase() : 'ACCEPTED'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 text-center">
                Live statistics fetched successfully! (Profile submissions are private or none recorded recently.)
              </div>
            )}

            {/* Action button */}
            {imported ? (
              <motion.div
                initial={prefersReduced ? undefined : { scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-3.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  {importedCount > 0
                    ? `Successfully imported ${importedCount} actual problems into your tracker queue (+50 XP)!`
                    : `Profile linked to @${stats.username} and statistics synced (+50 XP)!`}
                </span>
              </motion.div>
            ) : (
              <MotionButton
                onClick={handleImportProblems}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                {stats.recentSubmissions && stats.recentSubmissions.length > 0
                  ? `Import ${stats.recentSubmissions.length} Solved Problems & Link Profile (+50 XP)`
                  : 'Link Profile & Sync Stats (+50 XP)'}
              </MotionButton>
            )}
          </motion.div>
        )}
      </div>
    </Modal>
  );
}
