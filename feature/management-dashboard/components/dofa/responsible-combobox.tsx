"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { usersApi } from "@/feature/user/api/users";
import type { UserDto } from "@/feature/user/types";

function getUserLabel(user: UserDto) {
  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  if (fullName) return `${fullName} • ${user.email}`;
  return user.email;
}

export function ResponsibleCombobox({
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
              {usersQuery.isFetching
                ? "Buscando..."
                : "No se encontraron usuarios."}
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
                  className={cn(
                    "mr-2 h-4 w-4",
                    !value ? "opacity-100" : "opacity-0",
                  )}
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
                      {`${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() ||
                        u.email}
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

