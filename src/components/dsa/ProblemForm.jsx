import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Modal from '../shared/Modal';
import MotionButton from '../motion/MotionButton';
import { isReducedMotionPreferred } from '../../animations/motionConfig';

const PLATFORMS = ['LeetCode', 'Codeforces', 'HackerRank', 'GeeksforGeeks', 'NeetCode', 'Custom'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const TOPICS = [
  'Array', 'String', 'Hash Table', 'Two Pointers', 'Binary Search', 
  'Dynamic Programming', 'Graph', 'Tree', 'Stack/Queue', 'Linked List', 
  'Heap/Priority Queue', 'Greedy', 'Backtracking', 'Bit Manipulation', 'Math'
];

export default function ProblemForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    title: '',
    platform: 'LeetCode',
    url: '',
    difficulty: 'Medium',
    topics: [],
    status: 'todo',
    notes: '',
    timeSpentMin: 20,
  });

  const prefersReduced = isReducedMotionPreferred();

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        title: '',
        platform: 'LeetCode',
        url: '',
        difficulty: 'Medium',
        topics: ['Array'],
        status: 'todo',
        notes: '',
        timeSpentMin: 20,
      });
    }
  }, [initialData, isOpen]);

  const toggleTopic = (topic) => {
    setFormData((prev) => {
      const exists = prev.topics.includes(topic);
      return {
        ...prev,
        topics: exists ? prev.topics.filter((t) => t !== topic) : [...prev.topics, topic],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Problem' : 'Add New DSA Problem'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Problem Title</label>
          <input
            type="text"
            required
            placeholder="Enter problem title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
        </div>

        {/* Platform & Difficulty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Platform</label>
            <select
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Difficulty</label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Problem URL */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Problem Link (Optional)</label>
          <input
            type="url"
            placeholder="https://leetcode.com/problems/..."
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Status & Time Spent */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="todo">To Do</option>
              <option value="attempted">Attempted</option>
              <option value="solved">Solved</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Time Spent (Minutes)</label>
            <input
              type="number"
              min={1}
              max={600}
              value={formData.timeSpentMin}
              onChange={(e) => setFormData({ ...formData, timeSpentMin: parseInt(e.target.value, 10) || 0 })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        {/* Topics Tag Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Topics</label>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
            {TOPICS.map((topic) => {
              const selected = formData.topics.includes(topic);
              return (
                <motion.button
                  type="button"
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  whileHover={prefersReduced ? undefined : { scale: 1.05 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.95 }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    selected
                      ? 'bg-cyan-500 text-white font-bold shadow-sm shadow-cyan-500/30'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {topic}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Notes & Write-up */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Approach & Notes</label>
          <textarea
            rows={3}
            placeholder="Add solution approach, time and space complexity, or key edge cases..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Actions */}
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
            {initialData ? 'Save Changes' : 'Add Problem (+XP)'}
          </MotionButton>
        </div>
      </form>
    </Modal>
  );
}
