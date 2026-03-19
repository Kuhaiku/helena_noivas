"use client"

import { useAdminStore, AdminSection } from "@/lib/admin-store"
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Layers, 
  PlusCircle, 
  FolderHeart, 
  Tags, 
  Clock, 
  Settings 
} from "lucide-react"

export function AdminSidebar() {
  const { section, setSection } = useAdminStore()

  const menu: { id: AdminSection; label: string; icon: any }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "pedidos", label: "Pedidos & Provas", icon: CalendarCheck },
    { id: "estoque", label: "Estoque", icon: Layers },
    { id: "cadastro", label: "Cadastro de Produto", icon: PlusCircle },
    { id: "colecoes", label: "Coleções Sazonais", icon: FolderHeart },
    { id: "categorias", label: "Categorias", icon: Tags },
    { id: "horarios", label: "Horários", icon: Clock },
    { id: "configuracoes", label: "Configurações", icon: Settings },
  ]

  return (
    <aside className="w-64 bg-white border-r border-border min-h-screen p-4 flex flex-col gap-2 shrink-0 hidden md:flex">
      <div className="mb-8 px-2 mt-4">
        <h2 className="font-serif text-xl font-bold tracking-wider text-foreground">
          HELENA<span className="text-primary font-light">NOIVAS</span>
        </h2>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Admin Panel</p>
      </div>
      
      <nav className="flex flex-col gap-1.5">
        {menu.map((item) => {
          const Icon = item.icon
          const isActive = section === item.id
          return (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}