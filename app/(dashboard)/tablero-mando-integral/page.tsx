"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/feature/auth/store/auth.store";
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
  useDofaDeleteAnalysisMutation,
} from "@/feature/management-dashboard/hooks/use-dofa";
import { organizationsApi } from "@/feature/organization/api/organizations";

type AnalysisDraft = {
  title: string;
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
  const tenant = useAuthStore((s) => s.user?.tenant ?? "root");
  const analysesQuery = useDofaAnalysesQuery();
  const createAnalysisMutation = useDofaCreateAnalysisMutation();
  const deleteAnalysisMutation = useDofaDeleteAnalysisMutation();

  const [organization, setOrganization] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isOrganizationLoading, setIsOrganizationLoading] = useState(true);

  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [analysisDraft, setAnalysisDraft] = useState<AnalysisDraft>({
    title: "",
    entityId: "",
    period: new Date().getFullYear().toString(),
    description: "",
  });

  const analysesForOrganization = useMemo(() => {
    const list = analysesQuery.data ?? [];
    const orgId = organization?.id;
    if (!orgId) return list;
    const hasEntityInfo = list.some((a) => a.entityId || a.entityType);
    if (!hasEntityInfo) return list;
    return list.filter((a) => {
      const type = (a.entityType ?? "").toLowerCase();
      return type === "organization".toLowerCase() && a.entityId === orgId;
    });
  }, [analysesQuery.data, organization?.id]);

  const activeAnalysisId = analysesForOrganization[0]?.id ?? "";
  const analysisQuery = useDofaAnalysisQuery(activeAnalysisId || undefined);

  useEffect(() => {
    let cancelled = false;

    const loadOrganization = async () => {
      setIsOrganizationLoading(true);
      try {
        const list = await organizationsApi.list();
        const matched = list.find((o) => o.code === tenant) ?? list[0] ?? null;
        if (cancelled) return;
        if (!matched) {
          setOrganization(null);
          return;
        }
        setOrganization({ id: matched.id, name: matched.name });
        setAnalysisDraft((d) => ({
          ...d,
          entityId: d.entityId || matched.id,
        }));
      } finally {
        if (!cancelled) setIsOrganizationLoading(false);
      }
    };

    loadOrganization();

    return () => {
      cancelled = true;
    };
  }, [tenant]);

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

  const openCreateAnalysis = () => {
    setAnalysisDraft({
      title: "",
      entityId: organization?.id ?? "",
      period: new Date().getFullYear().toString(),
      description: "",
    });
    setAnalysisDialogOpen(true);
  };

  const submitCreateAnalysis = async (e: FormEvent) => {
    e.preventDefault();
    const entityId = organization?.id ?? analysisDraft.entityId.trim();
    const payload: CreateDofaAnalysisCommand = {
      title: analysisDraft.title.trim(),
      entityType: "Organization",
      entityId,
      period: analysisDraft.period.trim() || null,
      description: analysisDraft.description.trim() || null,
    };

    if (!payload.title || !payload.entityType || !payload.entityId) return;
    const created = await createAnalysisMutation.mutateAsync(payload);
    if (created?.id) {
      setAnalysisDialogOpen(false);
    }
  };

  const isBusy = createAnalysisMutation.isPending || deleteAnalysisMutation.isPending;

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
              {activeAnalysisId ? (
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={isBusy}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar análisis
                </Button>
              ) : (
                <Button
                  onClick={openCreateAnalysis}
                  disabled={isBusy || isOrganizationLoading || !organization?.id}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo análisis
                </Button>
              )}
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
              {!activeAnalysisId ? (
                <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">
                  Crea un análisis DOFA para empezar a configurar la matriz.
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <Label>Organización</Label>
                <Input
                  value={
                    isOrganizationLoading
                      ? "Cargando..."
                      : organization
                        ? organization.name
                        : "Sin organización"
                  }
                  disabled
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
                  !organization?.id
                }
              >
                Crear
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar análisis DOFA</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el análisis y todos sus ítems asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBusy}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isBusy || !activeAnalysisId}
              onClick={async () => {
                if (!activeAnalysisId) return;
                const ok = await deleteAnalysisMutation.mutateAsync(activeAnalysisId);
                if (ok) setDeleteDialogOpen(false);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
