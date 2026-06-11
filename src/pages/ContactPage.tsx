import React, { useState, useEffect } from "react";
import { ArrowLeftIcon, ZapIcon, SparklesIcon, Code2Icon, RocketIcon, StarIcon, HeartIcon, AlertCircleIcon, CheckCircle2Icon, MailIcon, PhoneIcon, MapPinIcon, GlobeIcon, Share2Icon, MessageCircleIcon } from "lucide-react";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { ScrollArea } from "@components/ui/scroll-area";
import {
  Card,
  CardContent,
} from "@components/ui/card";

export function ContactPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Only track mouse on non-touch devices
    if (!window.matchMedia("(hover: none)").matches) {
      const handleMouseMove = (e: MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      };
      window.addEventListener("mousemove", handleMouseMove);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("resize", checkMobile);
      };
    }

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-linear-to-br from-background via-background to-muted/30 text-foreground">
      {/* Spotlight Effect - Disabled on mobile/touch for performance */}
      {!isMobile && (
        <div
          className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.12), transparent 40%)`,
          }}
        />
      )}

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        
        {/* Orbiting Decoration - Smaller on mobile */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/5" 
          style={{ 
            width: 'clamp(400px, 80vw, 800px)',
            aspectRatio: '1',
            animation: 'spin-slow 40s linear infinite' 
          }}
        >
          <div className="absolute top-0 left-1/2 rounded-full bg-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.6)] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center" style={{ width: 'clamp(12px, 2vw, 16px)', aspectRatio: '1' }}>
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
          <div className="absolute bottom-0 left-1/2 rounded-full bg-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.6)] -translate-x-1/2 translate-y-1/2 flex items-center justify-center" style={{ width: 'clamp(10px, 1.5vw, 12px)', aspectRatio: '1' }}>
             <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
        </div>

        <div
          className="absolute rounded-full blur-3xl opacity-20 bg-primary"
          style={{
            width: 'clamp(200px, 50vw, 384px)',
            aspectRatio: '1',
            top: "10%",
            left: "10%",
            animation: "float 8s ease-in-out infinite",
          }}
        />

        <div
          className="absolute rounded-full blur-3xl opacity-20 bg-cyan-500"
          style={{
            width: 'clamp(200px, 50vw, 384px)',
            aspectRatio: '1',
            bottom: "10%",
            right: "10%",
            animation: "float 10s ease-in-out infinite reverse",
          }}
        />

        <div
          className="absolute rounded-full blur-2xl opacity-15 bg-purple-500"
          style={{
            width: 'clamp(150px, 40vw, 256px)',
            aspectRatio: '1',
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            animation: "float-gentle 12s ease-in-out infinite",
          }}
        />

        {/* Floating particles - Fewer on mobile */}
        {[...Array(isMobile ? 6 : 12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/40"
            style={{
              width: Math.random() * 4 + 2 + "px",
              height: Math.random() * 4 + 2 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              animation: `float-particle ${Math.random() * 10 + 15}s linear infinite`,
              animationDelay: `-${Math.random() * 15}s`,
            }}
          />
        ))}

        {/* Grid pattern - Subtle on mobile */}
        <svg
          className="absolute inset-0 w-full h-full stroke-primary"
          style={{ 
            opacity: isMobile ? 0.05 : 0.1,
            animation: "grid-shift 20s linear infinite" 
          }}
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

        {/* Floating Icons - Background decoration */}
        <div className="absolute top-20 left-10 text-primary/20 animate-bounce" style={{ animationDuration: '3s' }}>
          <SparklesIcon size={24} />
        </div>
        <div className="absolute top-1/3 right-12 text-cyan-500/20 animate-pulse">
          <Code2Icon size={28} />
        </div>
        <div className="absolute bottom-1/3 left-1/4 text-purple-500/20 animate-bounce" style={{ animationDuration: '4s' }}>
          <RocketIcon size={26} />
        </div>
        <div className="absolute top-2/3 right-1/4 text-blue-500/20 animate-spin" style={{ animationDuration: '6s' }}>
          <ZapIcon size={22} />
        </div>
      </div>

      {/* Main content */}
      <ScrollArea className="h-screen w-full relative z-10">
        <div className="flex flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8 min-h-screen">
          <div className="w-full max-w-2xl mx-auto text-center space-y-6 sm:space-y-8">
          {/* Badge with icons */}
          <div className="inline-block">
            <Badge
              variant="secondary"
              className="px-4 py-2 sm:px-6 sm:py-3 rounded-full text-xs sm:text-sm font-semibold tracking-widest uppercase backdrop-blur-md border border-primary/20 inline-flex items-center gap-2"
              style={{
                animation: "shimmer 3s ease-in-out infinite",
              }}
            >
              <SparklesIcon size={14} />
              Coming Soon
              <SparklesIcon size={14} />
            </Badge>
          </div>

          {/* Heading with decorative icons */}
          <div
            style={{
              animation: "fade-in-up 0.8s ease-out 0.2s forwards",
              opacity: 0,
            }}
          >
            <div className="flex justify-center gap-2 mb-4 sm:mb-6">
              <StarIcon className="text-yellow-500 animate-bounce" size={20} style={{ animationDelay: '0s' }} />
              <HeartIcon className="text-red-500 animate-bounce" size={20} style={{ animationDelay: '0.1s' }} />
              <ZapIcon className="text-orange-500 animate-bounce" size={20} style={{ animationDelay: '0.2s' }} />
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter leading-tight relative inline-block group">
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
                className="inline-block bg-linear-to-r from-primary via-cyan-500 to-blue-500 bg-clip-text text-transparent relative"
                style={{
                  animation:
                    "slide-in-letter 0.6s ease-out 0.5s forwards",
                  opacity: 0,
                }}
              >
                Placeholder Page
                {/* Animated underline */}
                <span 
                  className="absolute -bottom-1 sm:-bottom-2 left-0 h-1 sm:h-[4px] rounded-full bg-linear-to-r from-primary via-cyan-500 to-purple-500 bg-size-[200%_auto] w-full origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"
                  style={{
                    animation: "gradient-shift 3s linear infinite",
                  }}
                />
              </span>
            </h1>
          </div>

          {/* Subtitle with icon */}
          <p
            className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mt-4 sm:mt-6 relative inline-block group px-2 flex items-center justify-center gap-2"
            style={{
              animation: "fade-in-up 0.8s ease-out 0.6s forwards",
              opacity: 0,
            }}
          >
            Lorem ipsum dolor sit amet lorep ipsum dolor sit amet
            <span 
              className="absolute -bottom-0.5 sm:-bottom-1 left-0 h-px sm:h-[2px] rounded-full bg-muted-foreground/30 w-full origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"
            />
          </p>

          {/* Notice Card with Border Gradient and icons */}
          <div
            className="mt-8 sm:mt-12 p-px rounded-lg sm:rounded-xl bg-linear-to-r from-primary/50 via-cyan-500/50 to-purple-500/50 bg-size-[200%_auto] relative group hover:-translate-y-2 transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-primary/20 w-full"
            style={{
              animation:
                "fade-in-up 0.8s ease-out 0.8s forwards, gradient-shift 4s linear infinite",
              opacity: 0,
            }}
          >
            {/* Glow behind card */}
            <div className="absolute inset-0 bg-linear-to-r from-primary/30 via-cyan-500/30 to-purple-500/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg sm:rounded-xl" />
            
            <Card
              className="bg-background/80 backdrop-blur-md border-none overflow-hidden relative z-10 w-full"
              style={{
                animation:
                  "pulse-subtle 3s ease-in-out 1s infinite",
              }}
            >
              <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 text-left">
                  <AlertCircleIcon size={28} className="text-yellow-500 shrink-0" />

                  <div className="min-w-0 flex-1">
                    <h3 className="font-mono font-bold text-xs sm:text-sm uppercase tracking-wider mb-2 text-primary flex items-center gap-2">
                      <Code2Icon size={16} />
                      Placeholder Route
                    </h3>

                    <p className="text-xs sm:text-sm leading-relaxed font-mono text-muted-foreground break-words">
                      This route is a work-in-progress placeholder
                      reserved for future TanStack Start
                      implementation. Navigate back to the main
                      simulator to continue.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Cards with icons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-8 sm:mt-12 w-full">
            <div
              className="p-4 rounded-lg bg-primary/5 border border-primary/20 backdrop-blur-sm hover:bg-primary/10 transition-colors"
              style={{
                animation: "fade-in-up 0.8s ease-out 1s forwards",
                opacity: 0,
              }}
            >
              <MailIcon className="text-primary mb-2" size={24} />
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Email</p>
              <p className="text-sm font-mono text-foreground truncate">contact@example.com</p>
            </div>

            <div
              className="p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/20 backdrop-blur-sm hover:bg-cyan-500/10 transition-colors"
              style={{
                animation: "fade-in-up 0.8s ease-out 1.1s forwards",
                opacity: 0,
              }}
            >
              <PhoneIcon className="text-cyan-500 mb-2" size={24} />
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">PhoneIcon</p>
              <p className="text-sm font-mono text-foreground truncate">+1 (555) 000-0000</p>
            </div>

            <div
              className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20 backdrop-blur-sm hover:bg-purple-500/10 transition-colors"
              style={{
                animation: "fade-in-up 0.8s ease-out 1.2s forwards",
                opacity: 0,
              }}
            >
              <MapPinIcon className="text-purple-500 mb-2" size={24} />
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Location</p>
              <p className="text-sm font-mono text-foreground truncate">Yogyakarta, Indonesia</p>
            </div>
          </div>

          {/* Social Links with icons */}
          <div
            className="flex justify-center gap-3 sm:gap-4 mt-8 sm:mt-12"
            style={{
              animation: "fade-in-up 0.8s ease-out 1.3s forwards",
              opacity: 0,
            }}
          >
            <a
              href="#"
              className="p-3 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all hover:shadow-lg hover:shadow-primary/20 hover:scale-110"
              aria-label="Website"
            >
              <GlobeIcon size={20} className="text-primary" />
            </a>
            <a
              href="#"
              className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/20 hover:scale-110"
              aria-label="Network"
            >
              <Share2Icon size={20} className="text-blue-500" />
            </a>
            <a
              href="#"
              className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-110"
              aria-label="Social"
            >
              <MessageCircleIcon size={20} className="text-cyan-500" />
            </a>
          </div>

          {/* Back Button with enhanced icons */}
          <div
            style={{
              animation: "fade-in-up 0.8s ease-out 1.4s forwards",
              opacity: 0,
            }}
          >
            <Button
              size="lg"
              onClick={() => window.history.back()}
              className="group relative overflow-hidden mt-4 sm:mt-6 hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 w-full sm:w-auto"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform shrink-0" />
              <span>Back to Homepage</span>
              <RocketIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform shrink-0" />

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

          {/* Status indicator with icon */}
          <div
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-6 sm:mt-8"
            style={{
              animation: "fade-in-up 0.8s ease-out 1.5s forwards",
              opacity: 0,
            }}
          >
            <CheckCircle2Icon size={16} className="text-green-500" />
            <span>Page status: Ready for development</span>
          </div>
        </div>
        </div>
      </ScrollArea>

      {/* Animations */}
      <style>{`
        @keyframes float {
          0%,100% {
            transform: translate(0,0);
          }
          33% {
            transform: translate(clamp(10px, 5vw, 30px), clamp(-10px, -5vw, -30px));
          }
          66% {
            transform: translate(clamp(-10px, -5vw, -20px), clamp(10px, 5vw, 20px));
          }
        }

        @keyframes float-gentle {
          0%,100% {
            transform: translate(-50%,-50%);
          }
          50% {
            transform: translate(-50%, calc(-50% - clamp(5px, 3vw, 10px)));
          }
        }

        @keyframes float-particle {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          20% {
            opacity: 0.5;
          }
          80% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-200px) scale(0.5);
            opacity: 0;
          }
        }

        @keyframes spin-slow {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes expand-underline {
          0% {
            transform: scaleX(0);
          }
          100% {
            transform: scaleX(1);
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

        /* Mobile optimizations */
        @media (max-width: 640px) {
          /* Reduce animation intensity on mobile */
          @keyframes float {
            0%,100% {
              transform: translate(0,0);
            }
            33% {
              transform: translate(15px, -15px);
            }
            66% {
              transform: translate(-10px, 10px);
            }
          }

          /* Disable hover states on touch devices */
          @media (hover: none) {
            .group:hover,
            .group-hover\:scale-x-100,
            .group-hover\:opacity-100 {
              transform: none !important;
              opacity: initial !important;
            }
          }
        }
      `}</style>
    </div>
  );
}