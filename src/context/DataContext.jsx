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
  const [roadmapProgress, setRoadmapProgress] = useState(() => 
    loadScopedStorage('roadmap_progress', isDemoMode ? { 'aws-devops-30': ['day-1', 'day-2', 'day-3'] } : {})
  );
  const [userProfile, setUserProfile] = useState(() => 
    loadScopedStorage('user_profile', {
      bio: 'Data Structures & Algorithms Enthusiast',
      targetRole: 'Software Engineer',
      leetcodeUsername: '',
      githubUsername: '',
    })
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

      const savedRoadmap = localStorage.getItem('grindtrack_demo_roadmap_progress');
      setRoadmapProgress(savedRoadmap ? JSON.parse(savedRoadmap) : { 'aws-devops-30': ['day-1', 'day-2', 'day-3'] });

      const savedProfile = localStorage.getItem('grindtrack_demo_user_profile');
      setUserProfile(savedProfile ? JSON.parse(savedProfile) : {
        bio: 'Data Structures & Algorithms Enthusiast',
        targetRole: 'Software Engineer',
        leetcodeUsername: '',
        githubUsername: '',
      });

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
    const userRoadmapKey = getStorageKey(currentUid, false, 'roadmap_progress');
    const userProfileKey = getStorageKey(currentUid, false, 'user_profile');

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

    const cachedRoadmap = localStorage.getItem(userRoadmapKey);
    setRoadmapProgress(cachedRoadmap ? JSON.parse(cachedRoadmap) : {});

    const cachedProfile = localStorage.getItem(userProfileKey);
    setUserProfile(cachedProfile ? JSON.parse(cachedProfile) : {
      bio: 'Data Structures & Algorithms Enthusiast',
      targetRole: 'Software Engineer',
      leetcodeUsername: '',
      githubUsername: '',
    });

    // Setup Realtime Firestore Listeners for this specific user
    const userDocRef = doc(db, 'users', currentUid);

    // 1. User Profile Document Sync (XP, Achievements, Daily Logs, Profile, Roadmap Progress, Problems, Tasks)
    const userDocUnsub = onSnapshot(userDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        // Extract from data.userInfo or direct fields
        const userXp = data.userInfo?.xp !== undefined ? data.userInfo.xp : data.xp;
        if (userXp !== undefined) {
          setXp(userXp);
          localStorage.setItem(userXpKey, String(userXp));
        }

        const userBadges = data.userInfo?.badges || data.badges || data.unlockedAchievements;
        if (userBadges !== undefined) {
          setUnlockedAchievements(userBadges);
          localStorage.setItem(userAchKey, JSON.stringify(userBadges));
        }

        const userRoadmap = data.userInfo?.roadmap || data.roadmap || data.roadmapProgress;
        if (userRoadmap !== undefined) {
          setRoadmapProgress(userRoadmap);
          localStorage.setItem(userRoadmapKey, JSON.stringify(userRoadmap));
        }

        const userProf = data.userInfo?.profile || data.profile;
        if (userProf !== undefined) {
          setUserProfile(userProf);
          localStorage.setItem(userProfileKey, JSON.stringify(userProf));
        }

        if (data.dailyLogs !== undefined) {
          setDailyLogs(data.dailyLogs);
          localStorage.setItem(userLogsKey, JSON.stringify(data.dailyLogs));
        }

        // If direct arrays exist on document, sync them if local state is empty
        if (Array.isArray(data.problems) && data.problems.length > 0) {
          setProblems((prev) => (prev.length === 0 ? data.problems : prev));
          localStorage.setItem(userProbsKey, JSON.stringify(data.problems));
        }

        if (Array.isArray(data.tasks) && data.tasks.length > 0) {
          setTasks((prev) => (prev.length === 0 ? data.tasks : prev));
          localStorage.setItem(userTasksKey, JSON.stringify(data.tasks));
        }
      } else {
        // Initialize brand new user record in Firestore
        const defaultProf = {
          bio: 'Data Structures & Algorithms Enthusiast',
          targetRole: 'Software Engineer',
          leetcodeUsername: '',
          githubUsername: '',
        };
        const initialUserData = {
          email: currentUser.email || '',
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Member',
          photoURL: currentUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          userInfo: {
            profile: defaultProf,
            xp: 0,
            streak: 0,
            badges: [],
            roadmap: {},
          },
          problems: [],
          tasks: [],
          profile: defaultProf,
          xp: 0,
          streak: 0,
          badges: [],
          unlockedAchievements: [],
          roadmap: {},
          roadmapProgress: {},
          dailyLogs: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        try {
          await setDoc(userDocRef, initialUserData, { merge: true });
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
      localStorage.setItem('grindtrack_demo_roadmap_progress', JSON.stringify(roadmapProgress));
      localStorage.setItem('grindtrack_demo_user_profile', JSON.stringify(userProfile));
    }
  }, [problems, tasks, dailyLogs, xp, unlockedAchievements, roadmapProgress, userProfile, isDemoMode]);

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

  // Central helper to persist the complete user document hierarchy in Firestore:
  // users > {uid} > userInfo(profile, xp, streak, badges, roadmap) > problems & tasks
  const syncUserToFirestore = async (overrides = {}) => {
    if (!currentUser || isDemoMode) return;

    const currentStreak = calculateStreak();
    const finalProfile = overrides.userProfile !== undefined ? overrides.userProfile : userProfile;
    const finalXp = overrides.xp !== undefined ? overrides.xp : xp;
    const finalStreak = overrides.streak !== undefined ? overrides.streak : currentStreak;
    const finalBadges = overrides.unlockedAchievements !== undefined ? overrides.unlockedAchievements : (Array.isArray(overrides.badges) ? overrides.badges : unlockedAchievements);
    const finalRoadmap = overrides.roadmapProgress !== undefined ? overrides.roadmapProgress : (overrides.roadmap !== undefined ? overrides.roadmap : roadmapProgress);
    const finalProblems = overrides.problems !== undefined ? overrides.problems : problems;
    const finalTasks = overrides.tasks !== undefined ? overrides.tasks : tasks;
    const finalDailyLogs = overrides.dailyLogs !== undefined ? overrides.dailyLogs : dailyLogs;

    const fullPayload = {
      uid: currentUser.uid,
      email: currentUser.email || '',
      displayName: currentUser.displayName || finalProfile?.displayName || 'Member',
      photoURL: currentUser.photoURL || '',

      // 1. users > user info(profile, xp, streak, badges, roadmap)
      userInfo: {
        profile: finalProfile,
        xp: finalXp,
        streak: finalStreak,
        badges: finalBadges,
        roadmap: finalRoadmap,
      },

      // 2. problems and tasks all information directly visible in database
      problems: finalProblems,
      tasks: finalTasks,

      // 3. Direct top-level fields for maximum visibility in Firestore console
      profile: finalProfile,
      xp: finalXp,
      streak: finalStreak,
      badges: finalBadges,
      unlockedAchievements: finalBadges,
      roadmap: finalRoadmap,
      roadmapProgress: finalRoadmap,
      dailyLogs: finalDailyLogs,

      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', currentUser.uid), fullPayload, { merge: true });
    } catch (err) {
      console.error('Error syncing complete user record to Firestore:', err);
    }
  };

  // Automatic initial backfill and sync to Firestore when authenticated
  useEffect(() => {
    if (currentUser && !isDemoMode && !isLoadingData) {
      syncUserToFirestore();
    }
  }, [currentUser, isDemoMode, isLoadingData]);

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
      syncUserToFirestore({ unlockedAchievements: updatedAchievements });
    }
  };

  // Helper for adding XP with rapid-reward grouping and Firestore persistence
  const addXp = async (amount, reason = '') => {
    const nextXp = Math.max(0, xp + amount);
    setXp(nextXp);

    if (amount > 0) {
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
    }

    if (currentUser && !isDemoMode) {
      syncUserToFirestore({ xp: nextXp });
    }
  };

  // Log today's activity with Firestore persistence (supports both increment and decrement)
  const recordDailyActivity = async (type, amount = 1, xpEarned = 0, specificDate = null) => {
    const targetDate = specificDate || format(new Date(), 'yyyy-MM-dd');
    const current = dailyLogs[targetDate] || { problemsSolved: 0, tasksCompleted: 0, xpEarned: 0, activeDay: false };
    
    const nextProblemsSolved = Math.max(0, (current.problemsSolved || 0) + (type === 'problem' ? amount : 0));
    const nextTasksCompleted = Math.max(0, (current.tasksCompleted || 0) + (type === 'task' ? amount : 0));
    const nextXpEarned = Math.max(0, (current.xpEarned || 0) + xpEarned);
    const isActiveDay = nextProblemsSolved > 0 || nextTasksCompleted > 0;

    const nextLogs = {
      ...dailyLogs,
      [targetDate]: {
        ...current,
        problemsSolved: nextProblemsSolved,
        tasksCompleted: nextTasksCompleted,
        xpEarned: nextXpEarned,
        activeDay: isActiveDay,
      }
    };

    setDailyLogs(nextLogs);

    const userLogsKey = getStorageKey(currentUid, isDemoMode, 'daily_logs');
    localStorage.setItem(userLogsKey, JSON.stringify(nextLogs));

    if (currentUser && !isDemoMode) {
      syncUserToFirestore({ dailyLogs: nextLogs });
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

    let addedXp = 0;
    if (newProb.status === 'solved') {
      addedXp = newProb.difficulty === 'Easy' ? XP_REWARDS.PROBLEM_EASY : 
                newProb.difficulty === 'Medium' ? XP_REWARDS.PROBLEM_MEDIUM : XP_REWARDS.PROBLEM_HARD;
      addXp(addedXp, `${newProb.difficulty} Problem Solved`);
      recordDailyActivity('problem', 1, addedXp);
    }

    if (currentUser && !isDemoMode) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid, 'problems', newProb.id), newProb);
      } catch (err) {
        console.error('Error saving problem to Firestore subcollection:', err);
      }
    }

    syncUserToFirestore({ problems: nextProblems, ...(addedXp > 0 ? { xp: xp + addedXp } : {}) });
    checkAchievements(nextProblems, tasks, calculateStreak());
  };

  const updateProblem = async (id, updates) => {
    let xpReward = 0;
    let updatedProblem = null;
    let nextProblems = [];

    setProblems((prev) => {
      nextProblems = prev.map((p) => {
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
          } else if (wasSolved && !isNowSolved) {
            const deduct = p.difficulty === 'Easy' ? XP_REWARDS.PROBLEM_EASY : 
                           p.difficulty === 'Medium' ? XP_REWARDS.PROBLEM_MEDIUM : XP_REWARDS.PROBLEM_HARD;
            xpReward = -deduct;
            solvedAt = null;
            revisionDate = null;
            revisionCount = 0;
          }

          updatedProblem = { ...p, ...updates, solvedAt, revisionDate, revisionCount, updatedAt: new Date().toISOString() };
          return updatedProblem;
        }
        return p;
      });
      return nextProblems;
    });

    // Update local storage
    const userProbsKey = getStorageKey(currentUid, isDemoMode, 'problems');
    localStorage.setItem(userProbsKey, JSON.stringify(nextProblems));

    if (xpReward > 0) {
      addXp(xpReward, 'Problem Status Solved');
      recordDailyActivity('problem', 1, xpReward);
    } else if (xpReward < 0) {
      addXp(xpReward, 'Problem Status Reverted');
      recordDailyActivity('problem', -1, xpReward);
    }

    if (currentUser && !isDemoMode && updatedProblem) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid, 'problems', id), updatedProblem, { merge: true });
      } catch (err) {
        console.error('Error updating problem in Firestore:', err);
      }
    }

    syncUserToFirestore({ problems: nextProblems, ...(xpReward !== 0 ? { xp: Math.max(0, xp + xpReward) } : {}) });
  };

  const deleteProblem = async (id) => {
    const nextProblems = problems.filter((p) => p.id !== id);
    setProblems(nextProblems);

    const userProbsKey = getStorageKey(currentUid, isDemoMode, 'problems');
    localStorage.setItem(userProbsKey, JSON.stringify(nextProblems));

    if (currentUser && !isDemoMode) {
      try {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'problems', id));
      } catch (err) {
        console.error('Error deleting problem from Firestore:', err);
      }
    }

    syncUserToFirestore({ problems: nextProblems });
  };

  const completeRevision = async (id) => {
    let updatedDate = null;
    let nextCount = 0;
    let nextProblems = [];

    setProblems((prev) => {
      nextProblems = prev.map((p) => {
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
      });
      return nextProblems;
    });

    const userProbsKey = getStorageKey(currentUid, isDemoMode, 'problems');
    localStorage.setItem(userProbsKey, JSON.stringify(nextProblems));

    addXp(XP_REWARDS.PROBLEM_REVISION, 'Spaced Revision Completed');
    recordDailyActivity('problem', 0, XP_REWARDS.PROBLEM_REVISION);

    if (currentUser && !isDemoMode) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid, 'problems', id), {
          revisionCount: nextCount,
          revisionDate: updatedDate,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (err) {
        console.error('Error updating revision in Firestore:', err);
      }
    }

    syncUserToFirestore({ problems: nextProblems, xp: xp + XP_REWARDS.PROBLEM_REVISION });
  };

  // Task actions (stored under /users/{uid}/tasks/{taskId})
  const addTask = async (taskData) => {
    const newTask = {
      id: `task-${Date.now()}`,
      ...taskData,
      status: 'pending',
      createdAt: format(new Date(), 'yyyy-MM-dd'),
    };

    const nextTasks = [newTask, ...tasks];
    setTasks(nextTasks);

    const userTasksKey = getStorageKey(currentUid, isDemoMode, 'tasks');
    localStorage.setItem(userTasksKey, JSON.stringify(nextTasks));

    if (currentUser && !isDemoMode) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid, 'tasks', newTask.id), newTask);
      } catch (err) {
        console.error('Error adding task to Firestore:', err);
      }
    }

    syncUserToFirestore({ tasks: nextTasks });
  };

  const toggleTask = async (id) => {
    let updatedTask = null;
    let wasDone = false;
    let nextTasks = [];

    setTasks((prev) => {
      nextTasks = prev.map((t) => {
        if (t.id === id) {
          wasDone = t.status === 'done';
          const nextStatus = wasDone ? 'pending' : 'done';
          updatedTask = {
            ...t,
            status: nextStatus,
            completedAt: nextStatus === 'done' ? format(new Date(), 'yyyy-MM-dd') : null,
          };
          return updatedTask;
        }
        return t;
      });
      return nextTasks;
    });

    if (!updatedTask) return;

    // Immediately cache updated tasks to localStorage
    const userTasksKey = getStorageKey(currentUid, isDemoMode, 'tasks');
    localStorage.setItem(userTasksKey, JSON.stringify(nextTasks));

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const completionDate = (wasDone && updatedTask.completedAt) ? updatedTask.completedAt : todayStr;

    if (!wasDone) {
      // Task was marked COMPLETED -> add XP and record daily activity
      addXp(XP_REWARDS.TASK_COMPLETE, 'Daily Task Completed');
      recordDailyActivity('task', 1, XP_REWARDS.TASK_COMPLETE, todayStr);
    } else {
      // Task was UNCHECKED -> subtract XP and decrement daily activity
      addXp(-XP_REWARDS.TASK_COMPLETE, 'Task Unchecked');
      recordDailyActivity('task', -1, -XP_REWARDS.TASK_COMPLETE, completionDate);
    }

    if (currentUser && !isDemoMode) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid, 'tasks', id), updatedTask, { merge: true });
      } catch (err) {
        console.error('Error toggling task in Firestore:', err);
      }
    }

    const currentStreak = calculateStreak();
    checkAchievements(problems, nextTasks, currentStreak);
    syncUserToFirestore({
      tasks: nextTasks,
      streak: currentStreak,
      xp: Math.max(0, xp + (!wasDone ? XP_REWARDS.TASK_COMPLETE : -XP_REWARDS.TASK_COMPLETE)),
    });
  };

  const deleteTask = async (id) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    const nextTasks = tasks.filter((t) => t.id !== id);
    setTasks(nextTasks);

    const userTasksKey = getStorageKey(currentUid, isDemoMode, 'tasks');
    localStorage.setItem(userTasksKey, JSON.stringify(nextTasks));

    // If deleting a completed task, revert its daily activity and XP
    if (taskToDelete && taskToDelete.status === 'done') {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const targetDate = taskToDelete.completedAt || todayStr;
      addXp(-XP_REWARDS.TASK_COMPLETE, 'Task Deleted');
      recordDailyActivity('task', -1, -XP_REWARDS.TASK_COMPLETE, targetDate);
    }

    if (currentUser && !isDemoMode) {
      try {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'tasks', id));
      } catch (err) {
        console.error('Error deleting task from Firestore:', err);
      }
    }

    syncUserToFirestore({
      tasks: nextTasks,
      ...(taskToDelete && taskToDelete.status === 'done' ? { xp: Math.max(0, xp - XP_REWARDS.TASK_COMPLETE) } : {})
    });
  };

  // Load curated starter pack into user's account
  const loadStarterData = async () => {
    const initialLogs = generateInitialDailyLogs();
    setProblems(INITIAL_PROBLEMS);
    setTasks(INITIAL_TASKS);
    setDailyLogs(initialLogs);
    setXp(420);
    setUnlockedAchievements(['first_solve', 'streak_3']);

    if (currentUser && !isDemoMode) {
      for (const prob of INITIAL_PROBLEMS) {
        await setDoc(doc(db, 'users', currentUser.uid, 'problems', prob.id), prob);
      }
      for (const task of INITIAL_TASKS) {
        await setDoc(doc(db, 'users', currentUser.uid, 'tasks', task.id), task);
      }
      syncUserToFirestore({
        problems: INITIAL_PROBLEMS,
        tasks: INITIAL_TASKS,
        dailyLogs: initialLogs,
        xp: 420,
        unlockedAchievements: ['first_solve', 'streak_3'],
      });
    }
  };

  // Clear/Reset all data for current user
  const clearUserData = async () => {
    const prevProblems = [...problems];
    const prevTasks = [...tasks];

    setProblems([]);
    setTasks([]);
    setDailyLogs({});
    setXp(0);
    setUnlockedAchievements([]);

    if (currentUser && !isDemoMode) {
      for (const p of prevProblems) {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'problems', p.id));
      }
      for (const t of prevTasks) {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'tasks', t.id));
      }
      syncUserToFirestore({
        problems: [],
        tasks: [],
        dailyLogs: {},
        xp: 0,
        unlockedAchievements: [],
        streak: 0,
      });
    }
  };

  // Import / Restore user data from JSON backup
  const importUserData = async (backupData) => {
    if (!backupData || typeof backupData !== 'object') {
      throw new Error('Invalid backup file format');
    }

    const newProblems = Array.isArray(backupData.problems) ? backupData.problems : [];
    const newTasks = Array.isArray(backupData.tasks) ? backupData.tasks : [];
    const newXp = typeof backupData.xp === 'number' ? backupData.xp : 0;
    const newLogs = backupData.dailyLogs && typeof backupData.dailyLogs === 'object' ? backupData.dailyLogs : dailyLogs;
    const newAch = Array.isArray(backupData.unlockedAchievements) ? backupData.unlockedAchievements : unlockedAchievements;

    setProblems(newProblems);
    setTasks(newTasks);
    setXp(newXp);
    setDailyLogs(newLogs);
    setUnlockedAchievements(newAch);

    if (currentUser && !isDemoMode) {
      for (const p of problems) {
        try {
          await deleteDoc(doc(db, 'users', currentUser.uid, 'problems', p.id));
        } catch (_) {}
      }
      for (const t of tasks) {
        try {
          await deleteDoc(doc(db, 'users', currentUser.uid, 'tasks', t.id));
        } catch (_) {}
      }

      for (const p of newProblems) {
        await setDoc(doc(db, 'users', currentUser.uid, 'problems', p.id), p);
      }
      for (const t of newTasks) {
        await setDoc(doc(db, 'users', currentUser.uid, 'tasks', t.id), t);
      }
      syncUserToFirestore({
        problems: newProblems,
        tasks: newTasks,
        dailyLogs: newLogs,
        xp: newXp,
        unlockedAchievements: newAch,
      });
    }
  };

  // Save Roadmap module progress scoped strictly to the current user
  const saveRoadmapProgress = async (roadmapId, completedKeys) => {
    const updated = {
      ...roadmapProgress,
      [roadmapId]: completedKeys,
    };
    setRoadmapProgress(updated);

    const roadmapKey = getStorageKey(currentUid, isDemoMode, 'roadmap_progress');
    localStorage.setItem(roadmapKey, JSON.stringify(updated));

    if (currentUser && !isDemoMode) {
      syncUserToFirestore({ roadmapProgress: updated });
    }
  };

  // Save profile information scoped to the current user
  const saveUserProfile = async (profileUpdates) => {
    const updated = {
      ...userProfile,
      ...profileUpdates,
    };
    setUserProfile(updated);

    const profileKey = getStorageKey(currentUid, isDemoMode, 'user_profile');
    localStorage.setItem(profileKey, JSON.stringify(updated));

    if (currentUser && !isDemoMode) {
      syncUserToFirestore({ userProfile: updated });
    }
  };

  const levelInfo = calculateLevel(xp);

  const value = {
    problems,
    tasks,
    dailyLogs,
    xp,
    levelInfo,
    unlockedAchievements,
    roadmapProgress,
    userProfile,
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
    saveRoadmapProgress,
    saveUserProfile,
    loadStarterData,
    clearUserData,
    importUserData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}
