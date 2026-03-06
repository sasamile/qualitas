"use client";

import type { PagedResponse, UserWithOrg } from "../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal } from "lucide-react";

const SKELETON_ROWS = 10;

interface UserTableProps {
  data?: PagedResponse<UserWithOrg>;
  isLoading: boolean;
  error?: Error | null;
  page: number;
  onPageChange: (page: number) => void;
  onEditUser?: (user: UserWithOrg) => void;
  onToggleActiveUser?: (user: UserWithOrg) => void;
}

export function UserTable({
  data,
  isLoading,
  error,
  page,
  onPageChange,
  onEditUser,
  onToggleActiveUser,
}: UserTableProps) {
  const formatLastAccess = (iso?: string | null) => {
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "hace unos segundos";
    if (diffMinutes < 60) return `hace ${diffMinutes} min`;
    if (diffHours < 24) return `hace ${diffHours} h`;
    return `hace ${diffDays} días`;
  };

  if (isLoading) {
    return (
      <div className="mt-4 rounded-lg border border-border bg-card">
        {/* Cabecera de tabla */}
        <div className="hidden border-b border-border/80 bg-muted/60 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground md:block">
          <div className="grid grid-cols-[minmax(0,2fr),minmax(0,1fr),minmax(0,1.2fr),minmax(0,1fr),minmax(0,1fr),minmax(0,1fr),auto] gap-4">
            <span>Usuario / Email</span>
            <span>Cargo</span>
            <span>Área (dependencia)</span>
            <span>Rol sistema</span>
            <span>Estado</span>
            <span>Último acceso</span>
            <span className="text-right">Acciones</span>
          </div>
        </div>

        {/* Filas skeleton responsivas (no se salen de la pantalla) */}
        <div className="divide-y divide-border/60">
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 px-4 py-3 md:grid md:grid-cols-[minmax(0,2fr),minmax(0,1fr),minmax(0,1.2fr),minmax(0,1fr),minmax(0,1fr),minmax(0,1fr),auto] md:items-center md:gap-4"
            >
              {/* Usuario / Email */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-4 w-32 max-w-full" />
                  <Skeleton className="h-3 w-44 max-w-full" />
                </div>
              </div>

              {/* Cargo */}
              <div className="hidden md:block">
                <Skeleton className="h-4 w-24 max-w-full" />
              </div>

              {/* Área */}
              <div className="hidden md:block">
                <Skeleton className="h-4 w-28 max-w-full" />
              </div>

              {/* Rol */}
              <div className="hidden md:block">
                <Skeleton className="h-5 w-20 max-w-full rounded-full" />
              </div>

              {/* Estado */}
              <div className="hidden md:block">
                <Skeleton className="h-5 w-16 max-w-full rounded-full" />
              </div>

              {/* Último acceso */}
              <div className="hidden md:block">
                <Skeleton className="h-3 w-20 max-w-full" />
              </div>

              {/* Acciones */}
              <div className="flex justify-end md:justify-end">
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Pie de paginación skeleton */}
        <div className="flex flex-col gap-2 border-t border-border/80 px-4 py-3 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-4 w-40 max-w-full" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        Ocurrió un error al cargar los usuarios.
      </div>
    );
  }

  const items = data?.items ?? [];
  const hasData = items.length > 0;

  return (
    <div className="mt-4 rounded-lg border border-border bg-card">
      <div className="w-full overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="border-b border-border/80 bg-muted/60 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Usuario / Email</th>
              <th className="px-4 py-3">Cargo</th>
              <th className="px-4 py-3">Área (dependencia)</th>
              <th className="px-4 py-3">Rol sistema</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Último acceso</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {!hasData && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-sm text-muted-foreground"
                >
                  No se encontraron usuarios para los filtros actuales.
                </td>
              </tr>
            )}
            {items.map((user, index) => {
              const fullName =
                [user.firstName, user.lastName].filter(Boolean).join(" ") ||
                user.userName;
              const initials = fullName
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0]?.toUpperCase())
                .join("");
              const isLast = index === items.length - 1;

              return (
                <tr
                  key={user.id}
                  className={`text-sm text-foreground ${
                    !isLast ? "border-b border-border/60" : ""
                  }`}
                >
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {initials || "U"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{fullName}</span>
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <span className="text-sm">
                      {user.positionName ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <span className="text-sm text-muted-foreground">
                      {user.organizationUnitName ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <span className="inline-flex items-center rounded-full bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {user.roleName ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.isActive
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800/60 dark:text-slate-300"
                      }`}
                    >
                      <span
                        className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
                          user.isActive
                            ? "bg-emerald-500"
                            : "bg-slate-400 dark:bg-slate-500"
                        }`}
                      />
                      {user.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <span className="text-xs text-muted-foreground">
                      {formatLastAccess(user.lastAccessAt)}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm hover:bg-muted/60"
                          aria-label="Acciones de usuario"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onEditUser?.(user)}
                        >
                          Editar usuario
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onToggleActiveUser?.(user)}
                        >
                          {user.isActive ? "Desactivar" : "Reactivar"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data && (
        <div className="flex items-center justify-between border-t border-border/80 px-4 py-3 text-xs text-muted-foreground">
          <div>
            Mostrando{" "}
            <span className="font-medium">
              {data.totalCount === 0
                ? 0
                : (data.pageNumber - 1) * data.pageSize + 1}
            </span>{" "}
            -{" "}
            <span className="font-medium">
              {Math.min(data.pageNumber * data.pageSize, data.totalCount)}
            </span>{" "}
            de <span className="font-medium">{data.totalCount}</span>{" "}
            usuarios
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!data.hasPrevious}
              onClick={() => onPageChange(page - 1)}
              className="inline-flex items-center rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-40 hover:bg-muted/60"
            >
              Anterior
            </button>
            <span className="text-xs">
              Página{" "}
              <span className="font-semibold">{data.pageNumber}</span> de{" "}
              <span className="font-semibold">{data.totalPages}</span>
            </span>
            <button
              type="button"
              disabled={!data.hasNext}
              onClick={() => onPageChange(page + 1)}
              className="inline-flex items-center rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-40 hover:bg-muted/60"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

