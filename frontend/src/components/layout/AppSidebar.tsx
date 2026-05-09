import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Clock,
  History,
  Users,
  CheckCircle2,
  PlusCircle,
  Tags,
  FileBarChart,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";

const participantItems = [
  { title: "Dashboard", url: "/app/dashboard", icon: LayoutDashboard },
  { title: "Registrar Horas", url: "/app/registrar", icon: Clock },
  { title: "Histórico", url: "/app/historico", icon: History },
];

const directorItems = [
  { title: "Dashboard", url: "/app/dashboard", icon: LayoutDashboard },
  { title: "Validação", url: "/app/validacao", icon: CheckCircle2 },
  { title: "Atribuir Horas", url: "/app/atribuir", icon: PlusCircle },
  { title: "Participantes", url: "/app/participantes", icon: Users },
  { title: "Tipos de Atividade", url: "/app/tipos", icon: Tags },
  { title: "Relatórios", url: "/app/relatorios", icon: FileBarChart },
];

export function AppSidebar() {
  const { state, isMobile } = useSidebar();
  const collapsed = !isMobile && state === "collapsed";
  const { pathname } = useLocation();
  const { user } = useAuth();

  const items = user?.role === "Diretor" ? directorItems : participantItems;
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className={collapsed ? "p-2" : "p-4"}>
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className={`${collapsed ? "h-8 w-8 rounded-lg text-xs" : "h-10 w-10 rounded-xl"} gradient-primary flex items-center justify-center text-primary-foreground font-bold shadow-elegant shrink-0`}>
            MD
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-sm text-foreground">Meninas Digitais</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Controle de Horas</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} className="h-10">
                    <NavLink to={item.url} className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 transition-colors ${
                        isActive ? "bg-primary-soft text-primary font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent"
                      }`
                    }>
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3" />
    </Sidebar>
  );
}
