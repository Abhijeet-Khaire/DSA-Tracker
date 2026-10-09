import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { CURATED_ROADMAPS } from '../lib/curatedRoadmaps';
import LottieWrapper from '../components/shared/LottieWrapper';
import StreakFlameDrawable from '../components/shared/StreakFlameDrawable';
import TopicProgressChart from '../components/dsa/TopicProgressChart';
import DifficultyChart from '../components/dsa/DifficultyChart';
import MotionButton from '../components/motion/MotionButton';
import AnimatedCounter from '../components/motion/AnimatedCounter';
import { Award, Share2, Check, Zap, ShieldCheck, Cloud, Terminal, CheckCircle2, ArrowRight, ExternalLink, Sparkles, Edit3, X, UserCheck, Cpu } from 'lucide-react';
import Modal from '../components/shared/Modal';
import { isReducedMotionPreferred, SPRING_SMOOTH } from '../animations/motionConfig';

export default function ProfileResume() {
  const { currentUser } = useAuth();
  const { problems, tasks, xp, levelInfo, calculateStreak, unlockedAchievements, roadmapProgress, userProfile, saveUserProfile } = useData();

  const [copied, setCopied] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLeetCode, setEditLeetCode] = useState('');
  const [editGithub, setEditGithub] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const prefersReduced = isReducedMotionPreferred();
  const navigate = useNavigate();

  const awsRoadmap = CURATED_ROADMAPS.find((r) => r.id === 'aws-devops-30');
  const awsCompletedDays = roadmapProgress?.['aws-devops-30'] || [];

  const totalAwsDays = awsRoadmap?.problems?.length || 30;
  const awsProgressPercent = Math.round((awsCompletedDays.length / totalAwsDays) * 100);

  const streak = calculateStreak();
  const solvedCount = problems.filter((p) => p.status === 'solved').length;
  const hardSolvedCount = problems.filter((p) => p.status === 'solved' && p.difficulty === 'Hard').length;
  const tasksDoneCount = tasks.filter(t => t.status === 'done').length;

  const handleOpenEdit = () => {
    setEditName(userProfile?.displayName || currentUser?.displayName || '');
    setEditRole(userProfile?.targetRole || 'Software Engineer');
    setEditBio(userProfile?.bio || 'DSA & System Design Enthusiast');
    setEditLeetCode(userProfile?.leetcodeUsername || '');
    setEditGithub(userProfile?.githubUsername || '');
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    await saveUserProfile({
      displayName: editName,
      targetRole: editRole,
      bio: editBio,
      leetcodeUsername: editLeetCode,
      githubUsername: editGithub,
    });
    setSavingProfile(false);
    setIsEditModalOpen(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Top Banner with Share Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-3">
            <motion.div 
              whileHover={prefersReduced ? undefined : { scale: 1.1, rotate: 6 }}
              className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 text-white cursor-default"
            >
              <Award className="w-6 h-6" />
            </motion.div>
            DSA Resume & Skill Card
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Your verified performance record, active streaks, and algorithm topic mastery.
          </p>
        </div>

        {/* Share Button with Animated Confirmation State */}
        <MotionButton
          onClick={handleCopyLink}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs text-white shadow-lg transition-colors flex items-center gap-2 shrink-0 ${
            copied
              ? 'bg-emerald-600 shadow-emerald-500/25 border border-emerald-400/40'
              : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-cyan-500/20'
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.div
                key="copied"
                initial={prefersReduced ? undefined : { scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={prefersReduced ? undefined : { scale: 0.6, opacity: 0 }}
                className="flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 text-emerald-200" />
                <span>Link Copied!</span>
              </motion.div>
            ) : (
              <motion.div
                key="share"
                initial={prefersReduced ? undefined : { scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={prefersReduced ? undefined : { scale: 0.6, opacity: 0 }}
                className="flex items-center gap-1.5"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Profile</span>
              </motion.div>
            )}
          </AnimatePresence>
        </MotionButton>
      </div>

      {/* Main Resume Card container */}
      <div className="p-8 rounded-3xl glass-panel bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden space-y-8">
        {/* Glow backdrop decorative effect */}
        {!prefersReduced && (
          <>
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
          </>
        )}

        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 border-b border-slate-800/80 pb-6 relative z-10">
          <div className="flex items-center gap-4">
            <motion.img
              whileHover={prefersReduced ? undefined : { scale: 1.05 }}
              src={currentUser?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
              alt="Profile Avatar"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-500 shadow-xl shadow-cyan-500/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
                  {userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Member'}
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                </h2>
                <button
                  onClick={handleOpenEdit}
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                  title="Edit Profile"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="text-[10px] hidden sm:inline">Edit Profile</span>
                </button>
              </div>
              <p className="text-xs text-slate-400 font-medium">{currentUser?.email || 'Authenticated User'}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`px-3 py-0.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${levelInfo.badgeColor}`}>
                  Level {levelInfo.level} — {levelInfo.title}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {userProfile?.targetRole || 'Software Engineer'}
                </span>
              </div>
              {userProfile?.bio && (
                <p className="text-[11px] text-slate-400 italic mt-1.5 line-clamp-2 max-w-md">
                  "{userProfile.bio}"
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2">
              <StreakFlameDrawable streak={streak} className="w-8 h-8" />
              <div>
                <span className="text-xs font-extrabold text-amber-400 block leading-tight">
                  <AnimatedCounter value={streak} suffix=" Days" />
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Active Streak</span>
              </div>
            </div>

            <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400" />
              <div>
                <span className="text-xs font-extrabold text-cyan-400 block leading-tight">
                  <AnimatedCounter value={xp} suffix=" XP" />
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Earned Points</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid with Animated Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
          <motion.div 
            whileHover={prefersReduced ? undefined : { y: -2 }}
            className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center cursor-default"
          >
            <span className="text-2xl font-extrabold text-cyan-400">
              <AnimatedCounter value={solvedCount} />
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase block mt-1">Problems Solved</span>
          </motion.div>
          <motion.div 
            whileHover={prefersReduced ? undefined : { y: -2 }}
            className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center cursor-default"
          >
            <span className="text-2xl font-extrabold text-rose-400">
              <AnimatedCounter value={hardSolvedCount} />
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase block mt-1">Hard Problems</span>
          </motion.div>
          <motion.div 
            whileHover={prefersReduced ? undefined : { y: -2 }}
            className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center cursor-default"
          >
            <span className="text-2xl font-extrabold text-purple-400">
              <AnimatedCounter value={tasksDoneCount} />
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase block mt-1">Tasks Completed</span>
          </motion.div>
          <motion.div 
            whileHover={prefersReduced ? undefined : { y: -2 }}
            className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center cursor-default"
          >
            <span className="text-2xl font-extrabold text-amber-400">
              <AnimatedCounter value={unlockedAchievements.length} />
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase block mt-1">Badges Unlocked</span>
          </motion.div>
        </div>

        {/* Charts in Resume */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800/80">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Topic Mastery</h4>
            <TopicProgressChart />
          </div>
          <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800/80">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Difficulty Distribution</h4>
            <DifficultyChart />
          </div>
        </div>

        {/* Active Career Roadmap: AWS & DevOps 30-Day Track */}
        <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 relative z-10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Cloud className="w-4 h-4" />
                </span>
                <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider font-mono">
                  Active Specialization Track
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                  30 Days Hands-On
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-100 flex items-center gap-2">
                DevOps with AWS – 30 Day Roadmap
              </h3>
              <p className="text-xs text-slate-400 max-w-xl">
                Structured hands-on curriculum covering AWS Core, Linux CLI, Git, Terraform, Ansible, Docker, Kubernetes, Helm, and Observability.
              </p>
            </div>

            <MotionButton
              onClick={() => navigate('/dsa?roadmap=aws-devops-30')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 shrink-0 self-start sm:self-center"
            >
              <span>Continue Roadmap</span>
              <ArrowRight className="w-4 h-4" />
            </MotionButton>
          </div>

          {/* Progress Bar & Milestone Statistics */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-300">Curriculum Completion</span>
              <span className="text-cyan-400 font-mono">
                {awsCompletedDays.length} / {totalAwsDays} Days ({awsProgressPercent}%)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${awsProgressPercent}%` }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>

          {/* 4 Weekly Milestone Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {awsRoadmap?.weeks?.map((week) => (
              <div
                key={week.weekNumber}
                className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-200">
                    <span>
                      {week.weekNumber === 1 && <Terminal className="w-3.5 h-3.5 text-cyan-400" />}
                      {week.weekNumber === 2 && <Cpu className="w-3.5 h-3.5 text-purple-400" />}
                      {week.weekNumber === 3 && <Cloud className="w-3.5 h-3.5 text-blue-400" />}
                      {week.weekNumber >= 4 && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                    </span>
                    <span>Week {week.weekNumber}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-tight">
                    {week.focus}
                  </p>
                </div>
                <div className="text-[10px] font-mono text-cyan-400 pt-1 border-t border-slate-800/50">
                  {week.days.length} Daily Hands-On Labs
                </div>
              </div>
            ))}
          </div>

          {/* Core Skills Verified on Resume */}
          <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Key Competencies:
            </span>
            {['AWS EC2', 'IAM & S3', 'Linux CLI', 'Git/GitHub', 'Terraform (IaC)', 'Ansible Playbooks', 'Docker Containers', 'AWS ECR', 'Kubernetes (Minikube)', 'Helm Charts', 'Python Boto3', 'Prometheus & Grafana', 'AWS CloudWatch'].map((skill, sIdx) => (
              <span
                key={sIdx}
                className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile & Skills Record"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Full Name / Display Name</label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Target Engineering Role</label>
            <input
              type="text"
              required
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              placeholder="e.g. Software Engineer, Backend Developer"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Bio / Headline</label>
            <textarea
              rows="3"
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              placeholder="Brief summary of your background, technical interests, and goals..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">LeetCode Username</label>
              <input
                type="text"
                value={editLeetCode}
                onChange={(e) => setEditLeetCode(e.target.value)}
                placeholder="Enter LeetCode username"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">GitHub Username</label>
              <input
                type="text"
                value={editGithub}
                onChange={(e) => setEditGithub(e.target.value)}
                placeholder="Enter GitHub username"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingProfile}
              className="px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              {savingProfile ? 'Saving...' : 'Save to Database'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
