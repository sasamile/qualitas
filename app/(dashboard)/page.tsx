"use client";

import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  Zap,
  FileWarning,
  TrendingUp,
  Network,
  Flame,
  ChevronRight,
  ListTodo,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const KPIS = [
  {
    title: "Cumplimiento Global",
    value: "0%",
    sub: "+5%",
    subLabel: "vs mes anterior",
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
  },
  {
    title: "Riesgos Críticos",
    value: "0",
    sub: "Requieren atención",
    icon: AlertTriangle,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
  },
  {
    title: "Auditorías Abiertas",
    value: "12",
    sub: "2 esta semana",
    icon: ClipboardList,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
  },
  {
    title: "Acciones Activas",
    value: "0",
    sub: "0 pendientes",
    icon: Zap,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/10 dark:bg-violet-500/20",
  },
  {
    title: "NC Abiertas",
    value: "6",
    sub: "+2",
    subLabel: "nuevas",
    icon: FileWarning,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10 dark:bg-rose-500/20",
  },
  {
    title: "Índice FURAG",
    value: "82.4",
    sub: "+3.1",
    subLabel: "tendencia",
    icon: TrendingUp,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-500/10 dark:bg-sky-500/20",
  },
];

/** Intensidad de riesgo por celda (impacto x probabilidad): 1=bajo, 5=extremo */
function heatLevel(row: number, col: number): number {
  return Math.max(1, Math.min(5, 6 - row + col - 1));
}

const HEAT_COLORS: Record<number, string> = {
  1: "bg-emerald-400/70 dark:bg-emerald-500/40",
  2: "bg-lime-400/70 dark:bg-lime-500/40",
  3: "bg-amber-400/70 dark:bg-amber-500/40",
  4: "bg-orange-400/70 dark:bg-orange-500/40",
  5: "bg-rose-400/70 dark:bg-rose-500/40",
};

export default function DashboardPage() {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">
          Resumen Ejecutivo
        </h1>
        <p className="text-sm text-muted-foreground">
          Visión general del cumplimiento normativo, riesgos e indicadores.
        </p>
      </header>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {KPIS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={kpi.title}
              className="overflow-hidden transition-shadow hover:shadow-md"
            >
              <CardContent className="flex flex-row items-start gap-4 p-5">
                <div
                  className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${kpi.bg} ${kpi.color}`}
                >
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </p>
                  <p className="text-2xl font-bold tracking-tight">
                    {kpi.value}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>{kpi.sub}</span>
                    {kpi.subLabel && (
                      <span className="text-muted-foreground/80">
                        · {kpi.subLabel}
                      </span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Estructura de Procesos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1.5">
              <CardTitle className="flex items-center gap-2 text-base">
                <Network className="size-4 text-muted-foreground" />
                Estructura de Procesos
              </CardTitle>
              <CardDescription>
                Mapa y directorio de procesos de la organización.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/procesos" className="gap-1">
                Ver todo
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center">
              <Network className="mx-auto size-10 text-muted-foreground/60" />
              <p className="mt-2 text-sm font-medium text-foreground">
                Sin procesos registrados
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Ve a{" "}
                <Link
                  href="/procesos"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Procesos
                </Link>{" "}
                o &quot;Plan de Acción&quot; para crear el primero.
              </p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href="/procesos">Ir a Procesos</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mapa de Calor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Flame className="size-4 text-muted-foreground" />
              Mapa de Calor
            </CardTitle>
            <CardDescription>
              Riesgo por impacto y probabilidad (Impacto ↑, Probabilidad →).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>Impacto ↑</span>
                <span>Probabilidad →</span>
              </div>
              <div className="grid grid-cols-5 gap-0.5" style={{ aspectRatio: "1" }}>
                {[5, 4, 3, 2, 1].map((row) =>
                  [1, 2, 3, 4, 5].map((col) => {
                    const level = heatLevel(row, col);
                    return (
                      <div
                        key={`${row}-${col}`}
                        className={`flex items-center justify-center rounded-sm text-xs font-medium text-foreground/90 ${HEAT_COLORS[level]}`}
                        title={`Impacto ${row}, Probabilidad ${col}`}
                      >
                        {level}
                      </div>
                    );
                  })
                )}
              </div>
              <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                <span>Bajo</span>
                <span>Medio</span>
                <span>Alto</span>
                <span>Extremo</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones Recientes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2 text-base">
              <ListTodo className="size-4 text-muted-foreground" />
              Acciones Recientes
            </CardTitle>
            <CardDescription>
              Últimas acciones y tareas asignadas.
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="#" className="gap-1">
              Ver todas
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center">
            <ListTodo className="mx-auto size-10 text-muted-foreground/60" />
            <p className="mt-2 text-sm font-medium text-foreground">
              Sin acciones recientes
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Las acciones y tareas aparecerán aquí cuando existan.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
