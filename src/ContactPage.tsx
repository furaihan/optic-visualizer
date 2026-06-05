import { ArrowLeft } from "lucide-react";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import {
  Card,
  CardContent,
} from "./components/ui/card";

export function ContactPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted/30 text-foreground">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 bg-primary"
          style={{
            top: "10%",
            left: "10%",
            animation: "float 8s ease-in-out infinite",
          }}
        />

        <div
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 bg-cyan-500"
          style={{
            bottom: "10%",
            right: "10%",
            animation: "float 10s ease-in-out infinite reverse",
          }}
        />

        <div
          className="absolute w-64 h-64 rounded-full blur-2xl opacity-15 bg-purple-500"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            animation: "float-gentle 12s ease-in-out infinite",
          }}
        />

        {/* Grid pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-10 stroke-primary"
          style={{ animation: "grid-shift 20s linear infinite" }}
        >
          <defs>
            <pattern
              id="grid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>

          <rect
            width="100%"
            height="100%"
            fill="url(#grid)"
          />
        </svg>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-block">
            <Badge
              variant="secondary"
              className="px-6 py-3 rounded-full text-sm font-semibold tracking-widest uppercase backdrop-blur-md border"
              style={{
                animation: "shimmer 3s ease-in-out infinite",
              }}
            >
              ✨ Coming Soon ✨
            </Badge>
          </div>

          {/* Heading */}
          <div
            style={{
              animation: "fade-in-up 0.8s ease-out 0.2s forwards",
              opacity: 0,
            }}
          >
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
              <span
                className="inline-block"
                style={{
                  animation:
                    "slide-in-letter 0.6s ease-out 0.3s forwards",
                  opacity: 0,
                }}
              >
                Route
              </span>

              <br />

              <span
                className="inline-block bg-gradient-to-r from-primary via-cyan-500 to-blue-500 bg-clip-text text-transparent"
                style={{
                  animation:
                    "slide-in-letter 0.6s ease-out 0.5s forwards",
                  opacity: 0,
                }}
              >
                Placeholder Page
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p
            className="text-lg md:text-xl text-muted-foreground"
            style={{
              animation: "fade-in-up 0.8s ease-out 0.6s forwards",
              opacity: 0,
            }}
          >
            Lorem ipsum dolor sit amet lorep ipsum dolor sit amet
          </p>

          {/* Notice Card */}
          <Card
            className="mt-12 bg-background/60 backdrop-blur-sm border-border"
            style={{
              animation:
                "fade-in-up 0.8s ease-out 0.8s forwards, pulse-subtle 3s ease-in-out 1s infinite",
              opacity: 0,
            }}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 text-left">
                <span className="text-xl">📌</span>

                <div>
                  <h3 className="font-mono font-bold text-sm uppercase tracking-wider mb-1">
                    Placeholder Route
                  </h3>

                  <p className="text-sm leading-relaxed font-mono text-muted-foreground">
                    This route is a work-in-progress placeholder
                    reserved for future TanStack Start
                    implementation. Navigate back to the main
                    simulator to continue.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back Button */}
          <div
            style={{
              animation: "fade-in-up 0.8s ease-out 1s forwards",
              opacity: 0,
            }}
          >
            <Button
              size="lg"
              onClick={() => window.history.back()}
              className="group relative overflow-hidden"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Homepage

              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,.2), transparent)",
                  animation: "shimmer-btn 2s ease-in-out infinite",
                }}
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes float {
          0%,100% {
            transform: translate(0,0);
          }
          33% {
            transform: translate(30px,-30px);
          }
          66% {
            transform: translate(-20px,20px);
          }
        }

        @keyframes float-gentle {
          0%,100% {
            transform: translate(-50%,-50%);
          }
          50% {
            transform: translate(-50%,-60%);
          }
        }

        @keyframes grid-shift {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(50px);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-letter {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes shimmer {
          0%,100% {
            opacity: .8;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes shimmer-btn {
          0%,100% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
        }

        @keyframes pulse-subtle {
          0%,100% {
            box-shadow: 0 0 0 0 hsl(var(--primary) / 0.1);
          }
          50% {
            box-shadow: 0 0 0 8px hsl(var(--primary) / 0);
          }
        }
      `}</style>
    </div>
  );
}