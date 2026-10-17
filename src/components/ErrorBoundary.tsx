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
        <div className="flex min-h-dvh items-center justify-center bg-sheet-ground p-6 font-sans antialiased text-left transition-colors duration-200">
          <Card className="w-full max-w-md space-y-6 rounded-sm bg-sheet-panel p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="shrink-0 rounded-sm bg-sheet-alert p-3 text-sheet-warning">
                <AlertTriangleIcon size={24} />
              </div>
              <div className="space-y-1">
                <h2 className="text-[18px] font-medium leading-tight text-sheet-ink">
                  Aplikasi mengalami kendala
                </h2>
                <p className="text-[13px] text-sheet-muted">
                  Application runtime intercepted
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="text-[16px] font-normal leading-relaxed text-sheet-ink">
                Terjadi kesalahan teknis saat memproses parameter geometri lensa atau memuat data sesi. Anda dapat menyetel ulang data sesi untuk mengatasi kendala ini.
              </p>

              {this.state.error && (
                <div className="max-h-36 select-text overflow-auto rounded-sm bg-sheet-ground p-3 text-[13px] leading-normal text-sheet-muted">
                  <strong className="font-medium text-sheet-ink">Message:</strong> {this.state.error.message}
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
                className="flex-1 rounded-sm bg-sheet-accent text-sheet-accent-ink hover:bg-sheet-accent/90 cursor-pointer active:translate-y-px"
              >
                <RotateCcwIcon size={14} className="mr-2" />
                Setel ulang sesi
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={this.handleCopyToClipboard}
                title="Salin log kesalahan"
                className="w-10 rounded-sm border-sheet-stage bg-sheet-ground text-sheet-muted hover:text-sheet-ink cursor-pointer active:translate-y-px"
              >
                {this.state.copied ? <CheckIcon size={14} className="text-sheet-fit" /> : <CopyIcon size={14} />}
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
