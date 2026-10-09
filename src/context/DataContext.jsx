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
import { DEMO_PROBLEM_IDS, DEMO_TASK_IDS } from '../lib/demoData';
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
    loadScopedStorage('problems', [])
  );
  const [tasks, setTasks] = useState(() => 
    loadScopedStorage('tasks', [])
  );
  const [dailyLogs, setDailyLogs] = useState(() => 
    loadScopedStorage('daily_logs', {})
  );
  const [xp, setXp] = useState(() => 
    Number(loadScopedStorage('xp', 0))
  );
  const [unlockedAchievements, setUnlockedAchievements] = useState(() => 
    loadScopedStorage('achievements', [])
  );
  const [roadmapProgress, setRoadmapProgress] = useState(() => 
    loadScopedStorage('roadmap_progress', {})
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

  // Synchronous State Reference to prevent stale closures during concurrent Firestore writes
  const stateRef = useRef({
    problems: [],
    tasks: [],
    dailyLogs: {},
    xp: 0,
    unlockedAchievements: [],
    roadmapProgress: {},
    userProfile: {
      bio: 'Data Structures & Algorithms Enthusiast',
      targetRole: 'Software Engineer',
      leetcodeUsername: '',
      githubUsername: '',
    },
  });

  // Keep stateRef immediately updated with latest state
  useEffect(() => {
    stateRef.current = {
      problems,
      tasks,
      dailyLogs,
      xp,
      unlockedAchievements,
      roadmapProgress,
      userProfile,
    };
  }, [problems, tasks, dailyLogs, xp, unlockedAchievements, roadmapProgress, userProfile]);

  // Sync state when active user or demo mode changes
  useEffect(() => {
    // Purge any residual demo keys from localStorage
    ['problems', 'tasks', 'daily_logs', 'xp', 'achievements', 'roadmap_progress', 'user_profile', 'demo_mode'].forEach((k) => {
      localStorage.removeItem(`grindtrack_demo_${k}`);
    });

    if (!currentUid) {
      setProblems([]);
      setTasks([]);
      setDailyLogs({});
      setXp(0);
      setUnlockedAchievements([]);
      setRoadmapProgress({});
      setIsLoadingData(false);
      stateRef.current = {
        problems: [],
        tasks: [],
        dailyLogs: {},
        xp: 0,
        unlockedAchievements: [],
        roadmapProgress: {},
        userProfile: {
          bio: 'Data Structures & Algorithms Enthusiast',
          targetRole: 'Software Engineer',
          leetcodeUsername: '',
          githubUsername: '',
        },
      };
      return;
    }

    // Authenticated User: Load user-scoped cached storage first to prevent flash of empty data
    setIsLoadingData(true);
    const userProbsKey = getStorageKey(currentUid, false, 'problems');
    const userTasksKey = getStorageKey(currentUid, false, 'tasks');
    const userLogsKey = getStorageKey(currentUid, false, 'daily_logs');
    const userXpKey = getStorageKey(currentUid, false, 'xp');
    const userAchKey = getStorageKey(currentUid, false, 'achievements');
    const userRoadmapKey = getStorageKey(currentUid, false, 'roadmap_progress');
    const userProfileKey = getStorageKey(currentUid, false, 'user_profile');

    const cachedProbs = localStorage.getItem(userProbsKey);
    const cleanCachedProbs = cachedProbs
      ? JSON.parse(cachedProbs).filter((p) => !DEMO_PROBLEM_IDS.includes(p.id))
      : [];
    setProblems(cleanCachedProbs);

    const cachedTasks = localStorage.getItem(userTasksKey);
    const cleanCachedTasks = cachedTasks
      ? JSON.parse(cachedTasks).filter((t) => !DEMO_TASK_IDS.includes(t.id))
      : [];
    setTasks(cleanCachedTasks);

    const cachedLogs = localStorage.getItem(userLogsKey);
    const cleanCachedLogs = cachedLogs ? JSON.parse(cachedLogs) : {};
    setDailyLogs(cleanCachedLogs);

    const cachedXp = localStorage.getItem(userXpKey);
    const cleanCachedXp = cachedXp ? parseInt(cachedXp, 10) : 0;
    setXp(cleanCachedXp);

    const cachedAch = localStorage.getItem(userAchKey);
    const cleanCachedAch = cachedAch ? JSON.parse(cachedAch) : [];
    setUnlockedAchievements(cleanCachedAch);

    const cachedRoadmap = localStorage.getItem(userRoadmapKey);
    const cleanCachedRoadmap = cachedRoadmap ? JSON.parse(cachedRoadmap) : {};
    setRoadmapProgress(cleanCachedRoadmap);

    const cachedProfile = localStorage.getItem(userProfileKey);
    const cleanCachedProfile = cachedProfile ? JSON.parse(cachedProfile) : {
      bio: 'Data Structures & Algorithms Enthusiast',
      targetRole: 'Software Engineer',
      leetcodeUsername: '',
      githubUsername: '',
    };
    setUserProfile(cleanCachedProfile);

    // Initialize stateRef with cached values
    stateRef.current = {
      problems: cleanCachedProbs,
      tasks: cleanCachedTasks,
      dailyLogs: cleanCachedLogs,
      xp: cleanCachedXp,
      unlockedAchievements: cleanCachedAch,
      roadmapProgress: cleanCachedRoadmap,
      userProfile: cleanCachedProfile,
    };

    // Setup Realtime Firestore Listeners for this specific user
    const userDocRef = doc(db, 'users', currentUid);

    // 1. User Profile Document Sync (XP, Achievements, Daily Logs, Profile, Roadmap Progress)
    const userDocUnsub = onSnapshot(userDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        // Extract from data.userInfo or direct fields
        const userXp = data.userInfo?.xp !== undefined ? data.userInfo.xp : data.xp;
        if (userXp !== undefined) {
          setXp(userXp);
          stateRef.current.xp = userXp;
          localStorage.setItem(userXpKey, String(userXp));
        }

        const userBadges = data.userInfo?.badges || data.badges || data.unlockedAchievements;
        if (userBadges !== undefined) {
          setUnlockedAchievements(userBadges);
          stateRef.current.unlockedAchievements = userBadges;
          localStorage.setItem(userAchKey, JSON.stringify(userBadges));
        }

        const userRoadmap = data.userInfo?.roadmap || data.roadmap || data.roadmapProgress;
        if (userRoadmap !== undefined) {
          setRoadmapProgress(userRoadmap);
          stateRef.current.roadmapProgress = userRoadmap;
          localStorage.setItem(userRoadmapKey, JSON.stringify(userRoadmap));
        }

        const userProf = data.userInfo?.profile || data.profile;
        if (userProf !== undefined) {
          setUserProfile(userProf);
          stateRef.current.userProfile = userProf;
          localStorage.setItem(userProfileKey, JSON.stringify(userProf));
        }

        if (data.dailyLogs !== undefined) {
          setDailyLogs(data.dailyLogs);
          stateRef.current.dailyLogs = data.dailyLogs;
          localStorage.setItem(userLogsKey, JSON.stringify(data.dailyLogs));
        }

        // Only hydrate problems/tasks from parent doc if state is completely empty
        if (Array.isArray(data.problems) && stateRef.current.problems.length === 0) {
          const cleanProbs = data.problems.filter((p) => !DEMO_PROBLEM_IDS.includes(p.id));
          if (cleanProbs.length > 0) {
            setProblems(cleanProbs);
            stateRef.current.problems = cleanProbs;
            localStorage.setItem(userProbsKey, JSON.stringify(cleanProbs));
          }
        }

        if (Array.isArray(data.tasks) && stateRef.current.tasks.length === 0) {
          const cleanTasks = data.tasks.filter((t) => !DEMO_TASK_IDS.includes(t.id));
          if (cleanTasks.length > 0) {
            setTasks(cleanTasks);
            stateRef.current.tasks = cleanTasks;
            localStorage.setItem(userTasksKey, JSON.stringify(cleanTasks));
          }
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

    // 2. Authoritative User Problems Subcollection Sync (/users/{uid}/problems)
    const probCollectionRef = collection(userDocRef, 'problems');
    const probUnsub = onSnapshot(probCollectionRef, (snap) => {
      const list = [];
      snap.forEach((d) => {
        if (DEMO_PROBLEM_IDS.includes(d.id)) {
          deleteDoc(doc(db, 'users', currentUid, 'problems', d.id)).catch(() => {});
        } else {
          list.push({ id: d.id, ...d.data() });
        }
      });
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setProblems(list);
      stateRef.current.problems = list;
      localStorage.setItem(userProbsKey, JSON.stringify(list));
    }, (err) => {
      console.error('Firestore problems snapshot error:', err);
    });

    // 3. Authoritative User Tasks Subcollection Sync (/users/{uid}/tasks)
    const taskCollectionRef = collection(userDocRef, 'tasks');
    const taskUnsub = onSnapshot(taskCollectionRef, (snap) => {
      const list = [];
      snap.forEach((d) => {
        if (DEMO_TASK_IDS.includes(d.id)) {
          deleteDoc(doc(db, 'users', currentUid, 'tasks', d.id)).catch(() => {});
        } else {
          list.push({ id: d.id, ...d.data() });
        }
      });
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setTasks(list);
      stateRef.current.tasks = list;
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
    const currLogs = stateRef.current.dailyLogs || dailyLogs;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const log = currLogs[dateStr];

      if (log && log.activeDay && (log.problemsSolved > 0 || log.tasksCompleted > 0)) {
        streak++;
      } else if (i === 0) {
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
    const curr = stateRef.current;

    const finalProfile = overrides.userProfile !== undefined ? overrides.userProfile : (overrides.profile !== undefined ? overrides.profile : curr.userProfile);
    const finalXp = overrides.xp !== undefined ? overrides.xp : curr.xp;
    const finalStreak = overrides.streak !== undefined ? overrides.streak : currentStreak;
    const finalBadges = overrides.unlockedAchievements !== undefined ? overrides.unlockedAchievements : (Array.isArray(overrides.badges) ? overrides.badges : curr.unlockedAchievements);
    const finalRoadmap = overrides.roadmapProgress !== undefined ? overrides.roadmapProgress : (overrides.roadmap !== undefined ? overrides.roadmap : curr.roadmapProgress);
    const finalProblems = overrides.problems !== undefined ? overrides.problems : curr.problems;
    const finalTasks = overrides.tasks !== undefined ? overrides.tasks : curr.tasks;
    const finalDailyLogs = overrides.dailyLogs !== undefined ? overrides.dailyLogs : curr.dailyLogs;

    // Immediately keep stateRef in sync to avoid any race conditions
    stateRef.current = {
      ...curr,
      userProfile: finalProfile,
      xp: finalXp,
      unlockedAchievements: finalBadges,
      roadmapProgress: finalRoadmap,
      problems: finalProblems,
      tasks: finalTasks,
      dailyLogs: finalDailyLogs,
    };

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

    let updatedAchievements = [...stateRef.current.unlockedAchievements];
    let newlyEarned = null;

    ACHIEVEMENTS.forEach((ach) => {
      if (!updatedAchievements.includes(ach.id) && ach.condition(stats)) {
        updatedAchievements.push(ach.id);
        newlyEarned = ach;
      }
    });

    if (newlyEarned) {
      stateRef.current.unlockedAchievements = updatedAchievements;
      setUnlockedAchievements(updatedAchievements);
      addXp(newlyEarned.xpReward, `Achievement: ${newlyEarned.title}`);
      setNewlyUnlocked(newlyEarned);
      await syncUserToFirestore({ unlockedAchievements: updatedAchievements });
    }
  };

  // Helper for adding XP with rapid-reward grouping and Firestore persistence
  const addXp = async (amount, reason = '') => {
    const nextXp = Math.max(0, stateRef.current.xp + amount);
    stateRef.current.xp = nextXp;
    setXp(nextXp);

    const userXpKey = getStorageKey(currentUid, isDemoMode, 'xp');
    localStorage.setItem(userXpKey, String(nextXp));

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
      await syncUserToFirestore({ xp: nextXp });
    }
  };

  // Log today's activity with Firestore persistence
  const recordDailyActivity = async (type, amount = 1, xpEarned = 0, specificDate = null) => {
    const targetDate = specificDate || format(new Date(), 'yyyy-MM-dd');
    const currLogs = stateRef.current.dailyLogs;
    const current = currLogs[targetDate] || { problemsSolved: 0, tasksCompleted: 0, xpEarned: 0, activeDay: false };
    
    const nextProblemsSolved = Math.max(0, (current.problemsSolved || 0) + (type === 'problem' ? amount : 0));
    const nextTasksCompleted = Math.max(0, (current.tasksCompleted || 0) + (type === 'task' ? amount : 0));
    const nextXpEarned = Math.max(0, (current.xpEarned || 0) + xpEarned);
    const isActiveDay = nextProblemsSolved > 0 || nextTasksCompleted > 0;

    const nextLogs = {
      ...currLogs,
      [targetDate]: {
        ...current,
        problemsSolved: nextProblemsSolved,
        tasksCompleted: nextTasksCompleted,
        xpEarned: nextXpEarned,
        activeDay: isActiveDay,
      }
    };

    stateRef.current.dailyLogs = nextLogs;
    setDailyLogs(nextLogs);

    const userLogsKey = getStorageKey(currentUid, isDemoMode, 'daily_logs');
    localStorage.setItem(userLogsKey, JSON.stringify(nextLogs));

    if (currentUser && !isDemoMode) {
      await syncUserToFirestore({ dailyLogs: nextLogs });
    }
  };

  // Problem actions (stored under /users/{uid}/problems/{probId} and parent doc)
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

    const nextProblems = [newProb, ...stateRef.current.problems];
    stateRef.current.problems = nextProblems;
    setProblems(nextProblems);

    const userProbsKey = getStorageKey(currentUid, isDemoMode, 'problems');
    localStorage.setItem(userProbsKey, JSON.stringify(nextProblems));

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

    const currentXp = stateRef.current.xp;
    await syncUserToFirestore({ problems: nextProblems, ...(addedXp > 0 ? { xp: currentXp + addedXp } : {}) });
    checkAchievements(nextProblems, stateRef.current.tasks, calculateStreak());
  };

  const updateProblem = async (id, updates) => {
    let xpReward = 0;
    let updatedProblem = null;
    let nextProblems = [];

    const prevProblems = stateRef.current.problems;
    nextProblems = prevProblems.map((p) => {
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

    stateRef.current.problems = nextProblems;
    setProblems(nextProblems);

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

    await syncUserToFirestore({ problems: nextProblems, ...(xpReward !== 0 ? { xp: Math.max(0, stateRef.current.xp + xpReward) } : {}) });
    checkAchievements(nextProblems, stateRef.current.tasks, calculateStreak());
  };

  const deleteProblem = async (id) => {
    const nextProblems = stateRef.current.problems.filter((p) => p.id !== id);
    stateRef.current.problems = nextProblems;
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

    await syncUserToFirestore({ problems: nextProblems });
    checkAchievements(nextProblems, stateRef.current.tasks, calculateStreak());
  };

  const completeRevision = async (id) => {
    let updatedDate = null;
    let nextCount = 0;
    let nextProblems = [];

    const prevProblems = stateRef.current.problems;
    nextProblems = prevProblems.map((p) => {
      if (p.id === id) {
        nextCount = (p.revisionCount || 0) + 1;
        updatedDate = getNextRevisionDate(new Date(), nextCount);
        return {
          ...p,
          revisionCount: nextCount,
          revisionDate: updatedDate,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    stateRef.current.problems = nextProblems;
    setProblems(nextProblems);

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

    await syncUserToFirestore({ problems: nextProblems, xp: stateRef.current.xp + XP_REWARDS.PROBLEM_REVISION });
  };

  // Task actions (stored under /users/{uid}/tasks/{taskId} and parent doc)
  const addTask = async (taskData) => {
    const newTask = {
      id: `task-${Date.now()}`,
      ...taskData,
      status: 'pending',
      createdAt: format(new Date(), 'yyyy-MM-dd'),
    };

    const nextTasks = [newTask, ...stateRef.current.tasks];
    stateRef.current.tasks = nextTasks;
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

    await syncUserToFirestore({ tasks: nextTasks });
    checkAchievements(stateRef.current.problems, nextTasks, calculateStreak());
  };

  const toggleTask = async (id) => {
    let updatedTask = null;
    let wasDone = false;
    let nextTasks = [];

    const prevTasks = stateRef.current.tasks;
    nextTasks = prevTasks.map((t) => {
      if (t.id === id) {
        wasDone = t.status === 'done';
        const nextStatus = wasDone ? 'pending' : 'done';
        updatedTask = {
          ...t,
          status: nextStatus,
          completedAt: nextStatus === 'done' ? format(new Date(), 'yyyy-MM-dd') : null,
          updatedAt: new Date().toISOString(),
        };
        return updatedTask;
      }
      return t;
    });

    if (!updatedTask) return;

    stateRef.current.tasks = nextTasks;
    setTasks(nextTasks);

    const userTasksKey = getStorageKey(currentUid, isDemoMode, 'tasks');
    localStorage.setItem(userTasksKey, JSON.stringify(nextTasks));

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const completionDate = (wasDone && updatedTask.completedAt) ? updatedTask.completedAt : todayStr;

    if (!wasDone) {
      addXp(XP_REWARDS.TASK_COMPLETE, 'Daily Task Completed');
      recordDailyActivity('task', 1, XP_REWARDS.TASK_COMPLETE, todayStr);
    } else {
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
    checkAchievements(stateRef.current.problems, nextTasks, currentStreak);
    await syncUserToFirestore({
      tasks: nextTasks,
      streak: currentStreak,
      xp: Math.max(0, stateRef.current.xp + (!wasDone ? XP_REWARDS.TASK_COMPLETE : -XP_REWARDS.TASK_COMPLETE)),
    });
  };

  const deleteTask = async (id) => {
    const taskToDelete = stateRef.current.tasks.find((t) => t.id === id);
    const nextTasks = stateRef.current.tasks.filter((t) => t.id !== id);
    stateRef.current.tasks = nextTasks;
    setTasks(nextTasks);

    const userTasksKey = getStorageKey(currentUid, isDemoMode, 'tasks');
    localStorage.setItem(userTasksKey, JSON.stringify(nextTasks));

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

    await syncUserToFirestore({
      tasks: nextTasks,
      ...(taskToDelete && taskToDelete.status === 'done' ? { xp: Math.max(0, stateRef.current.xp - XP_REWARDS.TASK_COMPLETE) } : {})
    });
  };

  // Atomic import of LeetCode profile, statistics, and XP
  const importLeetCodeProfile = async (stats, earnedXp = 0) => {
    if (!stats) return;

    const updatedProfile = {
      ...stateRef.current.userProfile,
      leetcodeUsername: stats.username,
      leetcodeStats: {
        totalSolved: stats.totalSolved,
        easySolved: stats.easySolved,
        mediumSolved: stats.mediumSolved,
        hardSolved: stats.hardSolved,
        ranking: stats.ranking,
        reputation: stats.reputation,
        avatar: stats.avatar,
      },
    };

    const nextXp = (stateRef.current.xp || 0) + (earnedXp || 0);

    stateRef.current.userProfile = updatedProfile;
    stateRef.current.xp = nextXp;

    setUserProfile(updatedProfile);
    setXp(nextXp);

    const profileKey = getStorageKey(currentUid, isDemoMode, 'user_profile');
    const xpKey = getStorageKey(currentUid, isDemoMode, 'xp');
    localStorage.setItem(profileKey, JSON.stringify(updatedProfile));
    localStorage.setItem(xpKey, String(nextXp));

    if (earnedXp > 0) {
      if (xpTimerRef.current) clearTimeout(xpTimerRef.current);
      setActiveXpReward({
        id: Date.now(),
        amount: earnedXp,
        reason: `LeetCode Sync: @${stats.username} (${stats.totalSolved} Solved)`,
      });
      xpTimerRef.current = setTimeout(() => {
        setActiveXpReward(null);
      }, 2400);
    }

    if (currentUser && !isDemoMode) {
      await syncUserToFirestore({
        userProfile: updatedProfile,
        profile: updatedProfile,
        xp: nextXp,
      });
    }
  };

  // Purge all legacy demo items from state and Firestore
  const purgeDemoData = async () => {
    const cleanProbs = stateRef.current.problems.filter((p) => !DEMO_PROBLEM_IDS.includes(p.id));
    const cleanTasks = stateRef.current.tasks.filter((t) => !DEMO_TASK_IDS.includes(t.id));

    stateRef.current.problems = cleanProbs;
    stateRef.current.tasks = cleanTasks;
    setProblems(cleanProbs);
    setTasks(cleanTasks);

    const userProbsKey = getStorageKey(currentUid, false, 'problems');
    const userTasksKey = getStorageKey(currentUid, false, 'tasks');
    localStorage.setItem(userProbsKey, JSON.stringify(cleanProbs));
    localStorage.setItem(userTasksKey, JSON.stringify(cleanTasks));

    // Clear legacy demo keys
    ['problems', 'tasks', 'daily_logs', 'xp', 'achievements', 'roadmap_progress', 'user_profile', 'demo_mode'].forEach((k) => {
      localStorage.removeItem(`grindtrack_demo_${k}`);
    });

    if (currentUser && !isDemoMode) {
      for (const id of DEMO_PROBLEM_IDS) {
        try {
          await deleteDoc(doc(db, 'users', currentUser.uid, 'problems', id));
        } catch (_) {}
      }
      for (const id of DEMO_TASK_IDS) {
        try {
          await deleteDoc(doc(db, 'users', currentUser.uid, 'tasks', id));
        } catch (_) {}
      }
      await syncUserToFirestore({
        problems: cleanProbs,
        tasks: cleanTasks,
      });
    }
  };

  // Backwards compatibility alias
  const loadStarterData = purgeDemoData;

  // Clear/Reset all data for current user to a fresh zero slate
  const clearUserData = async () => {
    const prevProblems = [...stateRef.current.problems];
    const prevTasks = [...stateRef.current.tasks];

    stateRef.current = {
      ...stateRef.current,
      problems: [],
      tasks: [],
      dailyLogs: {},
      xp: 0,
      unlockedAchievements: [],
      roadmapProgress: {},
    };

    setProblems([]);
    setTasks([]);
    setDailyLogs({});
    setXp(0);
    setUnlockedAchievements([]);
    setRoadmapProgress({});

    const userProbsKey = getStorageKey(currentUid, false, 'problems');
    const userTasksKey = getStorageKey(currentUid, false, 'tasks');
    const userLogsKey = getStorageKey(currentUid, false, 'daily_logs');
    const userXpKey = getStorageKey(currentUid, false, 'xp');
    const userAchKey = getStorageKey(currentUid, false, 'achievements');
    const userRoadmapKey = getStorageKey(currentUid, false, 'roadmap_progress');

    localStorage.setItem(userProbsKey, JSON.stringify([]));
    localStorage.setItem(userTasksKey, JSON.stringify([]));
    localStorage.setItem(userLogsKey, JSON.stringify({}));
    localStorage.setItem(userXpKey, '0');
    localStorage.setItem(userAchKey, JSON.stringify([]));
    localStorage.setItem(userRoadmapKey, JSON.stringify({}));

    ['problems', 'tasks', 'daily_logs', 'xp', 'achievements', 'roadmap_progress', 'user_profile', 'demo_mode'].forEach((k) => {
      localStorage.removeItem(`grindtrack_demo_${k}`);
    });

    if (currentUser && !isDemoMode) {
      for (const p of prevProblems) {
        try {
          await deleteDoc(doc(db, 'users', currentUser.uid, 'problems', p.id));
        } catch (_) {}
      }
      for (const t of prevTasks) {
        try {
          await deleteDoc(doc(db, 'users', currentUser.uid, 'tasks', t.id));
        } catch (_) {}
      }
      await syncUserToFirestore({
        problems: [],
        tasks: [],
        dailyLogs: {},
        xp: 0,
        unlockedAchievements: [],
        roadmapProgress: {},
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
    const newLogs = backupData.dailyLogs && typeof backupData.dailyLogs === 'object' ? backupData.dailyLogs : stateRef.current.dailyLogs;
    const newAch = Array.isArray(backupData.unlockedAchievements) ? backupData.unlockedAchievements : stateRef.current.unlockedAchievements;
    const newProfile = backupData.userProfile && typeof backupData.userProfile === 'object' ? backupData.userProfile : stateRef.current.userProfile;
    const newRoadmap = backupData.roadmapProgress && typeof backupData.roadmapProgress === 'object' ? backupData.roadmapProgress : stateRef.current.roadmapProgress;

    stateRef.current = {
      problems: newProblems,
      tasks: newTasks,
      xp: newXp,
      dailyLogs: newLogs,
      unlockedAchievements: newAch,
      userProfile: newProfile,
      roadmapProgress: newRoadmap,
    };

    setProblems(newProblems);
    setTasks(newTasks);
    setXp(newXp);
    setDailyLogs(newLogs);
    setUnlockedAchievements(newAch);
    setUserProfile(newProfile);
    setRoadmapProgress(newRoadmap);

    const userProbsKey = getStorageKey(currentUid, isDemoMode, 'problems');
    const userTasksKey = getStorageKey(currentUid, isDemoMode, 'tasks');
    const userLogsKey = getStorageKey(currentUid, isDemoMode, 'daily_logs');
    const userXpKey = getStorageKey(currentUid, isDemoMode, 'xp');
    const userAchKey = getStorageKey(currentUid, isDemoMode, 'achievements');
    const userRoadmapKey = getStorageKey(currentUid, isDemoMode, 'roadmap_progress');
    const userProfileKey = getStorageKey(currentUid, isDemoMode, 'user_profile');

    localStorage.setItem(userProbsKey, JSON.stringify(newProblems));
    localStorage.setItem(userTasksKey, JSON.stringify(newTasks));
    localStorage.setItem(userLogsKey, JSON.stringify(newLogs));
    localStorage.setItem(userXpKey, String(newXp));
    localStorage.setItem(userAchKey, JSON.stringify(newAch));
    localStorage.setItem(userRoadmapKey, JSON.stringify(newRoadmap));
    localStorage.setItem(userProfileKey, JSON.stringify(newProfile));

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
      await syncUserToFirestore({
        problems: newProblems,
        tasks: newTasks,
        dailyLogs: newLogs,
        xp: newXp,
        unlockedAchievements: newAch,
        userProfile: newProfile,
        roadmapProgress: newRoadmap,
      });
    }
  };

  // Save Roadmap module progress scoped strictly to the current user
  const saveRoadmapProgress = async (roadmapId, completedKeys) => {
    const updated = {
      ...stateRef.current.roadmapProgress,
      [roadmapId]: completedKeys,
    };
    stateRef.current.roadmapProgress = updated;
    setRoadmapProgress(updated);

    const roadmapKey = getStorageKey(currentUid, isDemoMode, 'roadmap_progress');
    localStorage.setItem(roadmapKey, JSON.stringify(updated));

    if (currentUser && !isDemoMode) {
      await syncUserToFirestore({ roadmapProgress: updated });
    }
  };

  // Save profile information scoped to the current user
  const saveUserProfile = async (profileUpdates) => {
    const updated = {
      ...stateRef.current.userProfile,
      ...profileUpdates,
    };
    stateRef.current.userProfile = updated;
    setUserProfile(updated);

    const profileKey = getStorageKey(currentUid, isDemoMode, 'user_profile');
    localStorage.setItem(profileKey, JSON.stringify(updated));

    if (currentUser && !isDemoMode) {
      await syncUserToFirestore({ userProfile: updated });
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
    importLeetCodeProfile,
    loadStarterData,
    purgeDemoData,
    clearUserData,
    importUserData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}
