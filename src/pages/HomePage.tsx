import { useSearch, Link } from "@tanstack/react-router";
import { GlassesIcon, ArrowRightIcon } from "lucide-react";

import { type SimulatorSearchParams } from "@/src/routes/index";
import { translations } from "@/src/lib/translations";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import { Badge } from "@components/ui/badge";
import { buttonVariants } from "@components/ui/button";

export function HomePage() {
  const search = useSearch({ strict: false }) as SimulatorSearchParams;

  const lang = search.lang || "id";
  const t = translations[lang];

  return (
    <div className="relative">
      {/* Subtle background accent */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-48 -top-48 h-96 w-96 rounded-full opacity-[0.03] blur-3xl"></div>
        <div className="absolute -left-48 bottom-0 h-96 w-96 rounded-full opacity-[0.03] blur-3xl"></div>
      </div>

      <div className="container mx-auto flex min-h-[90vh] max-w-6xl items-center px-4 py-12">
        <div className="w-full space-y-16">
          {/* Hero */}
          <section className="mx-auto max-w-3xl text-center">
            <div className="mb-8 flex justify-center">
              <Badge
                variant="secondary"
                className="gap-2 border border-transparent px-3.5 py-1.5 text-xs font-medium transition-all hover:border-current/20"
              >
                <GlassesIcon className="h-3.5 w-3.5" />
                Optical Simulation
              </Badge>
            </div>

            <h1 className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-5xl font-bold tracking-tighter sm:text-7xl text-transparent">
              {t.homeTitle}
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              {t.homeSubtitle}
            </p>
          </section>

          {/* Features */}
          <section className="mx-auto grid max-w-4xl gap-6 md:grid-cols-1">
            <Card className="group relative overflow-hidden border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:border-foreground/10">
              {/* Hover background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-foreground/[0.01] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <CardHeader className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 transition-transform duration-300 group-hover:scale-110">
                  <GlassesIcon className="h-7 w-7" />
                </div>

                <CardTitle className="text-2xl font-semibold tracking-tight">
                  {t.homeLensVisualizer}
                </CardTitle>

                <CardDescription className="mt-3 text-base leading-relaxed">
                  {t.homeLensVisualizerDesc}
                </CardDescription>
              </CardHeader>

              <CardContent className="relative">
                <Link
                  to="/visualizer"
                  search={{ lang }}
                  className={buttonVariants({
                    className:
                      "w-full group/btn relative overflow-hidden transition-all duration-300",
                  })}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Open Simulator
                    <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
                  </span>
                </Link>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}