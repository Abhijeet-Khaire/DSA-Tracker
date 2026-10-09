import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("GrindTrack ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-rose-300">Application Error Encountered</span>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 text-[11px] font-bold cursor-pointer"
            >
              Retry
            </button>
          </div>
          <p className="font-mono text-[11px] text-rose-300/90 bg-slate-950/80 p-3 rounded-xl border border-rose-500/20 overflow-x-auto whitespace-pre-wrap">
            {this.state.error?.message || String(this.state.error)}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
