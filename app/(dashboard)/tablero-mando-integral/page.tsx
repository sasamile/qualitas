"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DEFAULT_DOFA_CATEGORIES,
  DEFAULT_DOFA_PERSPECTIVES,
  type CreateDofaAnalysisCommand,
} from "@/feature/management-dashboard/api/dofa";
import { DofaMatrix } from "@/feature/management-dashboard/components/dofa/dofa-matrix";
import {
  useDofaAnalysesQuery,
  useDofaAnalysisQuery,
  useDofaCreateAnalysisMutation,
} from "@/feature/management-dashboard/hooks/use-dofa";

type AnalysisDraft = {
  title: string;
  entityType: string;
  entityId: string;
  period: string;
  description: string;
};

function uniqueOrdered(values: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    if (!v) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

export default function TableroMandoIntegralPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryAnalysisId = searchParams.get("analysisId") ?? "";

  const analysesQuery = useDofaAnalysesQuery();
  const createAnalysisMutation = useDofaCreateAnalysisMutation();

  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>(
    queryAnalysisId,
  );
  const analysisQuery = useDofaAnalysisQuery(selectedAnalysisId || undefined);

  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [analysisDraft, setAnalysisDraft] = useState<AnalysisDraft>({
    title: "",
    entityType: "Organization",
    entityId: "",
    period: new Date().getFullYear().toString(),
    description: "",
  });

  useEffect(() => {
    if (queryAnalysisId && queryAnalysisId !== selectedAnalysisId) {
      setSelectedAnalysisId(queryAnalysisId);
    }
  }, [queryAnalysisId, selectedAnalysisId]);

  useEffect(() => {
    if (selectedAnalysisId) return;
    const first = analysesQuery.data?.[0]?.id;
    if (first) setSelectedAnalysisId(first);
  }, [analysesQuery.data, selectedAnalysisId]);

  const perspectives = useMemo(() => {
    const fromItems =
      analysisQuery.data?.items?.map((i) => i.perspective) ?? [];
    return uniqueOrdered([
      ...DEFAULT_DOFA_PERSPECTIVES,
      ...fromItems,
    ]);
  }, [analysisQuery.data]);

  const categories = useMemo(() => {
    const fromItems = analysisQuery.data?.items?.map((i) => i.category) ?? [];
    return uniqueOrdered([
      ...DEFAULT_DOFA_CATEGORIES,
      ...fromItems,
    ]);
  }, [analysisQuery.data]);

  const syncUrl = (analysisId: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (analysisId) next.set("analysisId", analysisId);
    else next.delete("analysisId");
    router.replace(`/tablero-mando-integral?${next.toString()}`);
  };

  const openCreateAnalysis = () => {
    setAnalysisDraft({
      title: "",
      entityType: "Organization",
      entityId: "",
      period: new Date().getFullYear().toString(),
      description: "",
    });
    setAnalysisDialogOpen(true);
  };

  const submitCreateAnalysis = async (e: FormEvent) => {
    e.preventDefault();
    const payload: CreateDofaAnalysisCommand = {
      title: analysisDraft.title.trim(),
      entityType: analysisDraft.entityType.trim(),
      entityId: analysisDraft.entityId.trim(),
      period: analysisDraft.period.trim() || null,
      description: analysisDraft.description.trim() || null,
    };

    if (!payload.title || !payload.entityType || !payload.entityId) return;
    const created = await createAnalysisMutation.mutateAsync(payload);
    if (created?.id) {
      setAnalysisDialogOpen(false);
      setSelectedAnalysisId(created.id);
      syncUrl(created.id);
    }
  };

  const isBusy = createAnalysisMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Tablero de Mando Integral
          </h1>
          <p className="text-sm text-muted-foreground">
            Configura y gestiona la Matriz DOFA por análisis.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Progreso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">-</div>
            <div className="text-xs text-muted-foreground mt-1">
              Indicadores en construcción
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Excedentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">-</div>
            <div className="text-xs text-muted-foreground mt-1">
              Indicadores en construcción
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Presupuesto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">-</div>
            <div className="text-xs text-muted-foreground mt-1">
              Indicadores en construcción
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cobertura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">-</div>
            <div className="text-xs text-muted-foreground mt-1">
              Indicadores en construcción
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base">Progreso de Actividades</CardTitle>
              <div className="text-sm text-muted-foreground">
                DOFA y módulos del tablero.
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <div className="min-w-[280px]">
                <Select
                  value={selectedAnalysisId}
                  onValueChange={(value) => {
                    setSelectedAnalysisId(value);
                    syncUrl(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un análisis DOFA" />
                  </SelectTrigger>
                  <SelectContent>
                    {(analysesQuery.data ?? []).map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.title}
                        {a.period ? ` (${a.period})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={openCreateAnalysis} disabled={isBusy}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo análisis
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="dofa" className="w-full">
            <TabsList className="flex flex-wrap justify-start">
              <TabsTrigger value="dofa">DOFA</TabsTrigger>
              <TabsTrigger value="dofa-horizontal" disabled>
                DOFA Horizontal
              </TabsTrigger>
              <TabsTrigger value="strategy" disabled>
                Estrategia y Objetivos
              </TabsTrigger>
              <TabsTrigger value="pe" disabled>
                PE
              </TabsTrigger>
              <TabsTrigger value="gc" disabled>
                GC
              </TabsTrigger>
              <TabsTrigger value="mc" disabled>
                MC
              </TabsTrigger>
              <TabsTrigger value="com" disabled>
                COM
              </TabsTrigger>
              <TabsTrigger value="prd" disabled>
                PRD
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dofa" className="mt-5">
              {!selectedAnalysisId ? (
                <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">
                  Crea o selecciona un análisis para empezar a configurar la matriz.
                </div>
              ) : analysisQuery.isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-[40%]" />
                  <Skeleton className="h-[380px] w-full" />
                </div>
              ) : !analysisQuery.data ? (
                <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">
                  No se pudo cargar el análisis seleccionado.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-foreground">
                        {analysisQuery.data.title}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {analysisQuery.data.description || "Sin descripción"}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {analysisQuery.data.period ? `Periodo: ${analysisQuery.data.period}` : ""}
                    </div>
                  </div>

                  <DofaMatrix
                    analysisId={analysisQuery.data.id}
                    items={analysisQuery.data.items ?? []}
                    perspectives={perspectives}
                    categories={categories}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={analysisDialogOpen} onOpenChange={setAnalysisDialogOpen}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Nuevo análisis DOFA</DialogTitle>
          </DialogHeader>

          <form onSubmit={submitCreateAnalysis} className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={analysisDraft.title}
                onChange={(e) =>
                  setAnalysisDraft((d) => ({ ...d, title: e.target.value }))
                }
                placeholder="DOFA 2026 - Mi Empresa"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Periodo</Label>
                <Input
                  value={analysisDraft.period}
                  onChange={(e) =>
                    setAnalysisDraft((d) => ({ ...d, period: e.target.value }))
                  }
                  placeholder="2026"
                />
              </div>
              <div className="space-y-2">
                <Label>Entity Type</Label>
                <Input
                  value={analysisDraft.entityType}
                  onChange={(e) =>
                    setAnalysisDraft((d) => ({
                      ...d,
                      entityType: e.target.value,
                    }))
                  }
                  placeholder="Organization"
                />
              </div>
              <div className="space-y-2">
                <Label>Entity ID</Label>
                <Input
                  value={analysisDraft.entityId}
                  onChange={(e) =>
                    setAnalysisDraft((d) => ({ ...d, entityId: e.target.value }))
                  }
                  placeholder="UUID"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={analysisDraft.description}
                onChange={(e) =>
                  setAnalysisDraft((d) => ({
                    ...d,
                    description: e.target.value,
                  }))
                }
                rows={4}
                placeholder="Análisis estratégico integral..."
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAnalysisDialogOpen(false)}
                disabled={isBusy}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  isBusy ||
                  !analysisDraft.title.trim() ||
                  !analysisDraft.entityType.trim() ||
                  !analysisDraft.entityId.trim()
                }
              >
                Crear
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
