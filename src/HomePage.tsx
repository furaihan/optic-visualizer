import { useSearch, Link } from "@tanstack/react-router";
import { Glasses, ArrowRight } from "lucide-react";

import { type SimulatorSearchParams } from "./routes/index";
import { translations } from "./lib/translations";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";

import { Badge } from "./components/ui/badge";
import { buttonVariants } from "./components/ui/button";

export function HomePage() {
  const search = useSearch({ strict: false }) as SimulatorSearchParams;

  const lang = search.lang || "id";
  const t = translations[lang];

  return (
    <div className="container mx-auto flex min-h-[90vh] max-w-6xl items-center px-4 py-12">
      <div className="w-full space-y-12">
        {/* Hero */}
        <section className="mx-auto max-w-3xl text-center">
          <Badge
            variant="secondary"
            className="mb-4 gap-2 px-3 py-1 text-sm"
          >
            <Glasses className="h-3.5 w-3.5" />
            Optical Simulation
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            {t.homeTitle}
          </h1>

          <p className="mt-4 text-lg text-muted-foreground">
            {t.homeSubtitle}
          </p>
        </section>

        {/* Features */}
        <section className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          <Card className="group transition-all hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                <Glasses className="h-6 w-6" />
              </div>

              <CardTitle>{t.homeLensVisualizer}</CardTitle>

              <CardDescription>
                {t.homeLensVisualizerDesc}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Link
                to="/visualizer"
                search={{ lang }}
                className={buttonVariants({ className: "w-full" })}
              >
                Open Simulator
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}