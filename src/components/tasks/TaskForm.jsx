import React, { useState } from 'react';
import Modal from '../shared/Modal';
import MotionButton from '../motion/MotionButton';

const CATEGORIES = ['DSA', 'System Design', 'Projects', 'Fitness', 'Reading', 'Misc'];
const PRIORITIES = ['Low', 'Medium', 'High'];

export default function TaskForm({ isOpen, onClose, onSubmit }) {
  const [taskData, setTaskData] = useState({
    title: '',
    category: 'DSA',
    priority: 'Medium',
    dueDate: new Date().toISOString().split('T')[0],
    recurring: 'none',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskData.title.trim()) return;
    onSubmit(taskData);
    setTaskData({
      title: '',
      category: 'DSA',
      priority: 'Medium',
      dueDate: new Date().toISOString().split('T')[0],
      recurring: 'none',
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Daily Task / Habit">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Task Title</label>
          <input
            type="text"
            required
            placeholder="Enter task title or objective"
            value={taskData.title}
            onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Category</label>
            <select
              value={taskData.category}
              onChange={(e) => setTaskData({ ...taskData, category: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Priority</label>
            <select
              value={taskData.priority}
              onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Due Date</label>
            <input
              type="date"
              value={taskData.dueDate}
              onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Recurrence</label>
            <select
              value={taskData.recurring}
              onChange={(e) => setTaskData({ ...taskData, recurring: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="none">One-time Task</option>
              <option value="daily">Daily Habit</option>
              <option value="weekly">Weekly Task</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <MotionButton
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-bold"
          >
            Cancel
          </MotionButton>
          <MotionButton
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-extrabold shadow-lg shadow-cyan-500/20"
          >
            Create Task (+10 XP)
          </MotionButton>
        </div>
      </form>
    </Modal>
  );
}
