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
  // 1. Problem Solving Milestones
  {
    id: 'first_solve',
    title: 'First Blood',
    description: 'Solve your very first DSA problem',
    drawable: 'swords',
    category: 'problems',
    badgeColor: 'from-amber-500 to-rose-500',
    xpReward: 50,
    condition: (stats) => (stats.solvedCount || 0) >= 1,
  },
  {
    id: 'solve_5',
    title: 'Code Trainee',
    description: 'Solve 5 DSA problems and establish momentum',
    drawable: 'star',
    category: 'problems',
    badgeColor: 'from-yellow-400 to-amber-600',
    xpReward: 75,
    condition: (stats) => (stats.solvedCount || 0) >= 5,
  },
  {
    id: 'solve_15',
    title: 'Algorithm Explorer',
    description: 'Solve 15 DSA problems across different topics',
    drawable: 'compass',
    category: 'problems',
    badgeColor: 'from-cyan-400 to-blue-600',
    xpReward: 120,
    condition: (stats) => (stats.solvedCount || 0) >= 15,
  },
  {
    id: 'solve_30',
    title: 'Code Tactician',
    description: 'Solve 30 DSA problems with precision',
    drawable: 'code',
    category: 'problems',
    badgeColor: 'from-emerald-400 to-teal-600',
    xpReward: 200,
    condition: (stats) => (stats.solvedCount || 0) >= 30,
  },
  {
    id: 'solve_50',
    title: 'Half-Century Milestone',
    description: 'Solve 50 DSA problems and join elite grinders',
    drawable: 'award',
    category: 'problems',
    badgeColor: 'from-purple-500 to-indigo-600',
    xpReward: 350,
    condition: (stats) => (stats.solvedCount || 0) >= 50,
  },
  {
    id: 'solve_100',
    title: 'Century Grandmaster',
    description: 'Solve 100 DSA problems — pinnacle mastery',
    drawable: 'crown',
    category: 'problems',
    badgeColor: 'from-amber-300 via-yellow-400 to-orange-500',
    xpReward: 750,
    condition: (stats) => (stats.solvedCount || 0) >= 100,
  },

  // 2. Difficulty Challenges
  {
    id: 'medium_solver',
    title: 'Pattern Strategist',
    description: 'Solve at least 5 Medium difficulty problems',
    drawable: 'layers',
    category: 'difficulty',
    badgeColor: 'from-blue-400 to-cyan-500',
    xpReward: 150,
    condition: (stats) => (stats.mediumSolvedCount || 0) >= 5,
  },
  {
    id: 'medium_master',
    title: 'Optimal Architect',
    description: 'Solve at least 15 Medium difficulty problems',
    drawable: 'cpu',
    category: 'difficulty',
    badgeColor: 'from-indigo-500 to-purple-600',
    xpReward: 275,
    condition: (stats) => (stats.mediumSolvedCount || 0) >= 15,
  },
  {
    id: 'hard_solver',
    title: 'Hardcore Coder',
    description: 'Solve at least 3 Hard difficulty problems',
    drawable: 'gem',
    category: 'difficulty',
    badgeColor: 'from-rose-500 to-pink-600',
    xpReward: 200,
    condition: (stats) => (stats.hardSolvedCount || 0) >= 3,
  },
  {
    id: 'hard_master',
    title: 'Titan of Algorithms',
    description: 'Conquer at least 10 Hard difficulty problems',
    drawable: 'shield',
    category: 'difficulty',
    badgeColor: 'from-red-600 to-purple-700',
    xpReward: 500,
    condition: (stats) => (stats.hardSolvedCount || 0) >= 10,
  },

  // 3. Streak & Daily Consistency
  {
    id: 'streak_3',
    title: 'Consistency Spark',
    description: 'Maintain a 3-day active daily streak',
    drawable: 'flame',
    category: 'streak',
    badgeColor: 'from-amber-400 to-orange-600',
    xpReward: 75,
    condition: (stats) => (stats.streak || 0) >= 3,
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day uninterrupted streak',
    drawable: 'zap',
    category: 'streak',
    badgeColor: 'from-yellow-400 to-amber-500',
    xpReward: 150,
    condition: (stats) => (stats.streak || 0) >= 7,
  },
  {
    id: 'streak_14',
    title: 'Two-Week Triumph',
    description: 'Maintain a 14-day dedicated streak',
    drawable: 'rocket',
    category: 'streak',
    badgeColor: 'from-orange-500 to-rose-600',
    xpReward: 300,
    condition: (stats) => (stats.streak || 0) >= 14,
  },
  {
    id: 'streak_30',
    title: 'Iron Discipline',
    description: 'Achieve a 30-day streak of unstoppable dedication',
    drawable: 'sparkles',
    category: 'streak',
    badgeColor: 'from-purple-500 via-pink-500 to-amber-400',
    xpReward: 600,
    condition: (stats) => (stats.streak || 0) >= 30,
  },

  // 4. Memory Palace & Spaced Repetition
  {
    id: 'revision_starter',
    title: 'Active Recall',
    description: 'Complete 3 spaced-repetition revisions',
    drawable: 'history',
    category: 'revision',
    badgeColor: 'from-teal-400 to-emerald-600',
    xpReward: 80,
    condition: (stats) => (stats.revisionsCompleted || 0) >= 3,
  },
  {
    id: 'revision_master',
    title: 'Memory Palace',
    description: 'Complete 10 spaced-repetition revisions',
    drawable: 'brain',
    category: 'revision',
    badgeColor: 'from-purple-400 to-pink-600',
    xpReward: 160,
    condition: (stats) => (stats.revisionsCompleted || 0) >= 10,
  },
  {
    id: 'revision_guru',
    title: 'Retention Guru',
    description: 'Complete 25 spaced-repetition revisions',
    drawable: 'milestone',
    category: 'revision',
    badgeColor: 'from-indigo-400 to-purple-700',
    xpReward: 350,
    condition: (stats) => (stats.revisionsCompleted || 0) >= 25,
  },

  // 5. Daily Tasks & Habit Mastery
  {
    id: 'task_starter',
    title: 'Action Taker',
    description: 'Complete 5 daily tasks and habits',
    drawable: 'checkCircle',
    category: 'tasks',
    badgeColor: 'from-emerald-400 to-green-600',
    xpReward: 60,
    condition: (stats) => (stats.tasksCompletedCount || 0) >= 5,
  },
  {
    id: 'task_slayer',
    title: 'Productivity Beast',
    description: 'Complete 25 daily tasks on your roadmap',
    drawable: 'target',
    category: 'tasks',
    badgeColor: 'from-cyan-400 to-teal-500',
    xpReward: 150,
    condition: (stats) => (stats.tasksCompletedCount || 0) >= 25,
  },
  {
    id: 'task_centurion',
    title: 'Century of Focus',
    description: 'Complete 50 daily tasks and assignments',
    drawable: 'medal',
    category: 'tasks',
    badgeColor: 'from-amber-400 to-yellow-600',
    xpReward: 300,
    condition: (stats) => (stats.tasksCompletedCount || 0) >= 50,
  },

  // 6. Experience & Level Milestones
  {
    id: 'xp_500',
    title: 'Rising Star',
    description: 'Earn 500 total XP through consistent work',
    drawable: 'star',
    category: 'xp',
    badgeColor: 'from-blue-400 to-indigo-500',
    xpReward: 100,
    condition: (stats) => (stats.xp || 0) >= 500,
  },
  {
    id: 'xp_1500',
    title: 'Legend in Training',
    description: 'Earn 1,500 total XP and rise through ranks',
    drawable: 'trophy',
    category: 'xp',
    badgeColor: 'from-amber-300 via-yellow-400 to-amber-600',
    xpReward: 250,
    condition: (stats) => (stats.xp || 0) >= 1500,
  },
  {
    id: 'xp_3000',
    title: 'Elite Achiever',
    description: 'Earn 3,000 total XP to join the top echelon',
    drawable: 'crown',
    category: 'xp',
    badgeColor: 'from-fuchsia-500 via-purple-600 to-cyan-400',
    xpReward: 500,
    condition: (stats) => (stats.xp || 0) >= 3000,
  },
];
