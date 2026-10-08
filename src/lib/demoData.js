import { format, subDays } from 'date-fns';

const todayStr = format(new Date(), 'yyyy-MM-dd');
const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
const minus2Str = format(subDays(new Date(), 2), 'yyyy-MM-dd');
const minus3Str = format(subDays(new Date(), 3), 'yyyy-MM-dd');

export const INITIAL_PROBLEMS = [
  {
    id: 'prob-1',
    title: 'Two Sum',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/two-sum/',
    difficulty: 'Easy',
    topics: ['Array', 'Hash Table'],
    status: 'solved',
    notes: 'Used a HashMap to store value-to-index mappings for O(N) time and O(N) space complexity.',
    solvedAt: minus3Str,
    revisionDate: todayStr, // Due today!
    revisionCount: 1,
    timeSpentMin: 15,
  },
  {
    id: 'prob-2',
    title: 'LRU Cache',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/lru-cache/',
    difficulty: 'Medium',
    topics: ['Hash Table', 'Linked List', 'Design'],
    status: 'solved',
    notes: 'Doubly Linked List + HashMap. Dummy head & tail nodes prevent edge cases when removing node.',
    solvedAt: minus2Str,
    revisionDate: format(subDays(new Date(), -2), 'yyyy-MM-dd'),
    revisionCount: 0,
    timeSpentMin: 35,
  },
  {
    id: 'prob-3',
    title: 'Trapping Rain Water',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/trapping-rain-water/',
    difficulty: 'Hard',
    topics: ['Array', 'Two Pointers', 'Stack'],
    status: 'solved',
    notes: 'Two pointer approach maintaining maxLeft and maxRight. Time: O(N), Space: O(1).',
    solvedAt: yesterdayStr,
    revisionDate: todayStr, // Due today!
    revisionCount: 0,
    timeSpentMin: 45,
  },
  {
    id: 'prob-4',
    title: 'Coin Change',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/coin-change/',
    difficulty: 'Medium',
    topics: ['Dynamic Programming', 'BFS'],
    status: 'attempted',
    notes: 'Bottom-up DP table dp[i] = min coins for amount i. Need to optimize space.',
    solvedAt: null,
    revisionDate: null,
    revisionCount: 0,
    timeSpentMin: 25,
  },
  {
    id: 'prob-5',
    title: 'Course Schedule II',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/course-schedule-ii/',
    difficulty: 'Medium',
    topics: ['Graph', 'Topological Sort', 'BFS'],
    status: 'todo',
    notes: 'Kahn\'s algorithm for in-degree topological ordering.',
    solvedAt: null,
    revisionDate: null,
    revisionCount: 0,
    timeSpentMin: 0,
  },
];

export const INITIAL_TASKS = [
  {
    id: 'task-1',
    title: 'Complete 2 LeetCode Medium DP problems',
    category: 'DSA',
    priority: 'High',
    dueDate: todayStr,
    status: 'pending',
    recurring: 'daily',
  },
  {
    id: 'task-2',
    title: 'Review System Design: Consistent Hashing',
    category: 'System Design',
    priority: 'Medium',
    dueDate: todayStr,
    status: 'pending',
    recurring: 'none',
  },
  {
    id: 'task-3',
    title: 'Read 30 mins of Clean Code',
    category: 'Reading',
    priority: 'Low',
    dueDate: todayStr,
    status: 'done',
    completedAt: todayStr,
    recurring: 'daily',
  },
  {
    id: 'task-4',
    title: '30 min workout / cardio',
    category: 'Fitness',
    priority: 'Medium',
    dueDate: todayStr,
    status: 'done',
    completedAt: todayStr,
    recurring: 'daily',
  },
];

export function generateInitialDailyLogs() {
  const logs = {};
  for (let i = 0; i < 90; i++) {
    const dateStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
    // Generate realistic heat activity for history
    const isRandomActive = Math.random() > 0.35;
    if (isRandomActive || i === 0 || i === 1 || i === 2 || i === 3) {
      logs[dateStr] = {
        problemsSolved: Math.floor(Math.random() * 4) + (i < 5 ? 1 : 0),
        tasksCompleted: Math.floor(Math.random() * 5) + 1,
        xpEarned: Math.floor(Math.random() * 80) + 30,
        activeDay: true,
      };
    }
  }
  return logs;
}
