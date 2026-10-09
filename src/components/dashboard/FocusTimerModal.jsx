import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../shared/Modal';
import MotionButton from '../motion/MotionButton';
import FlipClock3D from '../timer/FlipClock3D';
import { Play, Pause, RotateCcw, Volume2, VolumeX, CheckCircle2, Sparkles, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { isReducedMotionPreferred, SPRING_TACTILE } from '../../animations/motionConfig';

export default function FocusTimerModal({ isOpen, onClose }) {
  const [initialMinutes, setInitialMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  const endTimeRef = useRef(null);
  const prefersReduced = isReducedMotionPreferred();

  // Play realistic two-tone completion chime via Web Audio API
  const playCompletionChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Tone 1: E5 (659.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
      gain1.gain.setValueAtTime(0.22, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.6);

      // Tone 2: A5 (880 Hz) - 160ms delay
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.16);
      gain2.gain.setValueAtTime(0.28, ctx.currentTime + 0.16);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.95);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.16);
      osc2.stop(ctx.currentTime + 0.95);
    } catch (e) {
      console.warn("Audio Context notice:", e);
    }
  };

  // Subtle mechanical split-flap click sound on each second flip
  const playMechanicalTickSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.02);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.02);
    } catch {
      // AudioContext policy
    }
  };

  const handleSessionComplete = () => {
    setIsActive(false);
    setIsCompleted(true);

    if (!prefersReduced) {
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#06c8dc', '#9635f0', '#10b981', '#f59e0b', '#f3f6fc'],
      });
    }

    playCompletionChime();
  };

  // High-precision, zero-drift countdown loop using target timestamp
  useEffect(() => {
    let intervalId = null;

    if (isActive) {
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + timeLeft * 1000;
      }

      let lastNotifiedSec = timeLeft;

      const tick = () => {
        const remainingMs = endTimeRef.current - Date.now();
        const remainingSecs = Math.max(0, Math.ceil(remainingMs / 1000));
        
        if (remainingSecs !== lastNotifiedSec) {
          lastNotifiedSec = remainingSecs;
          playMechanicalTickSound();
        }

        setTimeLeft(remainingSecs);

        if (remainingSecs <= 0) {
          clearInterval(intervalId);
          endTimeRef.current = null;
          handleSessionComplete();
        }
      };

      intervalId = setInterval(tick, 200);

      // Immediate resync when returning to browser tab
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && endTimeRef.current) {
          tick();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        clearInterval(intervalId);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } else {
      endTimeRef.current = null;
    }
  }, [isActive, prefersReduced, soundEnabled]);

  // Start / Pause toggle
  const handleToggleActive = () => {
    if (!isActive) {
      // Start or Resume
      if (timeLeft <= 0) {
        setTimeLeft(initialMinutes * 60);
        endTimeRef.current = Date.now() + initialMinutes * 60 * 1000;
      } else {
        endTimeRef.current = Date.now() + timeLeft * 1000;
      }
      setIsCompleted(false);
      setIsActive(true);
    } else {
      // Pause
      if (endTimeRef.current) {
        const remainingSecs = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
        setTimeLeft(remainingSecs);
      }
      endTimeRef.current = null;
      setIsActive(false);
    }
  };

  // Preset Selection
  const handleSelectPreset = (mins) => {
    setIsActive(false);
    setIsCompleted(false);
    endTimeRef.current = null;
    setInitialMinutes(mins);
    setTimeLeft(mins * 60);
  };

  // +/- 5 Minutes Adjustment
  const handleAdjustTime = (deltaMins) => {
    setIsCompleted(false);
    const newSecs = Math.max(60, Math.min(180 * 60, timeLeft + deltaMins * 60));
    setTimeLeft(newSecs);
    if (isActive) {
      endTimeRef.current = Date.now() + newSecs * 1000;
    }
  };

  // Reset Timer to initial preset
  const handleReset = () => {
    setIsActive(false);
    setIsCompleted(false);
    endTimeRef.current = null;
    setTimeLeft(initialMinutes * 60);
  };

  // Decompose timeLeft into Hours, Minutes, Seconds
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Mock Interview & Focus Timer" 
      maxWidth="max-w-2xl"
    >
      <div className="py-2 px-1 flex flex-col items-center justify-center text-center space-y-6">
        
        {/* Duration Presets Row */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {[15, 25, 45, 60].map((m) => {
            const isSelected = initialMinutes === m && !isCompleted;
            return (
              <motion.button
                key={m}
                onClick={() => handleSelectPreset(m)}
                whileHover={prefersReduced ? undefined : { scale: 1.05 }}
                whileTap={prefersReduced ? undefined : { scale: 0.95 }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#06C8DC] to-[#9635F0] text-white shadow-lg shadow-[#06C8DC]/20 border border-[#06C8DC]/40'
                    : 'bg-[#0F1425] text-[#94A3B8] hover:bg-[#151B2D] hover:text-[#F3F6FC] border border-[#29334A]'
                }`}
              >
                {m} Min
              </motion.button>
            );
          })}
        </div>

        {/* Premium 3D Mechanical Flip Clock */}
        <div className="w-full my-2">
          <FlipClock3D 
            hours={hours}
            minutes={minutes}
            seconds={seconds}
            isActive={isActive}
            prefersReduced={prefersReduced}
          />
        </div>

        {/* Completion or Active Status Banner */}
        {isCompleted ? (
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-lg shadow-emerald-500/10"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Focus Session Completed! Outstanding consistency.</span>
          </motion.div>
        ) : (
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#06C8DC] animate-ping' : 'bg-slate-600'}`} />
            <span>{isActive ? 'Session Live & Synchronized' : 'Timer Ready / Paused'}</span>
          </div>
        )}

        {/* Time Adjustment Controls (-5m / Adjust Time / +5m) */}
        <div className="flex items-center gap-3 text-xs">
          <motion.button
            onClick={() => handleAdjustTime(-5)}
            whileHover={prefersReduced ? undefined : { scale: 1.05 }}
            whileTap={prefersReduced ? undefined : { scale: 0.94 }}
            className="px-3.5 py-1.5 rounded-xl bg-[#0F1425] hover:bg-[#151B2D] text-[#F3F6FC] font-extrabold border border-[#29334A] shadow-sm hover:border-[#06C8DC]/40 cursor-pointer transition-colors"
          >
            -5m
          </motion.button>
          <span className="text-[#94A3B8] font-bold text-xs uppercase tracking-wider select-none">
            Adjust Time
          </span>
          <motion.button
            onClick={() => handleAdjustTime(+5)}
            whileHover={prefersReduced ? undefined : { scale: 1.05 }}
            whileTap={prefersReduced ? undefined : { scale: 0.94 }}
            className="px-3.5 py-1.5 rounded-xl bg-[#0F1425] hover:bg-[#151B2D] text-[#F3F6FC] font-extrabold border border-[#29334A] shadow-sm hover:border-[#06C8DC]/40 cursor-pointer transition-colors"
          >
            +5m
          </motion.button>
        </div>

        {/* Primary & Secondary Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {/* Main Action Button */}
          <MotionButton
            onClick={handleToggleActive}
            className={`px-8 py-3 rounded-xl font-extrabold text-xs text-white shadow-xl flex items-center gap-2.5 transition-all transform active:scale-95 ${
              isActive
                ? 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/20'
                : 'bg-gradient-to-r from-[#06C8DC] to-[#9635F0] hover:from-[#06C8DC]/90 hover:to-[#9635F0]/90 shadow-[#06C8DC]/25 border border-[#06C8DC]/30'
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
                {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              </motion.div>
            </AnimatePresence>
            <span>
              {isActive ? 'Pause Session' : timeLeft < initialMinutes * 60 && timeLeft > 0 ? 'Resume Session' : 'Start Focus Session'}
            </span>
          </MotionButton>

          {/* Reset Action Button */}
          <motion.button
            onClick={handleReset}
            whileHover={prefersReduced ? undefined : { scale: 1.08, rotate: -45 }}
            whileTap={prefersReduced ? undefined : { scale: 0.92 }}
            transition={SPRING_TACTILE}
            className="p-3 rounded-xl bg-[#0F1425] hover:bg-[#151B2D] border border-[#29334A] text-[#94A3B8] hover:text-[#F3F6FC] transition-colors cursor-pointer shadow-md"
            title="Reset Timer"
            aria-label="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>

          {/* Sound Toggle Button */}
          <motion.button
            onClick={() => setSoundEnabled(!soundEnabled)}
            whileHover={prefersReduced ? undefined : { scale: 1.08 }}
            whileTap={prefersReduced ? undefined : { scale: 0.92 }}
            transition={SPRING_TACTILE}
            className={`p-3 rounded-xl border transition-colors cursor-pointer shadow-md ${
              soundEnabled
                ? 'bg-[#06C8DC]/10 text-[#06C8DC] border-[#06C8DC]/40'
                : 'bg-[#0F1425] text-slate-500 border-[#29334A]'
            }`}
            title={soundEnabled ? 'Completion Sound Enabled' : 'Sound Muted'}
            aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </motion.button>
        </div>

      </div>
    </Modal>
  );
}
