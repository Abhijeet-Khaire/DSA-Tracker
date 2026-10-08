// XP Engine for GrindTrack

export const XP_REWARDS = {
  PROBLEM_EASY: 15,
  PROBLEM_MEDIUM: 30,
  PROBLEM_HARD: 60,
  PROBLEM_REVISION: 15,
  TASK_COMPLETE: 10,
  DAILY_STREAK_BONUS: 25,
  ALL_TASKS_BONUS: 20,
};

export const RANKS = [
  { level: 1, title: 'Novice Coder', minXp: 0, badgeColor: 'from-slate-500 to-slate-700' },
  { level: 2, title: 'Syntax Explorer', minXp: 100, badgeColor: 'from-blue-500 to-cyan-500' },
  { level: 3, title: 'Algorithm Apprentice', minXp: 250, badgeColor: 'from-cyan-500 to-teal-500' },
  { level: 4, title: 'Problem Solver', minXp: 500, badgeColor: 'from-emerald-500 to-green-600' },
  { level: 5, title: 'Pattern Specialist', minXp: 900, badgeColor: 'from-amber-500 to-orange-500' },
  { level: 6, title: 'Code Tactician', minXp: 1400, badgeColor: 'from-purple-500 to-indigo-600' },
  { level: 7, title: 'DSA Architect', minXp: 2000, badgeColor: 'from-pink-500 to-rose-600' },
  { level: 8, title: 'Grandmaster Grind', minXp: 3000, badgeColor: 'from-yellow-400 to-amber-600' },
];

export function calculateLevel(xp) {
  let currentRank = RANKS[0];
  let nextRank = RANKS[1];

  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].minXp) {
      currentRank = RANKS[i];
      nextRank = RANKS[i + 1] || { ...RANKS[i], minXp: RANKS[i].minXp + 1000 };
    }
  }

  const currentLevelMin = currentRank.minXp;
  const nextLevelMin = nextRank.minXp;
  const xpInLevel = xp - currentLevelMin;
  const totalForLevel = nextLevelMin - currentLevelMin;
  const progressPercent = Math.min(100, Math.max(0, Math.round((xpInLevel / totalForLevel) * 100)));

  return {
    level: currentRank.level,
    title: currentRank.title,
    badgeColor: currentRank.badgeColor,
    currentXp: xp,
    xpInLevel,
    totalForLevel,
    progressPercent,
    nextLevelXp: nextLevelMin,
  };
}

export const ACHIEVEMENTS = [
  {
    id: 'first_solve',
    title: 'First Blood',
    description: 'Solve your very first DSA problem',
    icon: '⚔️',
    xpReward: 50,
    condition: (stats) => stats.solvedCount >= 1,
  },
  {
    id: 'streak_3',
    title: 'Consistency Unlocked',
    description: 'Maintain a 3-day active streak',
    icon: '🔥',
    xpReward: 75,
    condition: (stats) => stats.streak >= 3,
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day active streak',
    icon: '⚡',
    xpReward: 150,
    condition: (stats) => stats.streak >= 7,
  },
  {
    id: 'hard_solver',
    title: 'Hardcore Coder',
    description: 'Solve at least 5 Hard difficulty problems',
    icon: '💎',
    xpReward: 200,
    condition: (stats) => stats.hardSolvedCount >= 5,
  },
  {
    id: 'revision_master',
    title: 'Memory Palace',
    description: 'Complete 10 spaced-repetition revisions',
    icon: '🧠',
    xpReward: 120,
    condition: (stats) => stats.revisionsCompleted >= 10,
  },
  {
    id: 'task_slayer',
    title: 'Productivity Beast',
    description: 'Complete 25 daily tasks',
    icon: '🎯',
    xpReward: 100,
    condition: (stats) => stats.tasksCompletedCount >= 25,
  },
];
