import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, AlertCircle, Eye, EyeOff, Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';
import WebLoader from '../components/shared/WebLoader';
import AuthFeatureShowcase from '../components/auth/AuthFeatureShowcase';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setError('');
      setGoogleLoading(true);
      const res = await loginWithGoogle();
      if (res) {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Google Sign-in failed');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Ambient background glow elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10 my-auto">
        {/* Left Column: Rich Features Showcase */}
        <div className="hidden lg:block lg:col-span-7 glass-panel bg-slate-900/60 border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden self-stretch">
          <AuthFeatureShowcase />
        </div>

        {/* Right Column: Sign In Card */}
        <div className="w-full lg:col-span-5 glass-panel bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/30">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-100 font-sans tracking-tight">
              Sign in to GrindTrack
            </h2>
            <p className="text-xs text-slate-400">
              Resume your DSA streak and access your pattern notes
            </p>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2 animate-shake">
              <div className="font-semibold flex items-center gap-1.5 text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              {error.includes('Firebase Console') && (
                <div className="pt-2 border-t border-rose-500/20 text-[11px] text-slate-300 space-y-1.5">
                  <p className="font-medium text-amber-300">
                    Firebase Authentication Configuration Notice:
                  </p>
                  <ol className="list-decimal list-inside text-slate-400 space-y-0.5">
                    <li>Open Firebase Console for <code className="text-cyan-400 bg-slate-950 px-1 rounded">dsa-tracker-197f7</code></li>
                    <li>Click <strong>Authentication &gt; Sign-in method</strong> &amp; enable <strong>Google</strong></li>
                    <li>Under <strong>Settings &gt; Authorized domains</strong>, verify <code className="text-cyan-400 bg-slate-950 px-1 rounded">localhost</code> is listed</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Google One-Click Sign In */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs shadow-lg shadow-white/5 flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Or continue with email
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <WebLoader size="sm" showProgress={false} showBadges={false} className="p-0 !min-h-0" />
                  <span>Signing in...</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              )}
            </button>
          </form>

          {/* Mobile Feature Highlights Summary (only on small screens where left column is hidden) */}
          <div className="lg:hidden p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>GrindTrack Features Included:</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-400 font-mono">
              <div className="flex items-center gap-1">✓ 450+ Curated Problems</div>
              <div className="flex items-center gap-1">✓ Mac Notes & Highlighting</div>
              <div className="flex items-center gap-1">✓ 18 Achievement Badges</div>
              <div className="flex items-center gap-1">✓ Pomodoro Focus Timer</div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-cyan-400 font-bold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
