"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Check, ChevronsUpDown, Plus, Pencil, Trash2 } from "lucide-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { usersApi } from "@/feature/user/api/users";
import type { UserDto } from "@/feature/user/types";
import {
  DEFAULT_DOFA_IMPACT_LEVELS,
  DEFAULT_DOFA_PRIORITIES,
  type CreateDofaItemCommand,
  type DofaItemDto,
  type UpdateDofaItemCommand,
} from "../../api/dofa";
import {
  useDofaCreateItemMutation,
  useDofaDeactivateItemMutation,
  useDofaUpdateItemMutation,
} from "../../hooks/use-dofa";

type MatrixCellKey = `${string}__${string}`;

type ItemDraft = {
  perspective: string;
  category: string;
  description: string;
  priority: string;
  impactLevel: string;
  order: number;
  responsibleId: string;
};

function getUserLabel(user: UserDto) {
  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  if (fullName) return `${fullName} • ${user.email}`;
  return user.email;
}

function ResponsibleCombobox({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (nextUserId: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);

  const usersQuery = useQuery({
    queryKey: ["users", "search", { search: debouncedSearch, isActive: true }],
    queryFn: async () => {
      return usersApi.search({
        page: 1,
        pageSize: 10,
        search: debouncedSearch || undefined,
        isActive: true,
      });
    },
    enabled: open,
    placeholderData: keepPreviousData,
  });

  const users = usersQuery.data?.items ?? [];
  const selectedUser = value ? users.find((u) => u.id === value) : undefined;
  const selectedLabel = selectedUser ? getUserLabel(selectedUser) : value;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between w-full font-normal"
          disabled={disabled}
        >
          <span className="truncate">
            {value ? selectedLabel : "Selecciona un responsable..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar por nombre o correo..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {usersQuery.isFetching ? "Buscando..." : "No se encontraron usuarios."}
            </CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="__none__"
                onSelect={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                <Check
                  className={cn("mr-2 h-4 w-4", !value ? "opacity-100" : "opacity-0")}
                />
                <span>Sin responsable</span>
              </CommandItem>
              {users.map((u) => (
                <CommandItem
                  key={u.id}
                  value={getUserLabel(u)}
                  onSelect={() => {
                    onChange(u.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === u.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium truncate">
                      {`${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {u.email}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function normalizeItems(items: DofaItemDto[]) {
  return (items ?? []).filter((i) => i.isActive !== false);
}

function categoryHeaderClass(category: string) {
  const key = category.toLowerCase();
  if (key.includes("fort")) return "bg-blue-600 text-white";
  if (key.includes("debil")) return "bg-red-600 text-white";
  if (key.includes("opor")) return "bg-emerald-600 text-white";
  if (key.includes("amen")) return "bg-orange-600 text-white";
  return "bg-muted text-foreground";
}

function perspectiveCardClass(index: number) {
  const colors = [
    "bg-sky-500/10 border-sky-500/20",
    "bg-emerald-500/10 border-emerald-500/20",
    "bg-yellow-500/10 border-yellow-500/20",
    "bg-violet-500/10 border-violet-500/20",
  ];
  return colors[index % colors.length];
}

function priorityBadgeVariant(priority: string) {
  const key = priority.toLowerCase();
  if (key.includes("alta")) return "destructive";
  if (key.includes("media")) return "secondary";
  return "outline";
}

export function DofaMatrix({
  analysisId,
  items,
  perspectives,
  categories,
  className,
}: {
  analysisId: string;
  items: DofaItemDto[];
  perspectives: string[];
  categories: string[];
  className?: string;
}) {
  const createItemMutation = useDofaCreateItemMutation();
  const updateItemMutation = useDofaUpdateItemMutation();
  const deactivateItemMutation = useDofaDeactivateItemMutation();

  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [itemDialogMode, setItemDialogMode] = useState<"create" | "edit">(
    "create",
  );
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    itemId: string | null;
    title: string;
  }>({ open: false, itemId: null, title: "" });

  const [draft, setDraft] = useState<ItemDraft>({
    perspective: "",
    category: "",
    description: "",
    priority: DEFAULT_DOFA_PRIORITIES[0] ?? "Alta",
    impactLevel: DEFAULT_DOFA_IMPACT_LEVELS[0] ?? "Alto",
    order: 1,
    responsibleId: "",
  });

  const activeItems = useMemo(() => normalizeItems(items), [items]);

  const itemsByCell = useMemo(() => {
    const map = new Map<MatrixCellKey, DofaItemDto[]>();
    for (const item of activeItems) {
      const key: MatrixCellKey = `${item.perspective}__${item.category}`;
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    for (const [key, list] of map.entries()) {
      list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      map.set(key, list);
    }
    return map;
  }, [activeItems]);

  const columnCount = Math.max(categories.length + 1, 2);
  const gridTemplateColumns = `220px repeat(${columnCount - 1}, minmax(260px, 1fr))`;

  const openCreateDialog = (perspective: string, category: string) => {
    setItemDialogMode("create");
    setEditingItemId(null);
    setDraft({
      perspective,
      category,
      description: "",
      priority: DEFAULT_DOFA_PRIORITIES[0] ?? "Alta",
      impactLevel: DEFAULT_DOFA_IMPACT_LEVELS[0] ?? "Alto",
      order:
        (itemsByCell.get(`${perspective}__${category}`)?.slice(-1)[0]?.order ??
          0) + 1,
      responsibleId: "",
    });
    setItemDialogOpen(true);
  };

  const openEditDialog = (item: DofaItemDto) => {
    setItemDialogMode("edit");
    setEditingItemId(item.id);
    setDraft({
      perspective: item.perspective,
      category: item.category,
      description: item.description ?? "",
      priority: item.priority ?? (DEFAULT_DOFA_PRIORITIES[0] ?? "Alta"),
      impactLevel: item.impactLevel ?? (DEFAULT_DOFA_IMPACT_LEVELS[0] ?? "Alto"),
      order: item.order ?? 1,
      responsibleId: item.responsibleId ?? "",
    });
    setItemDialogOpen(true);
  };

  const submitDraft = async (e: FormEvent) => {
    e.preventDefault();
    const payloadBase = {
      perspective: draft.perspective,
      category: draft.category,
      description: draft.description.trim(),
      priority: draft.priority,
      impactLevel: draft.impactLevel || null,
      order: Number.isFinite(draft.order) ? draft.order : 1,
      responsibleId: draft.responsibleId.trim() || null,
    };

    if (!payloadBase.description) return;

    if (itemDialogMode === "create") {
      await createItemMutation.mutateAsync({
        analysisId,
        payload: payloadBase as CreateDofaItemCommand,
      });
      setItemDialogOpen(false);
    } else if (editingItemId) {
      await updateItemMutation.mutateAsync({
        analysisId,
        itemId: editingItemId,
        payload: payloadBase as UpdateDofaItemCommand,
      });
      setItemDialogOpen(false);
    }
  };

  const isBusy =
    createItemMutation.isPending ||
    updateItemMutation.isPending ||
    deactivateItemMutation.isPending;

  return (
    <div className={cn("w-full", className)}>
      <div className="grid gap-3" style={{ gridTemplateColumns }}>
        <div className="h-10 flex items-center px-3 text-sm font-medium text-muted-foreground">
          Perspectiva
        </div>
        {categories.map((category) => (
          <div
            key={category}
            className={cn(
              "h-10 flex items-center justify-center rounded-md text-sm font-semibold",
              categoryHeaderClass(category),
            )}
          >
            {category.endsWith("s") ? category : `${category}s`}
          </div>
        ))}

        {perspectives.map((perspective, rowIndex) => (
          <div key={perspective} className="contents">
            <div
              className={cn(
                "rounded-lg border p-4 flex items-center justify-center text-sm font-semibold text-foreground min-h-[140px]",
                perspectiveCardClass(rowIndex),
              )}
            >
              <span className="text-center leading-snug">
                {perspective === "ProcesosInternos"
                  ? "Procesos Internos"
                  : perspective === "AprendizajeYCrecimiento"
                    ? "Aprendizaje y Crecimiento"
                    : perspective}
              </span>
            </div>

            {categories.map((category) => {
              const cellKey: MatrixCellKey = `${perspective}__${category}`;
              const cellItems = itemsByCell.get(cellKey) ?? [];

              return (
                <div
                  key={cellKey}
                  className="rounded-lg border bg-card min-h-[140px] p-3 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openCreateDialog(perspective, category)}
                      disabled={isBusy}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {cellItems.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
                      Sin ítems
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {cellItems.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-md border bg-background px-3 py-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-sm text-foreground leading-snug break-words">
                                {item.description}
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                <Badge variant="outline" className="text-[11px]">
                                  #{item.order}
                                </Badge>
                                <Badge
                                  variant={priorityBadgeVariant(item.priority)}
                                  className="text-[11px]"
                                >
                                  {item.priority}
                                </Badge>
                                {item.impactLevel ? (
                                  <Badge variant="secondary" className="text-[11px]">
                                    {item.impactLevel}
                                  </Badge>
                                ) : null}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditDialog(item)}
                                disabled={isBusy}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() =>
                                  setDeleteDialog({
                                    open: true,
                                    itemId: item.id,
                                    title: item.description,
                                  })
                                }
                                disabled={isBusy}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>
              {itemDialogMode === "create" ? "Agregar ítem DOFA" : "Editar ítem DOFA"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={submitDraft} className="space-y-4">
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
                  onValueChange={(value) => setDraft((d) => ({ ...d, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_DOFA_PRIORITIES.map((p) => (
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
                    {DEFAULT_DOFA_IMPACT_LEVELS.map((lvl) => (
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
                onClick={() => setItemDialogOpen(false)}
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

      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((d) => ({ ...d, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desactivar ítem</AlertDialogTitle>
            <AlertDialogDescription>
              Este ítem se desactivará y no se mostrará en la matriz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="text-sm text-muted-foreground border rounded-md p-3 bg-muted/30">
            {deleteDialog.title}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBusy}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isBusy || !deleteDialog.itemId}
              onClick={async () => {
                if (!deleteDialog.itemId) return;
                await deactivateItemMutation.mutateAsync({
                  analysisId,
                  itemId: deleteDialog.itemId,
                });
                setDeleteDialog({ open: false, itemId: null, title: "" });
              }}
            >
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
