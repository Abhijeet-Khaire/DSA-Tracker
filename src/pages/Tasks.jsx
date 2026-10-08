import React from 'react';
import TaskList from '../components/tasks/TaskList';
import { CheckSquare } from 'lucide-react';

export default function Tasks() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
            <CheckSquare className="w-6 h-6" />
          </div>
          Daily Tasks & Habits
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Maintain your daily routines, system design study blocks, and personal goals.
        </p>
      </div>

      <TaskList />
    </div>
  );
}
