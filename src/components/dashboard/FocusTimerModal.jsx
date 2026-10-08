import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../shared/Modal';
import MotionButton from '../motion/MotionButton';
import { Play, Pause, RotateCcw, Volume2, VolumeX, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { isReducedMotionPreferred, SPRING_SMOOTH, SPRING_TACTILE } from '../../animations/motionConfig';

export default function FocusTimerModal({ isOpen, onClose }) {
  const [initialMinutes, setInitialMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  const totalDuration = initialMinutes * 60;
  const prefersReduced = isReducedMotionPreferred();

  // Handle timer countdown tick
  useEffect(() => {
    let timerId = null;

    if (isActive && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      setIsCompleted(true);
      
      if (!prefersReduced) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#06b6d4', '#a855f7', '#10b981', '#f59e0b'],
        });
      }

      if (soundEnabled) {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.4);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        } catch (e) {
          console.warn("Audio Context error:", e);
        }
      }
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isActive, timeLeft, soundEnabled, prefersReduced]);

  const handleSelectPreset = (mins) => {
    setIsActive(false);
    setIsCompleted(false);
    setInitialMinutes(mins);
    setTimeLeft(mins * 60);
  };

  const handleAdjustTime = (deltaMins) => {
    setIsActive(false);
    setIsCompleted(false);
    const newMins = Math.max(1, Math.min(180, initialMinutes + deltaMins));
    setInitialMinutes(newMins);
    setTimeLeft(newMins * 60);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsCompleted(false);
    setTimeLeft(initialMinutes * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // SVG Circular progress math
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = totalDuration > 0 ? timeLeft / totalDuration : 0;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mock Interview & Focus Timer" maxWidth="max-w-md">
      <div className="py-2 px-1 flex flex-col items-center justify-center text-center space-y-5">
        {/* Preset Selector with animated active pill */}
        <div className="flex items-center justify-center gap-2 pt-1">
          {[15, 25, 45, 60].map((m) => (
            <motion.button
              key={m}
              onClick={() => handleSelectPreset(m)}
              whileHover={prefersReduced ? undefined : { scale: 1.05 }}
              whileTap={prefersReduced ? undefined : { scale: 0.95 }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
                initialMinutes === m
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {m} Min
            </motion.button>
          ))}
        </div>

        {/* Circular SVG Timer Clock Display */}
        <div className="relative w-48 h-48 flex items-center justify-center my-2">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-900"
              fill="transparent"
            />
            <motion.circle
              cx="96"
              cy="96"
              r={radius}
              stroke="url(#timerGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.4, ease: 'linear' }}
              fill="transparent"
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>

          {/* Clock Text inside SVG */}
          <div className="absolute flex flex-col items-center justify-center select-none">
            {isCompleted ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center"
              >
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-1" />
                <span className="text-xs font-extrabold text-emerald-400">Session Complete!</span>
              </motion.div>
            ) : (
              <>
                <motion.span 
                  key={`${minutes}-${seconds}`}
                  initial={prefersReduced ? undefined : { opacity: 0.9 }}
                  animate={{ opacity: 1 }}
                  className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight"
                >
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </motion.span>
                <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mt-1 flex items-center gap-1.5">
                  {isActive ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> : null}
                  {isActive ? 'Live' : 'Paused'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Adjust +/- minutes */}
        <div className="flex items-center gap-3 text-xs">
          <motion.button
            onClick={() => handleAdjustTime(-5)}
            whileHover={prefersReduced ? undefined : { scale: 1.05 }}
            whileTap={prefersReduced ? undefined : { scale: 0.95 }}
            className="px-3 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold border border-slate-800 cursor-pointer"
          >
            -5m
          </motion.button>
          <span className="text-slate-400 font-semibold text-[11px]">Adjust Time</span>
          <motion.button
            onClick={() => handleAdjustTime(+5)}
            whileHover={prefersReduced ? undefined : { scale: 1.05 }}
            whileTap={prefersReduced ? undefined : { scale: 0.95 }}
            className="px-3 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold border border-slate-800 cursor-pointer"
          >
            +5m
          </motion.button>
        </div>

        {/* Action Buttons with icon transition */}
        <div className="flex items-center gap-3 pt-2">
          <MotionButton
            onClick={() => setIsActive(!isActive)}
            className={`px-6 py-2.5 rounded-xl font-extrabold text-xs text-white shadow-xl flex items-center gap-2 ${
              isActive
                ? 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/20'
                : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-cyan-500/25'
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isActive ? 'pause' : 'play'}
                initial={prefersReduced ? undefined : { scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={prefersReduced ? undefined : { scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center"
              >
                {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </motion.div>
            </AnimatePresence>
            <span>{isActive ? 'Pause' : 'Start Focus Session'}</span>
          </MotionButton>

          <motion.button
            onClick={handleReset}
            whileHover={prefersReduced ? undefined : { scale: 1.08, rotate: -45 }}
            whileTap={prefersReduced ? undefined : { scale: 0.92 }}
            transition={SPRING_TACTILE}
            className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Reset Timer"
            aria-label="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>

          <motion.button
            onClick={() => setSoundEnabled(!soundEnabled)}
            whileHover={prefersReduced ? undefined : { scale: 1.08 }}
            whileTap={prefersReduced ? undefined : { scale: 0.92 }}
            transition={SPRING_TACTILE}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
            title={soundEnabled ? 'Sound On' : 'Sound Muted'}
            aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
}
