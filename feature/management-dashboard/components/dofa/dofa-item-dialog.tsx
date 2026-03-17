"use client";

import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ResponsibleCombobox } from "./responsible-combobox";
import type { ItemDraft } from "./dofa-matrix.types";

export function DofaItemDialog({
  open,
  onOpenChange,
  mode,
  draft,
  setDraft,
  priorities,
  impactLevels,
  isBusy,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  draft: ItemDraft;
  setDraft: (updater: (prev: ItemDraft) => ItemDraft) => void;
  priorities: readonly string[];
  impactLevels: readonly string[];
  isBusy: boolean;
  onSubmit: (e: FormEvent) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Agregar ítem DOFA" : "Editar ítem DOFA"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Perspectiva</Label>
              <Input value={draft.perspective} disabled />
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Input value={draft.category} disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea
              value={draft.description}
              onChange={(e) =>
                setDraft((d) => ({ ...d, description: e.target.value }))
              }
              rows={4}
              placeholder="Describe el ítem..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select
                value={draft.priority}
                onValueChange={(value) =>
                  setDraft((d) => ({ ...d, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona..." />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Impacto</Label>
              <Select
                value={draft.impactLevel}
                onValueChange={(value) =>
                  setDraft((d) => ({ ...d, impactLevel: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona..." />
                </SelectTrigger>
                <SelectContent>
                  {impactLevels.map((lvl) => (
                    <SelectItem key={lvl} value={lvl}>
                      {lvl}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Orden</Label>
              <Input
                type="number"
                min={1}
                value={draft.order}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, order: Number(e.target.value) }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Responsable (ID)</Label>
            <ResponsibleCombobox
              value={draft.responsibleId}
              onChange={(nextUserId) =>
                setDraft((d) => ({ ...d, responsibleId: nextUserId }))
              }
              disabled={isBusy}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isBusy}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isBusy || !draft.description.trim()}>
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

