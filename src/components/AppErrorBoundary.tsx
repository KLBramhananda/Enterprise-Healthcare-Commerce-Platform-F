/**
 * AppErrorBoundary
 *
 * The application-level error boundary. Every route is code-split and lazy
 * loaded, and no per-page boundary exists, so a single unhandled render error
 * — or a failed lazy chunk load — previously unmounted the entire React tree
 * and left a blank white page with no way to recover. That is also what turned
 * transient errors during filter interactions (the popup layer re-rendering
 * against a concurrently refetching product list) into a full-app blank
 * screen instead of an inline failure.
 *
 * This boundary renders a recoverable fallback instead of blank: it explains
 * what happened and lets the user reload. Because it wraps the router (and the
 * checkout providers) a failure on any screen — including the filter flow —
 * never produces a blank page.
 */

import { Component, type ErrorInfo, type ReactNode } from "react";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  error: Error | null;
}

export default class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep the failure visible in devtools without letting it escape to a
    // blank page. Transient React 19 + browser Performance API TypeErrors are
    // suppressed at the window level in main.tsx; anything that reaches the
    // boundary is a real failure worth logging.
    console.error("[AppErrorBoundary]", error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-50 p-6">
        <div className="w-full max-w-md rounded-xl border border-surface-200 bg-surface-0 p-6 text-center shadow-sm">
          <h1 className="text-base font-semibold text-surface-900">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-surface-500">
            An unexpected error interrupted this page. Your cart and orders are
            safe. Reload to continue where you left off.
          </p>
          {error.message && (
            <p className="mt-3 break-words rounded-lg bg-surface-100 px-3 py-2 text-xs text-surface-500">
              {error.message}
            </p>
          )}
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-5 inline-flex items-center justify-center rounded-md bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-fast hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }
}