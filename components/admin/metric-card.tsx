import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string | number
  sub?: string
  icon: LucideIcon
  accent?: "default" | "amber" | "blue" | "green" | "red"
}

const accentMap = {
  default: "bg-primary/10 text-primary",
  amber: "bg-amber-100 text-amber-600",
  blue: "bg-blue-100 text-blue-600",
  green: "bg-emerald-100 text-emerald-600",
  red: "bg-red-100 text-red-600",
}

export function MetricCard({ title, value, sub, icon: Icon, accent = "default" }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-border p-5 flex items-center gap-4">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", accentMap[accent])}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide truncate">{title}</p>
        <p className="text-2xl font-bold text-foreground leading-tight mt-0.5">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
