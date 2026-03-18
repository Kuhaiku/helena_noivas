import { cn } from "@/lib/utils"
import type { OrderStatus, StockStatus } from "@/lib/admin-store"

const orderStatusMap: Record<string, { label: string; className: string }> = {
  novo: { label: "Novo", className: "bg-purple-100 text-purple-700 border-purple-200" }, // <--- Adicionamos o "novo" aqui!
  pendente: { label: "Pendente", className: "bg-amber-100 text-amber-700 border-amber-200" },
  confirmado: { label: "Confirmado", className: "bg-blue-100 text-blue-700 border-blue-200" },
  compareceu: { label: "Compareceu", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  cancelado: { label: "Cancelado", className: "bg-red-100 text-red-600 border-red-200" },
}

const stockStatusMap: Record<string, { label: string; className: string }> = {
  livre: { label: "Livre", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  alugado: { label: "Alugado", className: "bg-blue-100 text-blue-700 border-blue-200" },
  manutencao: { label: "Manutenção", className: "bg-amber-100 text-amber-700 border-amber-200" },
}

export function OrderStatusBadge({ status }: { status: OrderStatus | string }) {
  // Se o status não existir no mapa, usamos um estilo cinza padrão para não quebrar a tela
  const config = orderStatusMap[status] || { label: status || "Desconhecido", className: "bg-gray-100 text-gray-700 border-gray-200" }
  
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", config.className)}>
      {config.label}
    </span>
  )
}

export function StockStatusBadge({ status }: { status: StockStatus | string }) {
  // Proteção anti-quebra também para o estoque
  const config = stockStatusMap[status] || { label: status || "Desconhecido", className: "bg-gray-100 text-gray-700 border-gray-200" }
  
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", config.className)}>
      {config.label}
    </span>
  )
}