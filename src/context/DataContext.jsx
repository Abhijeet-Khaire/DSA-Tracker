import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { INITIAL_PROBLEMS, INITIAL_TASKS, generateInitialDailyLogs } from '../lib/demoData';
import { XP_REWARDS, calculateLevel, ACHIEVEMENTS } from '../lib/xpEngine';
import { getNextRevisionDate } from '../lib/revisionEngine';
import { format } from 'date-fns';

const DataContext = createContext();

// Storage key helper strictly isolated by user ID
const getStorageKey = (uid, isDemo, key) => {
  if (isDemo || !uid || uid === 'demo_user_123') {
    return `grindtrack_demo_${key}`;
  }
  return `grindtrack_user_${uid}_${key}`;
};

export function DataProvider({ children }) {
  const { currentUser, isDemoMode } = useAuth();
  const currentUid = currentUser?.uid;

  // Initial local state loader scoped to the active user
  const loadScopedStorage = (key, fallback) => {
    const storageKey = getStorageKey(currentUid, isDemoMode, key);
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse local storage key', storageKey, e);
      }
    }
    return fallback;
  };

  const [problems, setProblems] = useState(() => 
    loadScopedStorage('problems', isDemoMode ? INITIAL_PROBLEMS : [])
  );
  const [tasks, setTasks] = useState(() => 
    loadScopedStorage('tasks', isDemoMode ? INITIAL_TASKS : [])
  );
  const [dailyLogs, setDailyLogs] = useState(() => 
    loadScopedStorage('daily_logs', isDemoMode ? generateInitialDailyLogs() : {})
  );
  const [xp, setXp] = useState(() => 
    loadScopedStorage('xp', isDemoMode ? 420 : 0)
  );
  const [unlockedAchievements, setUnlockedAchievements] = useState(() => 
    loadScopedStorage('achievements', isDemoMode ? ['first_solve', 'streak_3'] : [])
  );

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [newlyUnlocked, setNewlyUnlocked] = useState(null);
  const [activeXpReward, setActiveXpReward] = useState(null);
  const xpTimerRef = useRef(null);

  // Sync state when active user or demo mode changes
  useEffect(() => {
    if (isDemoMode || !currentUid) {
      // Demo Mode: Load demo state isolated to demo keys
      const savedProbs = localStorage.getItem('grindtrack_demo_problems');
      setProblems(savedProbs ? JSON.parse(savedProbs) : INITIAL_PROBLEMS);

      const savedTasks = localStorage.getItem('grindtrack_demo_tasks');
      setTasks(savedTasks ? JSON.parse(savedTasks) : INITIAL_TASKS);

      const savedLogs = localStorage.getItem('grindtrack_demo_daily_logs');
      setDailyLogs(savedLogs ? JSON.parse(savedLogs) : generateInitialDailyLogs());

      const savedXp = localStorage.getItem('grindtrack_demo_xp');
      setXp(savedXp ? parseInt(savedXp, 10) : 420);

      const savedAch = localStorage.getItem('grindtrack_demo_achievements');
      setUnlockedAchievements(savedAch ? JSON.parse(savedAch) : ['first_solve', 'streak_3']);
      setIsLoadingData(false);
      return;
    }

    // Authenticated User: Load user-scoped cached storage first to prevent flash of wrong data
    setIsLoadingData(true);
    const userProbsKey = getStorageKey(currentUid, false, 'problems');
    const userTasksKey = getStorageKey(currentUid, false, 'tasks');
    const userLogsKey = getStorageKey(currentUid, false, 'daily_logs');
    const userXpKey = getStorageKey(currentUid, false, 'xp');
    const userAchKey = getStorageKey(currentUid, false, 'achievements');

    const cachedProbs = localStorage.getItem(userProbsKey);
    setProblems(cachedProbs ? JSON.parse(cachedProbs) : []);

    const cachedTasks = localStorage.getItem(userTasksKey);
    setTasks(cachedTasks ? JSON.parse(cachedTasks) : []);

    const cachedLogs = localStorage.getItem(userLogsKey);
    setDailyLogs(cachedLogs ? JSON.parse(cachedLogs) : {});

    const cachedXp = localStorage.getItem(userXpKey);
    setXp(cachedXp ? parseInt(cachedXp, 10) : 0);

    const cachedAch = localStorage.getItem(userAchKey);
    setUnlockedAchievements(cachedAch ? JSON.parse(cachedAch) : []);

    // Setup Realtime Firestore Listeners for this specific user
    const userDocRef = doc(db, 'users', currentUid);

    // 1. User Profile Document Sync (XP, Achievements, Daily Logs, Profile)
    const userDocUnsub = onSnapshot(userDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.xp !== undefined) {
          setXp(data.xp);
          localStorage.setItem(userXpKey, String(data.xp));
        }
        if (data.unlockedAchievements !== undefined) {
          setUnlockedAchievements(data.unlockedAchievements);
          localStorage.setItem(userAchKey, JSON.stringify(data.unlockedAchievements));
        }
        if (data.dailyLogs !== undefined) {
          setDailyLogs(data.dailyLogs);
          localStorage.setItem(userLogsKey, JSON.stringify(data.dailyLogs));
        }
      } else {
        // Initialize brand new user record in Firestore
        const initialUserData = {
          email: currentUser.email || '',
          displayName: currentUser.displayName || '',
          photoURL: currentUser.photoURL || '',
          xp: 0,
          unlockedAchievements: [],
          dailyLogs: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        try {
          await setDoc(userDocRef, initialUserData);
        } catch (err) {
          console.error('Error creating user profile in Firestore:', err);
        }
      }
      setIsLoadingData(false);
    }, (err) => {
      console.error('Firestore user profile snapshot error:', err);
      setIsLoadingData(false);
    });

    // 2. User Problems Subcollection Sync (/users/{uid}/problems)
    const probCollectionRef = collection(userDocRef, 'problems');
    const probUnsub = onSnapshot(probCollectionRef, (snap) => {
      const list = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      setProblems(list);
      localStorage.setItem(userProbsKey, JSON.stringify(list));
    }, (err) => {
      console.error('Firestore problems snapshot error:', err);
    });

    // 3. User Tasks Subcollection Sync (/users/{uid}/tasks)
    const taskCollectionRef = collection(userDocRef, 'tasks');
    const taskUnsub = onSnapshot(taskCollectionRef, (snap) => {
      const list = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      setTasks(list);
      localStorage.setItem(userTasksKey, JSON.stringify(list));
    }, (err) => {
      console.error('Firestore tasks snapshot error:', err);
    });

    // Cleanup listeners when switching accounts or logging out
    return () => {
      userDocUnsub();
      probUnsub();
      taskUnsub();
    };
  }, [currentUid, isDemoMode]);

  // Local caching when in Demo Mode
  useEffect(() => {
    if (isDemoMode) {
      localStorage.setItem('grindtrack_demo_problems', JSON.stringify(problems));
      localStorage.setItem('grindtrack_demo_tasks', JSON.stringify(tasks));
      localStorage.setItem('grindtrack_demo_daily_logs', JSON.stringify(dailyLogs));
      localStorage.setItem('grindtrack_demo_xp', xp.toString());
      localStorage.setItem('grindtrack_demo_achievements', JSON.stringify(unlockedAchievements));
    }
  }, [problems, tasks, dailyLogs, xp, unlockedAchievements, isDemoMode]);

  // Check achievements unlock
  const checkAchievements = async (currentProblems, currentTasks, currentStreak) => {
    const solvedCount = currentProblems.filter(p => p.status === 'solved').length;
    const hardSolvedCount = currentProblems.filter(p => p.status === 'solved' && p.difficulty === 'Hard').length;
    const revisionsCompleted = currentProblems.reduce((acc, p) => acc + (p.revisionCount || 0), 0);
    const tasksCompletedCount = currentTasks.filter(t => t.status === 'done').length;

    const stats = {
      solvedCount,
      hardSolvedCount,
      revisionsCompleted,
      tasksCompletedCount,
      streak: currentStreak,
    };

    let updatedAchievements = [...unlockedAchievements];
    let newlyEarned = null;

    ACHIEVEMENTS.forEach((ach) => {
      if (!updatedAchievements.includes(ach.id) && ach.condition(stats)) {
        updatedAchievements.push(ach.id);
        newlyEarned = ach;
      }
    });

    if (newlyEarned) {
      setUnlockedAchievements(updatedAchievements);
      addXp(newlyEarned.xpReward, `Achievement: ${newlyEarned.title}`);
      setNewlyUnlocked(newlyEarned);

      if (currentUser && !isDemoMode) {
        try {
          await setDoc(doc(db, 'users', currentUser.uid), {
            unlockedAchievements: updatedAchievements,
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        } catch (err) {
          console.error('Error updating achievements in Firestore:', err);
        }
      }
    }
  };

  // Helper for adding XP with rapid-reward grouping and Firestore persistence
  const addXp = async (amount, reason = '') => {
    const nextXp = xp + amount;
    setXp(nextXp);

    if (xpTimerRef.current) clearTimeout(xpTimerRef.current);

    setActiveXpReward((prev) => {
      if (prev) {
        return {
          id: Date.now(),
          amount: prev.amount + amount,
          reason: reason || prev.reason || 'Bonus Rewards',
        };
      }
      return {
        id: Date.now(),
        amount,
        reason: reason || 'Activity Milestone',
      };
    });

    xpTimerRef.current = setTimeout(() => {
      setActiveXpReward(null);
    }, 2400);

    if (currentUser && !isDemoMode) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), {
          xp: nextXp,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (err) {
        console.error('Error updating XP in Firestore:', err);
      }
    }
  };

  // Log today's activity with Firestore persistence
  const recordDailyActivity = async (type, amount = 1, xpEarned = 0) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const current = dailyLogs[today] || { problemsSolved: 0, tasksCompleted: 0, xpEarned: 0, activeDay: true };
    const nextLogs = {
      ...dailyLogs,
      [today]: {
        ...current,
        problemsSolved: type === 'problem' ? current.problemsSolved + amount : current.problemsSolved,
        tasksCompleted: type === 'task' ? current.tasksCompleted + amount : current.tasksCompleted,
        xpEarned: current.xpEarned + xpEarned,
        activeDay: true,
      }
    };

    setDailyLogs(nextLogs);

    if (currentUser && !isDemoMode) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), {
          dailyLogs: nextLogs,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (err) {
        console.error('Error saving dailyLogs to Firestore:', err);
      }
    }
  };

  // Problem actions (stored under /users/{uid}/problems/{probId})
  const addProblem = async (probData) => {
    const newProb = {
      id: `prob-${Date.now()}`,
      ...probData,
      status: probData.status || 'todo',
      revisionCount: 0,
      solvedAt: probData.status === 'solved' ? format(new Date(), 'yyyy-MM-dd') : null,
      revisionDate: probData.status === 'solved' ? getNextRevisionDate(new Date(), 0) : null,
      createdAt: new Date().toISOString(),
    };

    setProblems((prev) => [newProb, ...prev]);

    if (newProb.status === 'solved') {
      const reward = newProb.difficulty === 'Easy' ? XP_REWARDS.PROBLEM_EASY : 
                     newProb.difficulty === 'Medium' ? XP_REWARDS.PROBLEM_MEDIUM : XP_REWARDS.PROBLEM_HARD;
      addXp(reward, `${newProb.difficulty} Problem Solved`);
      recordDailyActivity('problem', 1, reward);
    }

    if (currentUser && !isDemoMode) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid, 'problems', newProb.id), newProb);
      } catch (err) {
        console.error('Error saving problem to Firestore:', err);
      }
    }

    checkAchievements([newProb, ...problems], tasks, calculateStreak());
  };

  const updateProblem = async (id, updates) => {
    let xpReward = 0;
    let updatedProblem = null;

    setProblems((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const wasSolved = p.status === 'solved';
          const isNowSolved = updates.status === 'solved';

          let solvedAt = p.solvedAt;
          let revisionDate = p.revisionDate;
          let revisionCount = p.revisionCount || 0;

          if (!wasSolved && isNowSolved) {
            solvedAt = format(new Date(), 'yyyy-MM-dd');
            revisionCount = 0;
            revisionDate = getNextRevisionDate(new Date(), 0);
            xpReward = p.difficulty === 'Easy' ? XP_REWARDS.PROBLEM_EASY : 
                       p.difficulty === 'Medium' ? XP_REWARDS.PROBLEM_MEDIUM : XP_REWARDS.PROBLEM_HARD;
          }

          updatedProblem = { ...p, ...updates, solvedAt, revisionDate, revisionCount, updatedAt: new Date().toISOString() };
          return updatedProblem;
        }
        return p;
      })
    );

    if (xpReward > 0) {
      addXp(xpReward, 'Problem Status Solved');
      recordDailyActivity('problem', 1, xpReward);
    }

    if (currentUser && !isDemoMode && updatedProblem) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid, 'problems', id), {
          ...updates,
          solvedAt: updatedProblem.solvedAt,
          revisionDate: updatedProblem.revisionDate,
          revisionCount: updatedProblem.revisionCount,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Error updating problem in Firestore:', err);
      }
    }
  };

  const deleteProblem = async (id) => {
    setProblems((prev) => prev.filter((p) => p.id !== id));
    if (currentUser && !isDemoMode) {
      try {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'problems', id));
      } catch (err) {
        console.error('Error deleting problem from Firestore:', err);
      }
    }
  };

  const completeRevision = async (id) => {
    let updatedDate = null;
    let nextCount = 0;

    setProblems((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          nextCount = (p.revisionCount || 0) + 1;
          updatedDate = getNextRevisionDate(new Date(), nextCount);
          return {
            ...p,
            revisionCount: nextCount,
            revisionDate: updatedDate,
          };
        }
        return p;
      })
    );

    addXp(XP_REWARDS.PROBLEM_REVISION, 'Spaced Revision Completed');
    recordDailyActivity('problem', 0, XP_REWARDS.PROBLEM_REVISION);

    if (currentUser && !isDemoMode) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid, 'problems', id), {
          revisionCount: nextCount,
          revisionDate: updatedDate,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Error updating revision in Firestore:', err);
      }
    }
  };

  // Task actions (stored under /users/{uid}/tasks/{taskId})
  const addTask = async (taskData) => {
    const newTask = {
      id: `task-${Date.now()}`,
      ...taskData,
      status: 'pending',
      createdAt: format(new Date(), 'yyyy-MM-dd'),
    };

    setTasks((prev) => [newTask, ...prev]);

    if (currentUser && !isDemoMode) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid, 'tasks', newTask.id), newTask);
      } catch (err) {
        console.error('Error adding task to Firestore:', err);
      }
    }
  };

  const toggleTask = async (id) => {
    let xpEarned = 0;
    let updatedTask = null;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus = t.status === 'done' ? 'pending' : 'done';
          if (nextStatus === 'done') xpEarned = XP_REWARDS.TASK_COMPLETE;
          updatedTask = {
            ...t,
            status: nextStatus,
            completedAt: nextStatus === 'done' ? format(new Date(), 'yyyy-MM-dd') : null,
          };
          return updatedTask;
        }
        return t;
      })
    );

    if (xpEarned > 0) {
      addXp(xpEarned, 'Daily Task Completed');
      recordDailyActivity('task', 1, xpEarned);
    }

    if (currentUser && !isDemoMode && updatedTask) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid, 'tasks', id), {
          status: updatedTask.status,
          completedAt: updatedTask.completedAt,
        });
      } catch (err) {
        console.error('Error toggling task in Firestore:', err);
      }
    }
  };

  const deleteTask = async (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (currentUser && !isDemoMode) {
      try {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'tasks', id));
      } catch (err) {
        console.error('Error deleting task from Firestore:', err);
      }
    }
  };

  // Load curated starter pack into user's account
  const loadStarterData = async () => {
    if (currentUser && !isDemoMode) {
      for (const prob of INITIAL_PROBLEMS) {
        await setDoc(doc(db, 'users', currentUser.uid, 'problems', prob.id), prob);
      }
      for (const task of INITIAL_TASKS) {
        await setDoc(doc(db, 'users', currentUser.uid, 'tasks', task.id), task);
      }
      const initialLogs = generateInitialDailyLogs();
      await setDoc(doc(db, 'users', currentUser.uid), {
        dailyLogs: initialLogs,
        xp: 420,
        unlockedAchievements: ['first_solve', 'streak_3'],
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } else {
      setProblems(INITIAL_PROBLEMS);
      setTasks(INITIAL_TASKS);
      setDailyLogs(generateInitialDailyLogs());
      setXp(420);
      setUnlockedAchievements(['first_solve', 'streak_3']);
    }
  };

  // Clear/Reset all data for current user
  const clearUserData = async () => {
    if (currentUser && !isDemoMode) {
      for (const p of problems) {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'problems', p.id));
      }
      for (const t of tasks) {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'tasks', t.id));
      }
      await setDoc(doc(db, 'users', currentUser.uid), {
        xp: 0,
        unlockedAchievements: [],
        dailyLogs: {},
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } else {
      setProblems([]);
      setTasks([]);
      setDailyLogs({});
      setXp(0);
      setUnlockedAchievements([]);
    }
  };

  // Calculate streak from daily logs
  const calculateStreak = () => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const log = dailyLogs[dateStr];

      if (log && log.activeDay && (log.problemsSolved > 0 || log.tasksCompleted > 0)) {
        streak++;
      } else if (i === 0) {
        // Today might not have activity yet, keep checking from yesterday
        continue;
      } else {
        break;
      }
    }
    return streak;
  };

  const levelInfo = calculateLevel(xp);

  const value = {
    problems,
    tasks,
    dailyLogs,
    xp,
    levelInfo,
    unlockedAchievements,
    newlyUnlocked,
    setNewlyUnlocked,
    activeXpReward,
    isLoadingData,
    dismissXpReward: () => setActiveXpReward(null),
    addXp,
    addProblem,
    updateProblem,
    deleteProblem,
    completeRevision,
    addTask,
    toggleTask,
    deleteTask,
    calculateStreak,
    loadStarterData,
    clearUserData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}
