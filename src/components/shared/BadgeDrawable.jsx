import React from 'react';
import { 
  Swords, 
  Star, 
  Compass, 
  Code2, 
  Award, 
  Crown, 
  Layers, 
  Cpu, 
  Gem, 
  Shield, 
  Flame, 
  Zap, 
  Rocket, 
  Sparkles, 
  History, 
  Brain, 
  Milestone, 
  CheckCircle2, 
  Target, 
  Medal, 
  Trophy, 
  Lock
} from 'lucide-react';

const DRAWABLE_ICON_MAP = {
  swords: Swords,
  star: Star,
  compass: Compass,
  code: Code2,
  award: Award,
  crown: Crown,
  layers: Layers,
  cpu: Cpu,
  gem: Gem,
  shield: Shield,
  flame: Flame,
  zap: Zap,
  rocket: Rocket,
  sparkles: Sparkles,
  history: History,
  brain: Brain,
  milestone: Milestone,
  checkCircle: CheckCircle2,
  target: Target,
  medal: Medal,
  trophy: Trophy,
};

const SIZE_CONFIGS = {
  sm: {
    container: 'w-8 h-8 rounded-lg',
    icon: 'w-4 h-4',
    lock: 'w-2.5 h-2.5',
  },
  md: {
    container: 'w-11 h-11 rounded-xl',
    icon: 'w-5 h-5',
    lock: 'w-3 h-3',
  },
  lg: {
    container: 'w-14 h-14 rounded-2xl',
    icon: 'w-7 h-7',
    lock: 'w-4 h-4',
  },
  xl: {
    container: 'w-20 h-20 rounded-3xl',
    icon: 'w-10 h-10',
    lock: 'w-5 h-5',
  },
};

/**
 * Premium SVG Vector Badge Drawable Component
 * Renders glowing, metallic, game-like vector badges instead of flat emojis.
 */
export default function BadgeDrawable({
  drawable = 'trophy',
  isUnlocked = true,
  badgeColor = 'from-amber-400 to-orange-500',
  size = 'md',
  className = '',
}) {
  const IconComponent = DRAWABLE_ICON_MAP[drawable] || Trophy;
  const cfg = SIZE_CONFIGS[size] || SIZE_CONFIGS.md;

  if (!isUnlocked) {
    return (
      <div 
        className={`relative inline-flex items-center justify-center shrink-0 border border-slate-800 bg-slate-900/60 shadow-inner select-none ${cfg.container} ${className}`}
        title="Badge Locked"
      >
        <IconComponent className={`${cfg.icon} text-slate-600 opacity-60`} />
        {/* Subtle lock glyph overlay on corner */}
        <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-slate-950 border border-slate-700 text-slate-400">
          <Lock className={cfg.lock} />
        </span>
      </div>
    );
  }

  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 select-none group ${className}`}
    >
      {/* Radiant ambient aura */}
      <span 
        className="absolute inset-0 rounded-2xl blur-md opacity-40 transition-opacity group-hover:opacity-75 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.4) 0%, rgba(99,102,241,0.2) 80%, transparent 100%)'
        }}
      />

      {/* Outer Metallic / Radiant Shield Container */}
      <div 
        className={`relative flex items-center justify-center p-0.5 bg-gradient-to-br ${badgeColor} shadow-lg shadow-amber-500/10 border border-white/20 ${cfg.container}`}
      >
        {/* Inner Dark Frosted Plate */}
        <div className="w-full h-full rounded-[inherit] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center shadow-inner">
          <IconComponent 
            className={`${cfg.icon} text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] filter transition-transform group-hover:scale-110 duration-200`} 
          />
        </div>
      </div>
    </div>
  );
}
