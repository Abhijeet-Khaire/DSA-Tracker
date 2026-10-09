import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import DSATracker from './pages/DSATracker';
import Tasks from './pages/Tasks';
import Achievements from './pages/Achievements';
import Notes from './pages/Notes';
import ProfileResume from './pages/ProfileResume';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './routes/ProtectedRoute';
import AchievementModal from './components/gamification/AchievementModal';
import ErrorBoundary from './components/shared/ErrorBoundary';
import PageTransition from './components/motion/PageTransition';
import XPToastContainer from './components/motion/XPToast';
import { useData } from './context/DataContext';

function AppContent() {
  const { newlyUnlocked, setNewlyUnlocked, activeXpReward, dismissXpReward } = useData();
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <ErrorBoundary>
            <PageTransition key={location.pathname}>
              <Routes location={location}>
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/dsa" element={<ProtectedRoute><DSATracker /></ProtectedRoute>} />
                <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
                <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
                <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfileResume /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </PageTransition>
          </ErrorBoundary>
        </main>
      </div>

      {/* Celebratory Achievement Modal Popup */}
      <AchievementModal
        achievement={newlyUnlocked}
        onClose={() => setNewlyUnlocked(null)}
      />

      {/* Global Animated XP Floating Toast */}
      <XPToastContainer
        activeReward={activeXpReward}
        onDismiss={dismissXpReward}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </ErrorBoundary>
  );
}
