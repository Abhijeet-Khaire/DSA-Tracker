import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Sparkles } from 'lucide-react';
import WebLoader from '../components/shared/WebLoader';

export default function Signup() {
  const { signup, loginWithDemo } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/30">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100 font-sans tracking-tight">Create your account</h2>
          <p className="text-xs text-slate-400">Join GrindTrack and stay accountable</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <WebLoader size="sm" showProgress={false} showBadges={false} className="p-0 !min-h-0" />
                <span>Registering on Web Grid...</span>
              </span>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-400 font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
