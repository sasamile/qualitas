"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DofaItemDto } from "../../api/dofa";

function priorityBadgeVariant(priority: string) {
  const key = priority.toLowerCase();
  if (key.includes("alta")) return "destructive";
  if (key.includes("media")) return "secondary";
  return "outline";
}

export function DofaItemCard({
  item,
  disabled,
  onEdit,
  onDelete,
}: {
  item: DofaItemDto;
  disabled?: boolean;
  onEdit: (item: DofaItemDto) => void;
  onDelete: (item: DofaItemDto) => void;
}) {
  return (
    <div className="rounded-md border bg-background px-3 py-2">
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
            onClick={() => onEdit(item)}
            disabled={disabled}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => onDelete(item)}
            disabled={disabled}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

