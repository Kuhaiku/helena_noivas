"use client"

import { useState, useEffect } from "react"
import { useAdminStore } from "@/lib/admin-store"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { MetricCard } from "@/components/admin/metric-card"
import { OrderStatusBadge, StockStatusBadge } from "@/components/admin/status-badge"
import { ModalPedido } from "@/components/admin/modal-pedido"
import { ModalNovoPedido } from "@/components/admin/modal-novo-pedido"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ConfigHorarios } from "@/components/admin/config-horarios"
import Image from "next/image"
import {
  CalendarCheck,
  ClipboardList,
  TrendingUp,
  DollarSign,
  Plus,
  Filter,
  Pencil,
  FileSignature,
  FileText, // <-- ÍCONE ADICIONADO AQUI
  Zap,
  Save,
  Clock,
  AlertTriangle,
  Users,
  BarChart3,
  CheckCircle2,
  Upload,
  Layers,
  Eye,
  EyeOff,
  Trash2,
  RadioTower,
  X,
  Tag
} from "lucide-react"
import type { Product, SeasonalCollection, Category } from "@/lib/admin-store"

// ─── Dashboard ───────────────────────────────────────────────────────────────
function SectionDashboard() {
  const { orders, catalog, setSelectedOrder, setOrderModalOpen } = useAdminStore()
  const today = new Date().toISOString().split("T")[0]

  const todayOrders = orders
    .filter((o) => o.provaDate === today && o.status !== "cancelado")
    .sort((a, b) => a.provaTime.localeCompare(b.provaTime))

  const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 7)
  const nextWeekStr = nextWeek.toISOString().split("T")[0]

  const rentedIds = new Set(catalog.filter((d) => d.stock === "alugado").map((d) => d.id))
  const conflicts = orders.filter((o) => {
    if (o.status === "cancelado") return false
    if (o.provaDate < today || o.provaDate > nextWeekStr) return false
    return o.items.some((item) => rentedIds.has(item.id))
  })

  const totalNoivas = orders.length
  const fechados = orders.filter((o) => o.status === "compareceu").length
  const taxaConversao = totalNoivas > 0 ? Math.round((fechados / totalNoivas) * 100) : 0
  const pendentes = orders.filter((o) => o.status === "pendente" || o.status === "novo").length
  const faturamentoPendente = orders
    .filter((o) => o.status === "confirmado" && o.totalValue)
    .reduce((s, o) => s + (o.totalValue ?? 0) - (o.signalPaid ?? 0), 0)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Provas Hoje" value={todayOrders.length} sub="agendamentos para hoje" icon={CalendarCheck} accent="blue" />
        <MetricCard title="Pendentes" value={pendentes} sub="aguardando confirmação" icon={ClipboardList} accent="amber" />
        <MetricCard title="Taxa de Conversão" value={`${taxaConversao}%`} sub={`${fechados} de ${totalNoivas} noivas`} icon={TrendingUp} accent="green" />
        <MetricCard title="Faturamento Pendente" value={`R$ ${faturamentoPendente.toLocaleString("pt-BR")}`} sub="saldo a receber" icon={DollarSign} accent="red" />
      </div>

      {conflicts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <h2 className="text-sm font-semibold text-amber-800">
              {conflicts.length} alerta{conflicts.length !== 1 ? "s" : ""} de conflito de estoque
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {conflicts.map((order) => {
              const conflictItems = order.items.filter((item) => rentedIds.has(item.id))
              return (
                <div key={order.id} className="flex items-start justify-between gap-4 bg-white rounded-lg border border-amber-100 p-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-foreground">{order.clientName} <span className="ml-2 text-xs text-muted-foreground font-normal">{order.id}</span></p>
                    <p className="text-xs text-amber-700">Prova em {new Date(order.provaDate + "T12:00:00").toLocaleDateString("pt-BR")} às {order.provaTime}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {conflictItems.map((item) => (
                        <span key={item.id} className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                          {item.name} ({item.sku}) — ainda alugado
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs shrink-0 border-amber-300 text-amber-700 hover:bg-amber-50" onClick={() => { setSelectedOrder(order); setOrderModalOpen(true) }}>
                    <Pencil size={11} className="mr-1" /> Ver Pedido
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Clock size={15} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Agenda do Dia</h2>
            {todayOrders.length > 0 && <span className="ml-auto text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">{todayOrders.length}</span>}
          </div>
          {todayOrders.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">Nenhuma prova agendada para hoje.</div>
          ) : (
            <div className="divide-y divide-border">
              {todayOrders.map((order) => (
                <div key={order.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 text-center"><p className="text-xs font-bold text-primary leading-none">{order.provaTime}</p></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{order.clientName}</p>
                      <p className="text-xs text-muted-foreground">{order.items?.length || 0} peça{order.items?.length !== 1 ? "s" : ""} &middot; {order.clientPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <OrderStatusBadge status={order.status} />
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setSelectedOrder(order); setOrderModalOpen(true) }}><Pencil size={12} /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <BarChart3 size={15} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Métricas de Conversão</h2>
          </div>
          <div className="p-5 flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"><Users size={14} className="text-muted-foreground" /><span className="text-muted-foreground">Total de noivas</span></div>
                <span className="font-semibold text-foreground">{totalNoivas}</span>
              </div>
              <div className="w-full h-2 bg-border rounded-full overflow-hidden"><div className="h-full bg-blue-400 rounded-full" style={{ width: "100%" }} /></div>

              <div className="flex items-center justify-between text-sm mt-1">
                <div className="flex items-center gap-2"><CalendarCheck size={14} className="text-muted-foreground" /><span className="text-muted-foreground">Vieram provar</span></div>
                <span className="font-semibold text-foreground">{orders.filter((o) => o.status === "compareceu" || o.status === "confirmado").length}</span>
              </div>
              <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: totalNoivas > 0 ? `${Math.round((orders.filter((o) => o.status === "compareceu" || o.status === "confirmado").length / totalNoivas) * 100)}%` : "0%" }} />
              </div>

              <div className="flex items-center justify-between text-sm mt-1">
                <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-muted-foreground" /><span className="text-muted-foreground">Contratos fechados</span></div>
                <span className="font-semibold text-foreground">{fechados}</span>
              </div>
              <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: totalNoivas > 0 ? `${taxaConversao}%` : "0%" }} />
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between bg-primary/5 rounded-lg px-4 py-3">
              <p className="text-sm text-foreground font-medium">Taxa de conversão geral</p>
              <p className="text-2xl font-bold font-serif text-primary">{taxaConversao}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Próximos Agendamentos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">ID</th>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cliente</th>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Data da Prova</th>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Peças</th>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody>
              {[...orders].filter((o) => o.status !== "cancelado" && o.provaDate >= today).sort((a, b) => a.provaDate.localeCompare(b.provaDate)).slice(0, 6).map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{order.id}</td>
                    <td className="px-5 py-3"><p className="font-medium text-foreground">{order.clientName}</p><p className="text-xs text-muted-foreground">{order.clientPhone}</p></td>
                    <td className="px-5 py-3 text-muted-foreground">{new Date(order.provaDate + "T12:00:00").toLocaleDateString("pt-BR")} · {order.provaTime}</td>
                    <td className="px-5 py-3 text-muted-foreground">{order.items?.length || 0} peça{order.items?.length !== 1 ? "s" : ""}</td>
                    <td className="px-5 py-3"><OrderStatusBadge status={order.status} /></td>
                    <td className="px-5 py-3 text-right">
                      <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => { setSelectedOrder(order); setOrderModalOpen(true) }}>
                        <Pencil size={12} /> Editar
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Pedidos ─────────────────────────────────────────────────────────────────
function SectionPedidos() {
  const { orders, filterStatus, setFilterStatus, filterDate, setFilterDate, setSelectedOrder, setOrderModalOpen, setNewOrderModalOpen } = useAdminStore()

  const filtered = orders.filter((o) => {
    const matchStatus = filterStatus === "todos" || o.status === filterStatus
    const matchDate = !filterDate || o.provaDate === filterDate
    return matchStatus && matchDate
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Pedidos & Provas</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} pedido{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setNewOrderModalOpen(true)}><Plus size={14} /> Novo Agendamento</Button>
      </div>

      <div className="flex gap-3 flex-wrap items-center bg-white border border-border rounded-xl p-4">
        <Filter size={15} className="text-muted-foreground shrink-0" />
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
          <SelectTrigger className="h-8 text-xs w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="compareceu">Compareceu</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="h-8 text-xs w-40" />
        {(filterStatus !== "todos" || filterDate) && (
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { setFilterStatus("todos"); setFilterDate("") }}>Limpar filtros</Button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">ID</th>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cliente</th>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Prova</th>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total</th>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const total = order.totalValue ?? (order.items || []).reduce((s, i) => s + i.price - (i.discount ?? 0), 0)
                return (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{order.id}</td>
                    <td className="px-5 py-3"><p className="font-medium text-foreground">{order.clientName}</p><p className="text-xs text-muted-foreground">{order.clientEmail}</p></td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{order.provaDate}<br />{order.provaTime}</td>
                    <td className="px-5 py-3 font-medium text-foreground">{total > 0 ? `R$ ${total.toLocaleString("pt-BR")}` : "—"}</td>
                    <td className="px-5 py-3"><OrderStatusBadge status={order.status} /></td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => { setSelectedOrder(order); setOrderModalOpen(true) }}><Pencil size={12} /> Editar</Button>
                        {order.status === "confirmado" ? (
                          <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => { window.location.href = `/admin/contrato/${order.id}` }}>
                            <FileText size={12} /> Ver Contrato
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => { window.location.href = `/admin/fechamento/${order.id}` }}>
                            <FileSignature size={12} /> Aprovar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">Nenhum pedido encontrado com os filtros selecionados.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Financeiro ───────────────────────────────────────────────────────────────
function SectionFinanceiro() {
  const { transactions, deleteTransaction, addTransaction, orders, updateOrderFinancial } = useAdminStore()
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ type: "saida" as "entrada"|"saida", description: "", amount: "", date: new Date().toISOString().split("T")[0], category: "Operacional" })

  const totalEntradas = transactions.filter(t => t.type === "entrada").reduce((acc, t) => acc + t.amount, 0)
  const totalSaidas = transactions.filter(t => t.type === "saida").reduce((acc, t) => acc + t.amount, 0)
  const saldo = totalEntradas - totalSaidas

  // Contas a Receber: Contratos confirmados cujo sinal pago é menor que o total
  const contasAReceber = orders.filter(o => o.status === "confirmado" && o.totalValue && (o.totalValue > (o.signalPaid || 0)))

  const handleSalvarManual = async () => {
    if (!form.description || !form.amount) return
    setLoading(true)
    try {
      const dataToSave = { ...form, amount: Number(form.amount) }
      const res = await fetch('/api/financeiro', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dataToSave) })
      if (res.ok) {
        const result = await res.json()
        addTransaction({ id: result.id, ...dataToSave })
        setIsAdding(false)
        setForm({ ...form, description: "", amount: "" })
      }
    } catch (e) {
      alert("Erro ao salvar transação.")
    } finally {
      setLoading(false)
    }
  }

  const handleApagar = async (id: string) => {
    if (!confirm("Apagar este registro financeiro?")) return
    const res = await fetch(`/api/financeiro?id=${id}`, { method: 'DELETE' })
    if (res.ok) deleteTransaction(id)
  }

  const handleReceberRestante = async (order: any) => {
    const restante = order.totalValue - (order.signalPaid || 0)
    if (!confirm(`Deseja lançar a quitação de R$ ${restante.toFixed(2)} referente ao contrato de ${order.clientName}?`)) return

    try {
      const transacao = {
        type: "entrada",
        description: `Quitação Final - Contrato #${order.id} (${order.clientName})`,
        amount: restante,
        date: new Date().toISOString().split("T")[0],
        category: "Locação"
      }
      
      const resFin = await fetch('/api/financeiro', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(transacao) })
      const dataFin = await resFin.json()

      const resPed = await fetch(`/api/pedidos?id=${order.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...order, signalPaid: order.totalValue }) })
      
      if (resFin.ok && resPed.ok) {
        addTransaction({ id: dataFin.id, ...transacao } as any)
        updateOrderFinancial(order.id, { signalPaid: order.totalValue })
        alert("Pagamento lançado com sucesso!")
      }
    } catch (error) {
      alert("Falha ao registrar quitação.")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Gestão Financeira</h1>
          <p className="text-sm text-muted-foreground">Controle de caixa, receitas e despesas.</p>
        </div>
        <Button size="sm" onClick={() => setIsAdding(!isAdding)} className="gap-1.5"><Plus size={14} /> Lançamento Manual</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Entradas</p>
          <p className="text-2xl font-semibold text-emerald-600">R$ {totalEntradas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Saídas</p>
          <p className="text-2xl font-semibold text-red-600">R$ {totalSaidas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
        </div>
        <div className={`p-5 rounded-xl border shadow-sm ${saldo >= 0 ? 'bg-primary/10 border-primary/20' : 'bg-red-50 border-red-200'}`}>
          <p className="text-xs uppercase tracking-widest mb-1 font-medium">Saldo Atual</p>
          <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-primary' : 'text-red-600'}`}>R$ {saldo.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
        </div>
      </div>

      {contasAReceber.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-2">
          <h3 className="font-semibold text-blue-800 mb-3 text-sm">Valores Pendentes (Contratos a Receber)</h3>
          <div className="flex flex-col gap-2">
            {contasAReceber.map(o => {
              const valorRestante = o.totalValue - (o.signalPaid || 0)
              return (
                <div key={o.id} className="flex items-center justify-between bg-white px-4 py-2.5 rounded-lg border border-blue-100 shadow-sm">
                  <div>
                    <p className="text-sm font-semibold">{o.clientName}</p>
                    <p className="text-xs text-muted-foreground">Contrato #{o.id} · Vence na retirada</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-blue-700">R$ {valorRestante.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                    <Button size="sm" onClick={() => handleReceberRestante(o)} className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white">Receber Restante</Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {isAdding && (
        <div className="bg-white rounded-xl border border-primary/30 p-6 flex flex-col gap-4 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h3 className="font-semibold border-b pb-2">Novo Lançamento</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <Label className="text-xs mb-1.5">Tipo</Label>
              <Select value={form.type} onValueChange={(v: any) => setForm({...form, type: v})}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada (Receita)</SelectItem>
                  <SelectItem value="saida">Saída (Despesa)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs mb-1.5">Descrição</Label>
              <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Ex: Conta de Luz, Ajuste..." className="h-9" />
            </div>
            <div>
              <Label className="text-xs mb-1.5">Valor (R$)</Label>
              <Input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="h-9" />
            </div>
            <div>
              <Label className="text-xs mb-1.5">Data</Label>
              <Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="h-9" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setIsAdding(false)}>Cancelar</Button>
            <Button onClick={handleSalvarManual} disabled={loading || !form.amount || !form.description}>Salvar Lançamento</Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Data</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Descrição</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Pedido Ref.</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Valor</th>
              <th className="text-right px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-5 py-3 text-muted-foreground">{t.date.split('-').reverse().join('/')}</td>
                <td className="px-5 py-3 font-medium">{t.description}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{t.orderId ? `#${t.orderId}` : '-'}</td>
                <td className={`px-5 py-3 text-right font-medium ${t.type === 'entrada' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {t.type === 'entrada' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </td>
                <td className="px-5 py-3 text-right">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:bg-red-50" onClick={() => handleApagar(t.id)}><Trash2 size={14}/></Button>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">Nenhuma movimentação financeira.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Estoque ─────────────────────────────────────────────────────────────────
function SectionEstoque() {
  const { catalog, products, deleteProduct, setEditingProduct, setSection, setCollections } = useAdminStore()

  const itensParaMostrar = products.length > 0 ? products : catalog

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja apagar esta peça do estoque?")) return;
    try {
      const response = await fetch(`/api/produtos?id=${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        deleteProduct(id);
        const resCol = await fetch('/api/colecoes');
        if (resCol.ok) setCollections(await resCol.json());
      }
      else alert("Erro ao apagar no banco de dados.");
    } catch (error) {
      alert("Erro de conexão com a API.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Gestão de Estoque</h1>
        <p className="text-sm text-muted-foreground">{itensParaMostrar.length} peças cadastradas</p>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Peça</th>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">SKU</th>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tamanho</th>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Qtd.</th>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Valor</th>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody>
              {itensParaMostrar.map((item: any) => {
                const imgSrc = item.images?.[0] || item.image;
                const finalImg = (typeof imgSrc === 'string' && imgSrc.trim() !== '') ? imgSrc : "/placeholder.jpg";

                return (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-12 rounded-md overflow-hidden bg-secondary shrink-0 border border-border/50">
                          <Image src={finalImg} alt={item.name} fill className="object-cover" sizes="40px" />
                        </div>
                        <span className="font-medium text-foreground">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{item.sku}</td>
                    <td className="px-5 py-3 text-muted-foreground">{item.size}</td>
                    <td className="px-5 py-3 font-medium text-foreground">{item.quantity || 1}</td>
                    <td className="px-5 py-3 font-medium text-foreground">R$ {(item.price || item.rentalPrice || 0).toLocaleString("pt-BR")}</td>
                    <td className="px-5 py-3"><StockStatusBadge status={item.stock || 'livre'} /></td>
                    <td className="px-5 py-3 text-right flex items-center justify-end gap-2">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors" onClick={() => { setEditingProduct(item); setSection("cadastro") }} title="Editar Peça">
                        <Pencil size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors" onClick={() => handleDelete(item.id)} title="Apagar Peça">
                        <Trash2 size={14} />
                      </Button>
                    </td>
                  </tr>
                )
              })}
              {itensParaMostrar.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-muted-foreground">O teu estoque está vazio. Vá em "Cadastro de Produto" para adicionar a primeira peça.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
// ─── Configurações ────────────────────────────────────────────────────────────
function SectionConfiguracoes() {
  const { storeConfig, setStoreConfig } = useAdminStore()
  const [config, setConfig] = useState(storeConfig)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => setConfig(storeConfig), [storeConfig])

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/configuracoes', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) })
      if (res.ok) { setStoreConfig(config!); setSaved(true); setTimeout(() => setSaved(false), 3000) }
    } catch (e) { alert("Falha de conexão com a API.") } finally { setLoading(false) }
  }

  if (!config) return null

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Configurações da Loja</h1>
          <p className="text-sm text-muted-foreground">Parâmetros de operação, atendimento e finanças</p>
        </div>
        {saved && <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100"><CheckCircle2 size={16} /> Salvo</div>}
      </div>

      <div className="bg-white rounded-xl border border-border p-6 flex flex-col gap-6">
        <div>
          <p className="text-sm font-semibold text-foreground mb-1">Janela de Locação e Bloqueio</p>
          <p className="text-xs text-muted-foreground mb-4">Quantos dias antes e depois do evento o vestido fica indisponível.</p>
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-xs mb-1.5">Dias antes do evento</Label><Input type="number" min={1} max={30} value={config.windowBefore} onChange={(e) => setConfig({ ...config, windowBefore: Number(e.target.value) })} className="h-9" /></div>
            <div><Label className="text-xs mb-1.5">Dias depois do evento</Label><Input type="number" min={1} max={30} value={config.windowAfter} onChange={(e) => setConfig({ ...config, windowAfter: Number(e.target.value) })} className="h-9" /></div>
          </div>
        </div>
        <Separator />
        <div>
          <p className="text-sm font-semibold text-foreground mb-1">Capacidade de Atendimento</p>
          <div className="max-w-[200px]"><Label className="text-xs mb-1.5">Número de provadores / salas</Label><Input type="number" min={1} max={20} value={config.provadores} onChange={(e) => setConfig({ ...config, provadores: Number(e.target.value) })} className="h-9" /></div>
        </div>
        <Separator />
        <div>
          <p className="text-sm font-semibold text-foreground mb-1">Regras Financeiras</p>
          <div className="max-w-[200px]">
            <Label className="text-xs mb-1.5">% do Sinal (Entrada)</Label>
            <div className="relative">
              <Input type="number" min={0} max={100} value={config.sinalPercentage} onChange={(e) => setConfig({ ...config, sinalPercentage: Number(e.target.value) })} className="h-9 pl-4 pr-8" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">%</span>
            </div>
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mt-2">
          <Save size={16} /> {loading ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  )
}

// ─── Cadastro de Produto ──────────────────────────────────────────────────────
function SectionCadastro() {
  const { addProduct, products, editingProduct, setEditingProduct, updateProduct, setSection, categories, setCollections, collections } = useAdminStore()

  const emptyForm = (): Omit<Product, "id" | "createdAt"> => ({
    name: "", description: "", category: "noiva", collection: "",
    sku: "", size: "", color: "", condition: "nova",
    stock: "livre", quantity: 1, rentalPrice: 0, salePrice: undefined,
    showPrice: false, featured: false, hidden: false,
    images: [], maintenanceNotes: "",
    customWindowBefore: undefined, customWindowAfter: undefined,
  })

  const [form, setForm] = useState(emptyForm())
  const [saved, setSaved] = useState(false)
  const [coverIdx, setCoverIdx] = useState(0)

  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name || "",
        description: editingProduct.description || "",
        category: editingProduct.category || "noiva",
        collection: editingProduct.collection?.toUpperCase() || "", 
        sku: editingProduct.sku || "",
        size: editingProduct.size || "",
        color: editingProduct.color || "",
        condition: editingProduct.condition || "nova",
        stock: editingProduct.stock || "livre",
        quantity: editingProduct.quantity || 1,
        rentalPrice: editingProduct.rentalPrice || 0,
        salePrice: editingProduct.salePrice,
        showPrice: editingProduct.showPrice || false,
        featured: editingProduct.featured || false,
        hidden: editingProduct.hidden || false,
        images: editingProduct.images || [],
        maintenanceNotes: editingProduct.maintenanceNotes || "",
        customWindowBefore: editingProduct.customWindowBefore,
        customWindowAfter: editingProduct.customWindowAfter,
      })
      setCoverIdx(0)
    } else {
      setForm(emptyForm())
    }
  }, [editingProduct])

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }))

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const slotsAvailable = 6 - form.images.length
    const filesToProcess = files.slice(0, slotsAvailable)

    filesToProcess.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setForm(prev => {
          const newImages = [...prev.images, base64String].slice(0, 6)
          return { ...prev, images: newImages }
        })
      }
      reader.readAsDataURL(file)
    })
    e.target.value = "" 
  }

  const handleRemoveImage = (idx: number) => {
    const updated = form.images.filter((_, i) => i !== idx)
    set("images", updated)
    if (coverIdx >= updated.length) setCoverIdx(0)
  }

  const handleMoveImage = (from: number, to: number) => {
    if (to < 0 || to >= form.images.length) return
    const arr = [...form.images]
    const [item] = arr.splice(from, 1)
    arr.splice(to, 0, item)
    set("images", arr)
    if (coverIdx === from) setCoverIdx(to)
  }

  const handleSave = async () => {
    if (!form.name || !form.sku || !form.rentalPrice) return 
    try {
      if (editingProduct) {
        const response = await fetch(`/api/produtos?id=${editingProduct.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        const result = await response.json()
        if (result.success) {
          updateProduct(editingProduct.id, form)
          const resCol = await fetch('/api/colecoes')
          if(resCol.ok) setCollections(await resCol.json())
          setSaved(true)
          setTimeout(() => { setSaved(false); setEditingProduct(null); setSection("estoque") }, 1500)
        }
      } else {
        const response = await fetch('/api/produtos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        const result = await response.json()
        if (result.success) {
          const product: Product = { ...form, id: result.produtoId.toString(), createdAt: new Date().toISOString().split("T")[0] }
          addProduct(product)
          const resCol = await fetch('/api/colecoes')
          if(resCol.ok) setCollections(await resCol.json())
          setSaved(true)
          setForm(emptyForm())
          setCoverIdx(0)
          setTimeout(() => setSaved(false), 3000)
        }
      }
    } catch (error) { alert("Erro de conexão com a API.") }
  }

  const previewImage = form.images[coverIdx] ?? null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{editingProduct ? "Editar Produto" : "Cadastro de Produto"}</h1>
          <p className="text-sm text-muted-foreground">{editingProduct ? `A alterar o produto: ${editingProduct.sku}` : `${products.length} produtos cadastrados`}</p>
        </div>
        {saved && <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-medium px-4 py-2 rounded-full"><CheckCircle2 size={14} /> {editingProduct ? "Atualizado!" : "Produto salvo!"}</div>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="bg-white rounded-xl border border-border p-6 flex flex-col gap-5">
            <h2 className="text-sm font-semibold text-foreground border-b border-border pb-3">1. Informações Básicas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><Label className="text-xs mb-1.5">Nome do Modelo *</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex: Sereia Rendado Premium" className="h-9" /></div>
              <div className="sm:col-span-2"><Label className="text-xs mb-1.5">Descrição Detalhada</Label><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className="resize-none text-sm" /></div>
              <div>
                <Label className="text-xs mb-1.5">Categoria</Label>
                <Select value={form.category} onValueChange={(v) => set("category", v)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1.5">Coleção</Label>
                <Input 
                  list="colecoes-list"
                  value={form.collection} 
                  onChange={(e) => set("collection", e.target.value.toUpperCase())} 
                  placeholder="EX: OUTONO" 
                  className="h-9 uppercase" 
                />
                <datalist id="colecoes-list">
                  {collections.map(c => (
                    <option key={c.id} value={c.name.toUpperCase()} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-6 flex flex-col gap-5">
            <h2 className="text-sm font-semibold text-foreground border-b border-border pb-3">2. Gestão de SKU & Peças</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="col-span-2 sm:col-span-1"><Label className="text-xs mb-1.5">SKU *</Label><Input value={form.sku} onChange={(e) => set("sku", e.target.value)} className="h-9 font-mono" /></div>
              <div><Label className="text-xs mb-1.5">Tamanho</Label><Input value={form.size} onChange={(e) => set("size", e.target.value)} className="h-9" /></div>
              <div><Label className="text-xs mb-1.5">Cor</Label><Input value={form.color} onChange={(e) => set("color", e.target.value)} className="h-9" /></div>
              <div><Label className="text-xs mb-1.5">Quantidade</Label><Input type="number" min={1} value={form.quantity || 1} onChange={(e) => set("quantity", Number(e.target.value))} className="h-9" /></div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-6 flex flex-col gap-5">
            <h2 className="text-sm font-semibold text-foreground border-b border-border pb-3">3. Regras de Negócio</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs mb-1.5">Status Inicial</Label>
                <Select value={form.stock} onValueChange={(v) => set("stock", v as any)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="livre">Disponível</SelectItem>
                    <SelectItem value="alugado">Alugado</SelectItem>
                    <SelectItem value="manutencao">Em Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1.5">Valor de Aluguel *</Label>
                <Input type="number" min={0} value={form.rentalPrice || ""} onChange={(e) => set("rentalPrice", Number(e.target.value))} className="h-9" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-1">
              <div className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3 flex-1"><div><p className="text-sm font-medium">Exibir Preço</p></div><Switch checked={form.showPrice} onCheckedChange={(v) => set("showPrice", v)} /></div>
              <div className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3 flex-1"><div><p className="text-sm font-medium">Destaque na Home</p></div><Switch checked={form.featured} onCheckedChange={(v) => set("featured", v)} /></div>
              <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-4 py-3 flex-1"><div><p className="text-sm font-medium">Ocultar da Vitrine</p></div><Switch checked={form.hidden} onCheckedChange={(v) => set("hidden", v)} /></div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={!form.name || !form.sku || !form.rentalPrice} className="py-3 px-8 text-sm font-semibold gap-2 bg-primary">
              <Save size={15} /> {editingProduct ? "Atualizar Produto" : "Salvar Produto"}
            </Button>
            {editingProduct && <Button onClick={() => {setEditingProduct(null); setSection("estoque")}} variant="outline" className="py-3 px-8 text-sm font-semibold">Cancelar Edição</Button>}
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-6">
          <div className="bg-white rounded-xl border border-border p-4 flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold mb-0.5">4. Mídia e Visual</p>
              <p className="text-[11px] text-muted-foreground">Arraste a capa com as setas.</p>
            </div>

            {form.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {form.images.map((src, i) => (
                  <div key={i} className="relative group">
                    <button onClick={() => setCoverIdx(i)} className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${i === coverIdx ? "border-primary" : "border-transparent"}`}>
                      <Image src={src} alt={`Foto ${i + 1}`} fill className="object-cover object-top" sizes="80px" />
                    </button>
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-1 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground/60 rounded-b-lg py-0.5">
                      <button onClick={() => handleMoveImage(i, i - 1)} disabled={i === 0} className="text-white text-[10px] px-1 disabled:opacity-30">&#x2190;</button>
                      <button onClick={() => handleRemoveImage(i)} className="text-white text-[10px] px-1">&#x2715;</button>
                      <button onClick={() => handleMoveImage(i, i + 1)} disabled={i === form.images.length - 1} className="text-white text-[10px] px-1 disabled:opacity-30">&#x2192;</button>
                    </div>
                    {i === coverIdx && <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">Capa</span>}
                  </div>
                ))}
              </div>
            )}

            <div>
              <input type="file" id="image-upload" accept="image/*" multiple className="hidden" onChange={handleFileUpload} disabled={form.images.length >= 6} />
              <label htmlFor="image-upload" className={`w-full flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg py-3.5 text-xs text-muted-foreground transition-all ${form.images.length >= 6 ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:border-primary/50 hover:text-primary"}`}>
                <Upload size={14} /> {form.images.length === 0 ? "Adicionar Fotos" : `Adicionar mais (${form.images.length}/6)`}
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Coleções Sazonais ────────────────────────────────────────────────────────
function SectionColecoes() {
  const { collections, setCollections, products, addCollection, updateCollection, deleteCollection } = useAdminStore()
  const [editing, setEditing] = useState<SeasonalCollection | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [form, setForm] = useState({ name: "", description: "", productIds: [] as string[] })

  const openCreate = () => { setForm({ name: "", description: "", productIds: [] }); setEditing(null); setIsCreating(true); }
  const openEdit = (col: SeasonalCollection) => { setForm({ name: col.name, description: col.description || "", productIds: col.productIds }); setEditing(col); setIsCreating(true); }

  const handleSave = async () => {
    if (!form.name) return
    if (editing) {
      const res = await fetch(`/api/colecoes?id=${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) updateCollection(editing.id, form)
    } else {
      const res = await fetch('/api/colecoes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, active: false }) })
      if (res.ok) {
        const data = await res.json()
        addCollection({ id: data.id, ...form, active: false })
      }
    }
    setIsCreating(false)
    setEditing(null)
  }

  const handleAtivar = async (id: string) => {
    const res = await fetch(`/api/colecoes?id=${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: true }) })
    if (res.ok) {
      const updated = collections.map(c => ({ ...c, active: c.id === id }))
      setCollections(updated)
    }
  }

  const handleApagar = async (id: string) => {
    if (!confirm("Apagar coleção?")) return
    const res = await fetch(`/api/colecoes?id=${id}`, { method: 'DELETE' })
    if (res.ok) deleteCollection(id)
  }

  const toggleProduct = (id: string) => {
    setForm(f => ({ ...f, productIds: f.productIds.includes(id) ? f.productIds.filter(p => p !== id) : [...f.productIds, id] }))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Coleções Sazonais</h1>
          <p className="text-sm text-muted-foreground">A coleção ativa é exibida em destaque na home da vitrine.</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={openCreate}><Plus size={14} /> Nova Coleção</Button>
      </div>

      {isCreating && (
        <div className="bg-white rounded-xl border border-primary/30 p-6 flex flex-col gap-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">{editing ? `Editando: ${editing.name}` : "Nova Coleção"}</h2>
            <button onClick={() => setIsCreating(false)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label className="text-xs mb-1.5">Nome da Coleção *</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ex: Outono 2027" className="h-9" /></div>
            <div><Label className="text-xs mb-1.5">Subtítulo (exibido na home)</Label><Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Ex: Elegância para momentos únicos." className="h-9" /></div>
          </div>

          <div>
            <Label className="text-xs mb-2">Peças desta Coleção</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
              {products.map((p) => {
                const selected = form.productIds.includes(p.id)
                const coverImg = p.images && p.images.length > 0 ? p.images[0] : "/images/vestido-aurora.jpg"
                
                return (
                  <button key={p.id} onClick={() => toggleProduct(p.id)} className={`relative flex flex-col rounded-xl overflow-hidden border-2 transition-all text-left ${selected ? "border-primary shadow-sm" : "border-border hover:border-primary/40"}`}>
                    <div className="relative aspect-[3/4] bg-secondary w-full">
                      <Image src={coverImg} alt={p.name} fill className="object-cover object-top" sizes="160px" />
                      {selected && <div className="absolute inset-0 bg-primary/10 flex items-start justify-end p-2"><CheckCircle2 size={16} className="text-primary bg-white rounded-full" /></div>}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">{p.sku} · {p.size}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button onClick={handleSave} disabled={!form.name} className="gap-1.5"><Save size={14} /> {editing ? "Salvar Alterações" : "Criar Coleção"}</Button>
            <Button variant="outline" onClick={() => setIsCreating(false)}>Cancelar</Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {collections.map((col) => {
          const colProducts = products.filter((p) => col.productIds.includes(p.id))
          return (
            <div key={col.id} className={`bg-white rounded-xl border overflow-hidden transition-all ${col.active ? "border-primary/40 shadow-sm" : "border-border"}`}>
              <div className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap border-b border-border">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${col.active ? "bg-primary" : "bg-border"}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{col.name}</p>
                      {col.active && <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Destaque ativo</span>}
                    </div>
                    {col.description && <p className="text-xs text-muted-foreground mt-0.5">{col.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {!col.active && (
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/5" onClick={() => handleAtivar(col.id)}><RadioTower size={11} /> Ativar Destaque</Button>
                  )}
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(col as SeasonalCollection)}><Pencil size={12} /></Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:bg-red-50" onClick={() => handleApagar(col.id)}><Trash2 size={12} /></Button>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Layers size={13} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">{colProducts.length} peça{colProducts.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {colProducts.map((p) => {
                    const coverImg = p.images && p.images.length > 0 ? p.images[0] : "/images/vestido-aurora.jpg"
                    return (
                    <div key={p.id} className="shrink-0 w-36 flex flex-col rounded-lg overflow-hidden border border-border">
                      <div className="relative aspect-[3/4] bg-secondary">
                        <Image src={coverImg} alt={p.name} fill className="object-cover object-top" sizes="144px" />
                      </div>
                      <div className="p-2.5 flex flex-col gap-1.5">
                        <div>
                          <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">{p.sku} · T{p.size}</p>
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Gestão de Categorias ──────────────────────────────────────────────────────
function SectionCategorias() {
  const { categories, setCategories } = useAdminStore()
  const [novoNome, setNovoNome] = useState("")

  const handleCriar = async () => {
    if (!novoNome) return
    const res = await fetch('/api/categorias', { method: 'POST', body: JSON.stringify({ name: novoNome }) })
    if (res.ok) {
      const data = await res.json()
      setCategories([...categories, { id: data.id, name: novoNome, slug: data.slug }])
      setNovoNome("")
    }
  }

  const handleApagar = async (id: string) => {
    if (!confirm("Tem certeza que deseja apagar esta categoria?")) return
    const res = await fetch(`/api/categorias?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setCategories(categories.filter(c => c.id !== id))
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Categorias da Loja</h1>
        <p className="text-sm text-muted-foreground">Gerencie as categorias da vitrine.</p>
      </div>

      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-end gap-4 mb-8">
          <div className="flex-1">
            <Label className="text-xs mb-1.5">Nova Categoria</Label>
            <Input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Ex: Daminhas" className="h-9" />
          </div>
          <Button onClick={handleCriar} disabled={!novoNome} className="h-9 gap-2">
            <Plus size={14} /> Adicionar
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30">
              <div className="flex items-center gap-3">
                <Tag size={16} className="text-primary" />
                <span className="font-medium text-sm">{cat.name}</span>
                <span className="text-xs text-muted-foreground font-mono">({cat.slug})</span>
              </div>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:bg-red-50" onClick={() => handleApagar(cat.id)}>
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Page Principal ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const { section, setOrders, setProducts, setStoreConfig, setCategories, setCollections, setTransactions } = useAdminStore()

  useEffect(() => {
    async function carregarDadosReais() {
      try {
        const resPedidos = await fetch('/api/pedidos')
        const dadosPedidos = await resPedidos.json()
        if (Array.isArray(dadosPedidos)) setOrders(dadosPedidos)

        const resProdutos = await fetch('/api/produtos')
        const dadosProdutos = await resProdutos.json()
        if (Array.isArray(dadosProdutos)) setProducts(dadosProdutos)
        
        const resConfig = await fetch('/api/configuracoes')
        const dadosConfig = await resConfig.json()
        if (dadosConfig && !dadosConfig.error) setStoreConfig(dadosConfig)

        const resCategorias = await fetch('/api/categorias')
        const dadosCategorias = await resCategorias.json()
        if (Array.isArray(dadosCategorias)) setCategories(dadosCategorias)

        const resColecoes = await fetch('/api/colecoes')
        const dadosColecoes = await resColecoes.json()
        if (Array.isArray(dadosColecoes)) setCollections(dadosColecoes)

        const resFin = await fetch('/api/financeiro')
        const dadosFin = await resFin.json()
        if (Array.isArray(dadosFin)) setTransactions(dadosFin)

      } catch (error) {
        console.error("Erro ao carregar do MySQL:", error)
      }
    }
    carregarDadosReais()
  }, [setOrders, setProducts, setStoreConfig, setCategories, setCollections, setTransactions])

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-8 min-w-0 overflow-x-hidden">
        {section === "dashboard" && <SectionDashboard />}
        {section === "pedidos" && <SectionPedidos />}
        {section === "financeiro" && <SectionFinanceiro />}
        {section === "estoque" && <SectionEstoque />}
        {section === "cadastro" && <SectionCadastro />}
        {section === "colecoes" && <SectionColecoes />}
        {section === "categorias" && <SectionCategorias />}
        {section === "horarios" && <ConfigHorarios />}      
        {section === "configuracoes" && <SectionConfiguracoes />}
      </main>

      <ModalPedido />
      <ModalNovoPedido />
    </div>
  )
}