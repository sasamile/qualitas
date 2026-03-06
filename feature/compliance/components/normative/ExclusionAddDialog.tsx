"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllMarcosNormativos, MarcoNormativoDto } from "../../api/marcos-normativos";
import { getAllClausulasRequisitos, ClausulaRequisitoDto } from "../../api/clausulas-requisitos";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    frameworkId: string;
    clauseId: string;
    justification: string;
    frameworkName: string;
    clauseNumber: string;
    clauseTitle: string;
  }) => void | Promise<void>;
  saving?: boolean;
}

export function ExclusionAddDialog({
  open,
  onOpenChange,
  onSubmit,
  saving = false,
}: Props) {
  const [frameworks, setFrameworks] = useState<MarcoNormativoDto[]>([]);
  const [clauses, setClauses] = useState<ClausulaRequisitoDto[]>([]);
  const [loadingFrameworks, setLoadingFrameworks] = useState(false);
  const [loadingClauses, setLoadingClauses] = useState(false);

  const [frameworkId, setFrameworkId] = useState("");
  const [clauseId, setClauseId] = useState("");
  const [justification, setJustification] = useState("");

  useEffect(() => {
    if (open) {
      loadFrameworks();
      setFrameworkId("");
      setClauseId("");
      setJustification("");
      setClauses([]);
    }
  }, [open]);

  useEffect(() => {
    if (frameworkId) {
      loadClauses(frameworkId);
      setClauseId("");
    } else {
      setClauses([]);
    }
  }, [frameworkId]);

  const loadFrameworks = async () => {
    setLoadingFrameworks(true);
    try {
      const data = await getAllMarcosNormativos(false);
      setFrameworks(data);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar marcos normativos");
    } finally {
      setLoadingFrameworks(false);
    }
  };

  const loadClauses = async (fwId: string) => {
    setLoadingClauses(true);
    try {
      const data = await getAllClausulasRequisitos(false, fwId);
      setClauses(data);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar cláusulas");
    } finally {
      setLoadingClauses(false);
    }
  };

  const handleSubmit = () => {
    if (!frameworkId || !clauseId || !justification.trim()) return;

    const selectedFramework = frameworks.find((f) => f.id === frameworkId);
    const selectedClause = clauses.find((c) => c.id === clauseId);

    if (!selectedFramework || !selectedClause) return;

    onSubmit({
      frameworkId,
      clauseId,
      justification,
      frameworkName: selectedFramework.name,
      clauseNumber: selectedClause.clauseNumber,
      clauseTitle: selectedClause.title,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar Exclusión</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Marco Normativo</Label>
            <Select
              value={frameworkId}
              onValueChange={setFrameworkId}
              disabled={loadingFrameworks || saving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un marco..." />
              </SelectTrigger>
              <SelectContent>
                {frameworks.map((fw) => (
                  <SelectItem key={fw.id} value={fw.id}>
                    {fw.code} - {fw.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cláusula / Requisito</Label>
            <Select
              value={clauseId}
              onValueChange={setClauseId}
              disabled={!frameworkId || loadingClauses || saving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un requisito..." />
              </SelectTrigger>
              <SelectContent>
                {clauses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.clauseNumber} - {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Justificación de Exclusión</Label>
            <Textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Explique por qué este requisito no aplica a la organización..."
              rows={4}
              disabled={saving}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              saving || !frameworkId || !clauseId || !justification.trim()
            }
          >
            {saving ? "Guardando..." : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
