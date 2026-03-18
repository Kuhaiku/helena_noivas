import { cn } from "@/lib/utils"
import type { OrderStatus, StockStatus } from "@/lib/admin-store"

const orderStatusMap: Record<OrderStatus, { label: string; className: string }> = {
  pendente: { label: "Pendente", className: "bg-amber-100 text-amber-700 border-amber-200" },
  confirmado: { label: "Confirmado", className: "bg-blue-100 text-blue-700 border-blue-200" },
  compareceu: { label: "Compareceu", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  cancelado: { label: "Cancelado", className: "bg-red-100 text-red-600 border-red-200" },
}

const stockStatusMap: Record<StockStatus, { label: string; className: string }> = {
  livre: { label: "Livre", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  alugado: { label: "Alugado", className: "bg-blue-100 text-blue-700 border-blue-200" },
  manutencao: { label: "Manutenção", className: "bg-amber-100 text-amber-700 border-amber-200" },
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, className } = orderStatusMap[status]
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", className)}>
      {label}
    </span>
  )
}

export function StockStatusBadge({ status }: { status: StockStatus }) {
  const { label, className } = stockStatusMap[status]
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", className)}>
      {label}
    </span>
  )
}
