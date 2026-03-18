"use client"

import { useAdminStore } from "@/lib/admin-store"
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Settings,
  Gem,
  LogOut,
  ExternalLink,
  PlusSquare,
  Layers,
  Clock, // <-- 1. Adicionamos o ícone do relógio aqui
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "pedidos", label: "Pedidos & Provas", icon: ClipboardList },
  { id: "estoque", label: "Estoque", icon: Package },
  { id: "cadastro", label: "Cadastro de Produto", icon: PlusSquare },
  { id: "colecoes", label: "Coleções Sazonais", icon: Layers },
  { id: "horarios", label: "Horários da Loja", icon: Clock }, // <-- 2. Adicionamos o novo botão aqui
  { id: "configuracoes", label: "Configurações", icon: Settings },
] as const

export function AdminSidebar() {
  const { section, setSection } = useAdminStore()

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-border">
        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
          <Gem size={14} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground leading-none">Helena Noivas</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Painel Administrativo</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 flex flex-col gap-0.5">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSection(id as any)} // <-- type assertion aqui caso o TypeScript reclame
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
              section === id
                ? "bg-primary/8 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border flex flex-col gap-1">
        <Link
          href="/"
          target="_blank"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ExternalLink size={16} />
          Ver Vitrine
        </Link>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors">
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  )
}