import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangleIcon, RotateCcwIcon, CopyIcon, CheckIcon } from "lucide-react";
import { Card } from './ui/card';
import { Button } from './ui/button';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    copied: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, copied: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught optical applet error:", error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('amp_optical_session');
    } catch (e) {
      // Ignored
    }
    this.setState({ hasError: false, error: null, copied: false });
    window.location.reload();
  };

  private handleCopyToClipboard = async () => {
    if (!this.state.error) return;
    try {
      await navigator.clipboard.writeText(
        `Error: ${this.state.error.message}\nStack: ${this.state.error.stack}`
      );
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch (err) {
      console.warn("Could not copy error stack trace", err);
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 font-sans antialiased text-left transition-colors duration-200">
          <Card className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-2xl text-red-500 shrink-0">
                <AlertTriangleIcon size={24} />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                  Aplikasi Mengalami Kendala
                </h2>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Application Runtime Intercepted
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                Terjadi kesalahan teknis saat memproses parameter geometri lensa atau memuat data sesi. Anda dapat menyetel ulang data sesi untuk mengatasi kendala ini.
              </p>

              {this.state.error && (
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-3 rounded-xl max-h-36 overflow-auto font-mono text-[10px] text-slate-600 dark:text-slate-400 leading-normal select-text">
                  <strong>Message:</strong> {this.state.error.message}
                  {this.state.error.stack && (
                    <div className="mt-1 opacity-70 whitespace-pre-wrap">
                      {this.state.error.stack}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={this.handleReset}
                variant="default"
                className="flex-1 rounded-xl shadow-md cursor-pointer active:scale-[0.98]"
              >
                <RotateCcwIcon size={14} className="mr-2" />
                Setel Ulang Sesi
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={this.handleCopyToClipboard}
                title="Salin log kesalahan"
                className="w-10 rounded-xl cursor-pointer active:scale-[0.98]"
              >
                {this.state.copied ? <CheckIcon size={14} className="text-emerald-500" /> : <CopyIcon size={14} />}
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
