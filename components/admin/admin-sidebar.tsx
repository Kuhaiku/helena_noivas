"use client";

import { useAdminStore } from "@/lib/admin-store";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  Shirt,
  PlusCircle,
  Layers,
  Tags,
  Settings,
  LogOut,
  DollarSign,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";

export function AdminSidebar() {
  const { section, setSection } = useAdminStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-border h-screen sticky top-0 flex flex-col hidden md:flex shrink-0 shadow-sm">
      <div className="h-16 flex items-center px-6 border-b border-border bg-secondary/10">
        <span className="font-serif text-lg tracking-widest text-foreground">
          HELENA<span className="text-primary font-light ml-1">ADMIN</span>
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-1 overflow-y-auto scrollbar-none">
        <p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest px-2 mb-2 mt-2">
          Principal
        </p>
        <button
          onClick={() => setSection("dashboard")}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
            section === "dashboard"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
          )}
        >
          <LayoutDashboard size={18} /> Visão Geral
        </button>
        <button
          onClick={() => setSection("pedidos")}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
            section === "pedidos"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
          )}
        >
          <CalendarDays size={18} /> Pedidos & Provas
        </button>

        {/* ── NOVA ABA DE CONTRATOS ── */}
        <button
          onClick={() => setSection("contratos")}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
            section === "contratos"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
          )}
        >
          <FileText size={18} /> Contratos Ativos
        </button>

        <button
          onClick={() => setSection("financeiro")}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
            section === "financeiro"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
          )}
        >
          <DollarSign size={18} /> Financeiro
        </button>

        <p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest px-2 mb-2 mt-6">
          Catálogo
        </p>
        <button
          onClick={() => setSection("estoque")}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
            section === "estoque"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
          )}
        >
          <Shirt size={18} /> Gestão de Estoque
        </button>
        <button
          onClick={() => {
            setSection("cadastro");
            useAdminStore.getState().setEditingProduct(null);
          }}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
            section === "cadastro"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
          )}
        >
          <PlusCircle size={18} /> Cadastrar Peça
        </button>
        <button
          onClick={() => setSection("colecoes")}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
            section === "colecoes"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
          )}
        >
          <Layers size={18} /> Coleções
        </button>
        <button
          onClick={() => setSection("categorias")}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
            section === "categorias"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
          )}
        >
          <Tags size={18} /> Categorias
        </button>

        <p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest px-2 mb-2 mt-6">
          Sistema
        </p>
        <button
          onClick={() => setSection("configuracoes")}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
            section === "configuracoes" || section === "horarios"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
          )}
        >
          <Settings size={18} /> Configurações
        </button>
      </div>

      <div className="p-4 border-t border-border bg-secondary/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOut size={18} /> Sair do Painel
        </button>
      </div>
    </aside>
  );
}