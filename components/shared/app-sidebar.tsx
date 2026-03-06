"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Zap,
} from "lucide-react";
import { NavMain } from "@/components/shared/nav-main";
import { NavUser } from "@/components/shared/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const navMainData = [
  {
    title: "Inicio",
    url: "/",
    icon: LayoutDashboard,
    items: [{ title: "Dashboard", url: "/" }],
  },
  {
    title: "Administración",
    url: "/usuarios",
    icon: Users,
    items: [
      { title: "Usuarios", url: "/usuarios" },
      { title: "Organización", url: "/organizacion" },
    ],
  },
  {
    title: "Normatividad",
    url: "/normatividad/marcos",
    icon: FileText,
    items: [
      { title: "Marcos Normativos", url: "/normatividad/marcos" },
      { title: "Cumplimiento", url: "/normatividad/cumplimiento" },
    ],
  },
  {
    title: "Control",
    url: "/auditoria",
    icon: Zap,
    items: [
      { title: "Procesos", url: "/procesos" },
    ],
  },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  // Marcar como isActive la sección que contiene la ruta actual
  const itemsWithActive = navMainData.map((item) => ({
    ...item,
    isActive:
      pathname === item.url ||
      (item.items?.some(
        (sub) => pathname === sub.url || pathname.startsWith(sub.url + "/")
      ) ?? false),
  }));

  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg  text-sidebar-primary-foreground overflow-hidden">
                  <Image
                    src="/icon/logo.svg"
                    alt="Qualitas|Nexus"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-bold">Qualitas</span>
                  <span className="text-xs text-muted-foreground">v1.0.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={itemsWithActive} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
