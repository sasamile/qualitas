  "use client"

  import * as React from "react"
  import { Bell, Check, User, FileText, Settings, AlertTriangle, BarChart3 } from "lucide-react"
  import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
  import { Button } from "@/components/ui/button"
  import { ScrollArea } from "@/components/ui/scroll-area"
  import { cn } from "@/lib/utils"

  interface Notification {
    id: string
    title: string
    description: string
    timestamp: string
    type: "user" | "document" | "settings" | "alert" | "report"
    read: boolean
  }

  const notificationsData: Notification[] = [
    {
      id: "1",
      title: "Nuevo usuario registrado",
      description: "Carlos Méndez fue agregado al sistema",
      timestamp: "hace 5 min",
      type: "user",
      read: false,
    },
    {
      id: "2",
      title: "Auditoría completada",
      description: "Se finalizó la revisión Q1-2026",
      timestamp: "hace 15 min",
      type: "document",
      read: false,
    },
    {
      id: "3",
      title: "Configuración actualizada",
      description: "Cambios en roles de usuario aplicados",
      timestamp: "hace 1 hora",
      type: "settings",
      read: true,
    },
    {
      id: "4",
      title: "Alerta de cumplimiento",
      description: "Documento pendiente de revisión",
      timestamp: "hace 2 horas",
      type: "alert",
      read: false,
    },
    {
      id: "5",
      title: "Informe generado",
      description: "Reporte mensual disponible para descarga",
      timestamp: "hace 1 día",
      type: "report",
      read: true,
    },
  ]

  const iconMap = {
    user: User,
    document: FileText,
    settings: Settings,
    alert: AlertTriangle,
    report: BarChart3,
  }

  const iconColorMap = {
    user: "bg-blue-100 text-blue-600",
    document: "bg-green-100 text-green-600",
    settings: "bg-gray-100 text-gray-600",
    alert: "bg-amber-100 text-amber-600",
    report: "bg-purple-100 text-purple-600",
  }

  export function NotificationsPanel() {
    const [notifications, setNotifications] = React.useState<Notification[]>(notificationsData)
    const [open, setOpen] = React.useState(false)

    const unreadCount = notifications.filter((n) => !n.read).length

    const markAllAsRead = () => {
      setNotifications(notifications.map((n) => ({ ...n, read: true })))
    }

    const markAsRead = (id: string) => {
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-medium text-white">
                {unreadCount}
              </span>
            )}
            <span className="sr-only">Notificaciones</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[380px] p-0" 
          align="end" 
          sideOffset={8}
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">Notificaciones</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                  onClick={markAllAsRead}
                >
                  <Check className="mr-1 h-3 w-3" />
                  Marcar todas
                </Button>
              )}
            </div>
          </div>

          <ScrollArea className="h-[340px]">
            <div className="divide-y">
              {notifications.map((notification) => {
                const Icon = iconMap[notification.type]
                return (
                  <button
                    key={notification.id}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                      !notification.read && "bg-blue-50/50"
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="relative flex-shrink-0">
                      {!notification.read && (
                        <span className="absolute -left-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-blue-600" />
                      )}
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full",
                          iconColorMap[notification.type]
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm truncate",
                        !notification.read ? "font-medium text-foreground" : "text-foreground"
                      )}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {notification.description}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-xs text-muted-foreground">
                      {notification.timestamp}
                    </span>
                  </button>
                )
              })}
            </div>
          </ScrollArea>

          <div className="border-t p-2">
            <Button
              variant="ghost"
              className="w-full text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              Ver todas las notificaciones
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    )
  }
