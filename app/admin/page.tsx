"use client"

import { useState } from "react"
import { useAdminStore } from "@/lib/admin-store"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { MetricCard } from "@/components/admin/metric-card"
import { OrderStatusBadge, StockStatusBadge } from "@/components/admin/status-badge"
import { ModalPedido } from "@/components/admin/modal-pedido"
import { ModalFechamento } from "@/components/admin/modal-fechamento"
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
} from "lucide-react"
import type { Product, SeasonalCollection } from "@/lib/admin-store"

// ─── Dashboard ───────────────────────────────────────────────────────────────
function SectionDashboard() {
  const { orders, catalog, setSelectedOrder, setOrderModalOpen } = useAdminStore()

  const today = new Date().toISOString().split("T")[0]

  // --- Agenda do Dia ---
  const todayOrders = orders
    .filter((o) => o.provaDate === today && o.status !== "cancelado")
    .sort((a, b) => a.provaTime.localeCompare(b.provaTime))

  // --- Alertas de Conflito ---
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  const nextWeekStr = nextWeek.toISOString().split("T")[0]

  const rentedIds = new Set(catalog.filter((d) => d.stock === "alugado").map((d) => d.id))
  const conflicts = orders.filter((o) => {
    if (o.status === "cancelado") return false
    if (o.provaDate < today || o.provaDate > nextWeekStr) return false
    return o.items.some((item) => rentedIds.has(item.id))
  })

  // --- Métricas de Conversão ---
  const totalNoivas = orders.length
  const fechados = orders.filter((o) => o.status === "compareceu").length
  const taxaConversao = totalNoivas > 0 ? Math.round((fechados / totalNoivas) * 100) : 0
  const pendentes = orders.filter((o) => o.status === "pendente").length
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

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Provas Hoje" value={todayOrders.length} sub="agendamentos para hoje" icon={CalendarCheck} accent="blue" />
        <MetricCard title="Pendentes" value={pendentes} sub="aguardando confirmação" icon={ClipboardList} accent="amber" />
        <MetricCard title="Taxa de Conversão" value={`${taxaConversao}%`} sub={`${fechados} de ${totalNoivas} noivas`} icon={TrendingUp} accent="green" />
        <MetricCard
          title="Faturamento Pendente"
          value={`R$ ${faturamentoPendente.toLocaleString("pt-BR")}`}
          sub="saldo a receber"
          icon={DollarSign}
          accent="red"
        />
      </div>

      {/* Alertas de Conflito */}
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
                    <p className="text-sm font-medium text-foreground">
                      {order.clientName}
                      <span className="ml-2 text-xs text-muted-foreground font-normal">{order.id}</span>
                    </p>
                    <p className="text-xs text-amber-700">
                      Prova em {new Date(order.provaDate + "T12:00:00").toLocaleDateString("pt-BR")} às {order.provaTime}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {conflictItems.map((item) => (
                        <span key={item.id} className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                          {item.name} ({item.sku}) — ainda alugado
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs shrink-0 border-amber-300 text-amber-700 hover:bg-amber-50"
                    onClick={() => { setSelectedOrder(order); setOrderModalOpen(true) }}
                  >
                    <Pencil size={11} className="mr-1" /> Ver Pedido
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agenda do Dia */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Clock size={15} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Agenda do Dia</h2>
            {todayOrders.length > 0 && (
              <span className="ml-auto text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
                {todayOrders.length}
              </span>
            )}
          </div>
          {todayOrders.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              Nenhuma prova agendada para hoje.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {todayOrders.map((order) => (
                <div key={order.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 text-center">
                      <p className="text-xs font-bold text-primary leading-none">{order.provaTime}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{order.clientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.items.length} peça{order.items.length !== 1 ? "s" : ""} &middot; {order.clientPhone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <OrderStatusBadge status={order.status} />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => { setSelectedOrder(order); setOrderModalOpen(true) }}
                    >
                      <Pencil size={12} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Métricas de Conversão */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <BarChart3 size={15} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Métricas de Conversão</h2>
          </div>
          <div className="p-5 flex flex-col gap-5">
            {/* Funil visual */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">Total de noivas</span>
                </div>
                <span className="font-semibold text-foreground">{totalNoivas}</span>
              </div>
              <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: "100%" }} />
              </div>

              <div className="flex items-center justify-between text-sm mt-1">
                <div className="flex items-center gap-2">
                  <CalendarCheck size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">Vieram provar</span>
                </div>
                <span className="font-semibold text-foreground">
                  {orders.filter((o) => o.status === "compareceu" || o.status === "confirmado").length}
                </span>
              </div>
              <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{
                    width: totalNoivas > 0
                      ? `${Math.round((orders.filter((o) => o.status === "compareceu" || o.status === "confirmado").length / totalNoivas) * 100)}%`
                      : "0%",
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-sm mt-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">Contratos fechados</span>
                </div>
                <span className="font-semibold text-foreground">{fechados}</span>
              </div>
              <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: totalNoivas > 0 ? `${taxaConversao}%` : "0%" }}
                />
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

      {/* Próximos agendamentos */}
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
              {[...orders]
                .filter((o) => o.status !== "cancelado" && o.provaDate >= today)
                .sort((a, b) => a.provaDate.localeCompare(b.provaDate))
                .slice(0, 6)
                .map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{order.id}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">{order.clientName}</p>
                      <p className="text-xs text-muted-foreground">{order.clientPhone}</p>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{new Date(order.provaDate + "T12:00:00").toLocaleDateString("pt-BR")} · {order.provaTime}</td>
                    <td className="px-5 py-3 text-muted-foreground">{order.items.length} peça{order.items.length !== 1 ? "s" : ""}</td>
                    <td className="px-5 py-3"><OrderStatusBadge status={order.status} /></td>
                    <td className="px-5 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs gap-1"
                        onClick={() => { setSelectedOrder(order); setOrderModalOpen(true) }}
                      >
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
  const {
    orders,
    filterStatus,
    setFilterStatus,
    filterDate,
    setFilterDate,
    setSelectedOrder,
    setOrderModalOpen,
    setFinancialModalOpen,
    setNewOrderModalOpen,
  } = useAdminStore()

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
        <Button size="sm" className="gap-1.5" onClick={() => setNewOrderModalOpen(true)}>
          <Plus size={14} /> Novo Agendamento
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap items-center bg-white border border-border rounded-xl p-4">
        <Filter size={15} className="text-muted-foreground shrink-0" />
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
          <SelectTrigger className="h-8 text-xs w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="compareceu">Compareceu</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="h-8 text-xs w-40"
        />
        {(filterStatus !== "todos" || filterDate) && (
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { setFilterStatus("todos"); setFilterDate("") }}>
            Limpar filtros
          </Button>
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
                const total = order.totalValue ?? order.items.reduce((s, i) => s + i.price - (i.discount ?? 0), 0)
                return (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{order.id}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">{order.clientName}</p>
                      <p className="text-xs text-muted-foreground">{order.clientEmail}</p>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{order.provaDate}<br />{order.provaTime}</td>
                    <td className="px-5 py-3 font-medium text-foreground">
                      {total > 0 ? `R$ ${total.toLocaleString("pt-BR")}` : "—"}
                    </td>
                    <td className="px-5 py-3"><OrderStatusBadge status={order.status} /></td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs gap-1"
                          onClick={() => { setSelectedOrder(order); setOrderModalOpen(true) }}
                        >
                          <Pencil size={12} /> Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs gap-1"
                          onClick={() => { setSelectedOrder(order); setFinancialModalOpen(true) }}
                        >
                          <FileSignature size={12} /> Fechar
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    Nenhum pedido encontrado com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Estoque ─────────────────────────────────────────────────────────────────
function SectionEstoque() {
  const { catalog, overrideStockStatus } = useAdminStore()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Gestão de Estoque</h1>
        <p className="text-sm text-muted-foreground">{catalog.length} peças cadastradas</p>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Peça</th>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">SKU</th>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tamanho</th>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Valor</th>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Override</th>
              </tr>
            </thead>
            <tbody>
              {catalog.map((dress) => (
                <tr key={dress.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-12 rounded-md overflow-hidden bg-border shrink-0">
                        <Image src={dress.image} alt={dress.name} fill className="object-cover" />
                      </div>
                      <span className="font-medium text-foreground">{dress.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{dress.sku}</td>
                  <td className="px-5 py-3 text-muted-foreground">{dress.size}</td>
                  <td className="px-5 py-3 font-medium text-foreground">R$ {dress.price.toLocaleString("pt-BR")}</td>
                  <td className="px-5 py-3"><StockStatusBadge status={dress.stock} /></td>
                  <td className="px-5 py-3 text-right">
                    {dress.stock !== "livre" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1 border-amber-300 text-amber-700 hover:bg-amber-50"
                        onClick={() => overrideStockStatus(dress.id, "livre")}
                        title="Forçar disponibilidade"
                      >
                        <Zap size={11} /> Forçar Livre
                      </Button>
                    )}
                    {dress.stock === "livre" && (
                      <span className="text-xs text-muted-foreground">Disponível</span>
                    )}
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

// ─── Configurações ────────────────────────────────────────────────────────────
function SectionConfiguracoes() {
  const { storeConfig, setStoreConfig } = useAdminStore()

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Configurações da Loja</h1>
        <p className="text-sm text-muted-foreground">Parâmetros de operação e atendimento</p>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 flex flex-col gap-5">
        <div>
          <p className="text-sm font-semibold text-foreground mb-1">Janela de Locação</p>
          <p className="text-xs text-muted-foreground mb-4">
            Quantos dias antes e depois do casamento o vestido pode ser retirado/devolvido.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs mb-1.5">Dias antes do casamento</Label>
              <Input
                type="number"
                min={1}
                max={30}
                value={storeConfig.windowBefore}
                onChange={(e) => setStoreConfig({ windowBefore: Number(e.target.value) })}
                className="h-9"
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5">Dias depois do casamento</Label>
              <Input
                type="number"
                min={1}
                max={30}
                value={storeConfig.windowAfter}
                onChange={(e) => setStoreConfig({ windowAfter: Number(e.target.value) })}
                className="h-9"
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <p className="text-sm font-semibold text-foreground mb-1">Capacidade de Atendimento</p>
          <p className="text-xs text-muted-foreground mb-4">
            Número máximo de provadores disponíveis simultaneamente na loja.
          </p>
          <div className="max-w-xs">
            <Label className="text-xs mb-1.5">Número de provadores</Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={storeConfig.provadores}
              onChange={(e) => setStoreConfig({ provadores: Number(e.target.value) })}
              className="h-9"
            />
          </div>
        </div>

        <Separator />

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground space-y-1">
          <p>Janela atual: <span className="font-medium text-foreground">{storeConfig.windowBefore} dias antes</span> + <span className="font-medium text-foreground">{storeConfig.windowAfter} dias depois</span></p>
          <p>Atendimentos simultâneos: <span className="font-medium text-foreground">{storeConfig.provadores} provador{storeConfig.provadores !== 1 ? "es" : ""}</span></p>
        </div>

        <Button size="sm" className="w-fit gap-1.5">
          <Save size={13} /> Salvar Configurações
        </Button>
      </div>
    </div>
  )
}

// ─── Cadastro de Produto ──────────────────────────────────────────────────────
function SectionCadastro() {
  const { addProduct, products } = useAdminStore()

  const emptyForm = (): Omit<Product, "id" | "createdAt"> => ({
    name: "", description: "", category: "noiva", collection: "",
    sku: "", size: "", color: "", condition: "nova",
    stock: "livre", rentalPrice: 0, salePrice: undefined,
    showPrice: false, featured: false, hidden: false,
    images: [], maintenanceNotes: "",
    customWindowBefore: undefined, customWindowAfter: undefined,
  })

  const [form, setForm] = useState(emptyForm())
  const [saved, setSaved] = useState(false)
  const [coverIdx, setCoverIdx] = useState(0)

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const handleAddImage = () => {
    const placeholders = [
      "/images/vestido-aurora.jpg",
      "/images/vestido-isabela.jpg",
      "/images/vestido-valentina.jpg",
      "/images/vestido-sofia.jpg",
      "/images/vestido-luna.jpg",
      "/images/vestido-bianca.jpg",
    ]
    const next = placeholders[form.images.length % placeholders.length]
    if (form.images.length < 6) set("images", [...form.images, next])
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

  const handleSave = () => {
    if (!form.name || !form.sku) return
    const product: Product = {
      ...form,
      id: `p${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    }
    addProduct(product)
    setSaved(true)
    setForm(emptyForm())
    setCoverIdx(0)
    setTimeout(() => setSaved(false), 3000)
  }

  const previewImage = form.images[coverIdx] ?? null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Cadastro de Produto</h1>
          <p className="text-sm text-muted-foreground">{products.length} produtos cadastrados</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-medium px-4 py-2 rounded-full">
            <CheckCircle2 size={14} /> Produto salvo com sucesso!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* 1. Informações Básicas */}
          <div className="bg-white rounded-xl border border-border p-6 flex flex-col gap-5">
            <h2 className="text-sm font-semibold text-foreground border-b border-border pb-3">
              1. Informações Básicas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label className="text-xs mb-1.5">Nome do Modelo *</Label>
                <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex: Sereia Rendado Premium" className="h-9" />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs mb-1.5">Descrição Detalhada</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Tecido, estilo de renda, tipo de cauda..."
                  rows={3}
                  className="resize-none text-sm"
                />
              </div>
              <div>
                <Label className="text-xs mb-1.5">Categoria</Label>
                <Select value={form.category} onValueChange={(v) => set("category", v as any)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="noiva">Noiva</SelectItem>
                    <SelectItem value="debutante">Debutante</SelectItem>
                    <SelectItem value="festa">Festa</SelectItem>
                    <SelectItem value="acessorios">Acessórios</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1.5">Coleção</Label>
                <Input value={form.collection} onChange={(e) => set("collection", e.target.value)} placeholder="Ex: Primavera 2026" className="h-9" />
              </div>
            </div>
          </div>

          {/* 2. Gestão de SKU */}
          <div className="bg-white rounded-xl border border-border p-6 flex flex-col gap-5">
            <h2 className="text-sm font-semibold text-foreground border-b border-border pb-3">
              2. Gestão de SKU — Peça Física
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <Label className="text-xs mb-1.5">SKU / Código Único *</Label>
                <Input value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="Ex: HN-007" className="h-9 font-mono" />
              </div>
              <div>
                <Label className="text-xs mb-1.5">Tamanho / Manequim</Label>
                <Input value={form.size} onChange={(e) => set("size", e.target.value)} placeholder="Ex: 38, 40, 42" className="h-9" />
              </div>
              <div>
                <Label className="text-xs mb-1.5">Cor</Label>
                <Input value={form.color} onChange={(e) => set("color", e.target.value)} placeholder="Ex: Branco Puro" className="h-9" />
              </div>
              <div>
                <Label className="text-xs mb-1.5">Condição da Peça</Label>
                <Select value={form.condition} onValueChange={(v) => set("condition", v as any)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nova">Nova</SelectItem>
                    <SelectItem value="usada">Usada / Aluguel</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 3. Regras de Negócio */}
          <div className="bg-white rounded-xl border border-border p-6 flex flex-col gap-5">
            <h2 className="text-sm font-semibold text-foreground border-b border-border pb-3">
              3. Regras de Negócio e Disponibilidade
            </h2>
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
                <Label className="text-xs mb-1.5">Valor de Aluguel (R$)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.rentalPrice || ""}
                  onChange={(e) => set("rentalPrice", Number(e.target.value))}
                  placeholder="3.500"
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-xs mb-1.5">Valor de Venda (opcional)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.salePrice ?? ""}
                  onChange={(e) => set("salePrice", e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="9.800"
                  className="h-9"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-1">
              <div className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3 flex-1">
                <div>
                  <p className="text-sm font-medium text-foreground">Exibir Preço no Site</p>
                  <p className="text-xs text-muted-foreground">Mostra o valor para a noiva</p>
                </div>
                <Switch checked={form.showPrice} onCheckedChange={(v) => set("showPrice", v)} />
              </div>
              <div className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3 flex-1">
                <div>
                  <p className="text-sm font-medium text-foreground">Destaque na Home</p>
                  <p className="text-xs text-muted-foreground">Aparece em posição de destaque</p>
                </div>
                <Switch checked={form.featured} onCheckedChange={(v) => set("featured", v)} />
              </div>
              <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-4 py-3 flex-1">
                <div>
                  <p className="text-sm font-medium text-foreground">Ocultar da Vitrine</p>
                  <p className="text-xs text-muted-foreground">Não aparece para as noivas</p>
                </div>
                <Switch checked={form.hidden} onCheckedChange={(v) => set("hidden", v)} />
              </div>
            </div>
          </div>

          {/* 5. Configurações Operacionais */}
          <div className="bg-white rounded-xl border border-border p-6 flex flex-col gap-5">
            <h2 className="text-sm font-semibold text-foreground border-b border-border pb-3">
              5. Configurações Operacionais (por Peça)
            </h2>
            <div>
              <Label className="text-xs mb-1.5">Notas de Manutenção</Label>
              <Textarea
                value={form.maintenanceNotes}
                onChange={(e) => set("maintenanceNotes", e.target.value)}
                placeholder="Histórico de reparos, ajustes realizados..."
                rows={3}
                className="resize-none text-sm"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground mb-3">Janela de Bloqueio Customizada</p>
              <p className="text-xs text-muted-foreground mb-3">
                Deixe em branco para usar a regra geral da loja. Preencha para sobrescrever apenas para esta peça.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs mb-1.5">Dias antes do casamento</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.customWindowBefore ?? ""}
                    onChange={(e) => set("customWindowBefore", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Padrão da loja"
                    className="h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1.5">Dias depois do casamento</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.customWindowAfter ?? ""}
                    onChange={(e) => set("customWindowAfter", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Padrão da loja"
                    className="h-9"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={!form.name || !form.sku}
            className="w-full sm:w-auto py-3 px-8 text-sm font-semibold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40"
          >
            <Save size={15} /> Salvar Produto
          </Button>
        </div>

        {/* ── Preview + Mídia ── */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-6">
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-xs font-semibold text-foreground">Preview da Capa</p>
            </div>
            <div className="relative aspect-[3/4] bg-secondary">
              {previewImage ? (
                <Image src={previewImage} alt="Preview" fill className="object-cover object-top" sizes="320px" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                  <Upload size={28} className="opacity-30" />
                  <p className="text-xs">Nenhuma imagem</p>
                </div>
              )}
              {form.featured && (
                <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Destaque
                </span>
              )}
            </div>
            {form.name && (
              <div className="p-4">
                {form.category && (
                  <p className="text-[10px] tracking-[0.2em] uppercase text-primary mb-0.5">{form.category}</p>
                )}
                <p className="font-serif text-base text-foreground">{form.name}</p>
                {form.size && <p className="text-xs text-muted-foreground tracking-widest uppercase mt-0.5">Tamanho {form.size}</p>}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-border p-4 flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold text-foreground mb-0.5">4. Mídia e Visual</p>
              <p className="text-[11px] text-muted-foreground">Arraste para reordenar. A primeira é a capa.</p>
            </div>

            {form.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {form.images.map((src, i) => (
                  <div key={i} className="relative group">
                    <button
                      onClick={() => setCoverIdx(i)}
                      className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${i === coverIdx ? "border-primary" : "border-transparent"}`}
                    >
                      <Image src={src} alt={`Foto ${i + 1}`} fill className="object-cover object-top" sizes="80px" />
                    </button>
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-1 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground/60 rounded-b-lg py-0.5">
                      <button onClick={() => handleMoveImage(i, i - 1)} disabled={i === 0} className="text-white text-[10px] px-1 disabled:opacity-30">&#x2190;</button>
                      <button onClick={() => handleRemoveImage(i)} className="text-white text-[10px] px-1">&#x2715;</button>
                      <button onClick={() => handleMoveImage(i, i + 1)} disabled={i === form.images.length - 1} className="text-white text-[10px] px-1 disabled:opacity-30">&#x2192;</button>
                    </div>
                    {i === coverIdx && (
                      <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">Capa</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleAddImage}
              disabled={form.images.length >= 6}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg py-3.5 text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Upload size={14} />
              {form.images.length === 0 ? "Adicionar Fotos" : `Adicionar mais (${form.images.length}/6)`}
            </button>
            <p className="text-[11px] text-muted-foreground text-center">Frente, Costas e Detalhe — máx. 6 fotos</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Coleções Sazonais ────────────────────────────────────────────────────────
function SectionColecoes() {
  const { collections, products, addCollection, updateCollection, deleteCollection, setActiveCollection, toggleProductHidden } = useAdminStore()

  const [editing, setEditing] = useState<SeasonalCollection | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [form, setForm] = useState({ name: "", description: "", productIds: [] as string[] })

  const openCreate = () => {
    setForm({ name: "", description: "", productIds: [] })
    setEditing(null)
    setIsCreating(true)
  }

  const openEdit = (col: SeasonalCollection) => {
    setForm({ name: col.name, description: col.description, productIds: col.productIds })
    setEditing(col)
    setIsCreating(true)
  }

  const handleSave = () => {
    if (!form.name) return
    if (editing) {
      updateCollection(editing.id, { name: form.name, description: form.description, productIds: form.productIds })
    } else {
      addCollection({
        id: `col-${Date.now()}`,
        name: form.name,
        description: form.description,
        productIds: form.productIds,
        active: false,
        createdAt: new Date().toISOString().split("T")[0],
      })
    }
    setIsCreating(false)
    setEditing(null)
  }

  const toggleProduct = (id: string) => {
    setForm((f) => ({
      ...f,
      productIds: f.productIds.includes(id)
        ? f.productIds.filter((p) => p !== id)
        : [...f.productIds, id],
    }))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Coleções Sazonais</h1>
          <p className="text-sm text-muted-foreground">
            A coleção ativa é exibida em destaque na home da vitrine
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={openCreate}>
          <Plus size={14} /> Nova Coleção
        </Button>
      </div>

      {isCreating && (
        <div className="bg-white rounded-xl border border-primary/30 p-6 flex flex-col gap-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              {editing ? `Editando: ${editing.name}` : "Nova Coleção"}
            </h2>
            <button onClick={() => setIsCreating(false)} className="text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs mb-1.5">Nome da Coleção *</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ex: Outono 2027" className="h-9" />
            </div>
            <div>
              <Label className="text-xs mb-1.5">Subtítulo (exibido na home)</Label>
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Ex: Elegância para momentos únicos." className="h-9" />
            </div>
          </div>

          <div>
            <Label className="text-xs mb-2">Peças desta Coleção</Label>
            <p className="text-[11px] text-muted-foreground mb-3">
              Selecione as peças já cadastradas que fazem parte desta vitrine sazonal.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.map((p) => {
                const selected = form.productIds.includes(p.id)
                return (
                  <button
                    key={p.id}
                    onClick={() => toggleProduct(p.id)}
                    className={`relative flex flex-col rounded-xl overflow-hidden border-2 transition-all text-left ${
                      selected ? "border-primary shadow-sm" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="relative aspect-[3/4] bg-secondary w-full">
                      <Image src={p.images[0] ?? "/images/vestido-aurora.jpg"} alt={p.name} fill className="object-cover object-top" sizes="160px" />
                      {selected && (
                        <div className="absolute inset-0 bg-primary/10 flex items-start justify-end p-2">
                          <CheckCircle2 size={16} className="text-primary bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">{p.sku} · {p.size}</p>
                    </div>
                  </button>
                )
              })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              {form.productIds.length} peça{form.productIds.length !== 1 ? "s" : ""} selecionada{form.productIds.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button onClick={handleSave} disabled={!form.name} className="gap-1.5">
              <Save size={14} /> {editing ? "Salvar Alterações" : "Criar Coleção"}
            </Button>
            <Button variant="outline" onClick={() => setIsCreating(false)}>Cancelar</Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {collections.map((col) => {
          const colProducts = products.filter((p) => col.productIds.includes(p.id))
          return (
            <div
              key={col.id}
              className={`bg-white rounded-xl border overflow-hidden transition-all ${
                col.active ? "border-primary/40 shadow-sm" : "border-border"
              }`}
            >
              <div className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap border-b border-border">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${col.active ? "bg-primary" : "bg-border"}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{col.name}</p>
                      {col.active && (
                        <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                          Destaque ativo
                        </span>
                      )}
                    </div>
                    {col.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{col.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {!col.active && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/5"
                      onClick={() => setActiveCollection(col.id)}
                    >
                      <RadioTower size={11} /> Ativar Destaque
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(col)}>
                    <Pencil size={12} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-red-500 hover:bg-red-50"
                    onClick={() => deleteCollection(col.id)}
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>

              {colProducts.length === 0 ? (
                <div className="px-5 py-6 text-center text-sm text-muted-foreground">
                  Nenhuma peça associada a esta coleção.
                </div>
              ) : (
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Layers size={13} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-medium">
                      {colProducts.length} peça{colProducts.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {colProducts.map((p) => (
                      <div key={p.id} className="shrink-0 w-36 flex flex-col rounded-lg overflow-hidden border border-border">
                        <div className="relative aspect-[3/4] bg-secondary">
                          <Image
                            src={p.images[0] ?? "/images/vestido-aurora.jpg"}
                            alt={p.name}
                            fill
                            className="object-cover object-top"
                            sizes="144px"
                          />
                          {p.hidden && (
                            <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
                              <span className="text-[10px] bg-foreground text-background font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                Oculto
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-2.5 flex flex-col gap-1.5">
                          <div>
                            <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground">{p.sku} · T{p.size}</p>
                          </div>
                          <button
                            onClick={() => toggleProductHidden(p.id)}
                            className={`flex items-center gap-1 text-[10px] font-medium rounded px-1.5 py-1 transition-colors w-full justify-center ${
                              p.hidden
                                ? "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                : "bg-muted text-muted-foreground hover:bg-red-50 hover:text-red-600"
                            }`}
                          >
                            {p.hidden ? <Eye size={10} /> : <EyeOff size={10} />}
                            {p.hidden ? "Exibir" : "Ocultar"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Page Principal ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const { section } = useAdminStore()

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-8 min-w-0 overflow-x-hidden">
        {section === "dashboard" && <SectionDashboard />}
        {section === "pedidos" && <SectionPedidos />}
        {section === "estoque" && <SectionEstoque />}
        {section === "cadastro" && <SectionCadastro />}
        {section === "colecoes" && <SectionColecoes />}
        {section === "horarios" && <ConfigHorarios />}      
        {section === "configuracoes" && <SectionConfiguracoes />}
      </main>

      {/* Modals Globais */}
      <ModalPedido />
      <ModalFechamento />
      <ModalNovoPedido />
    </div>
  )
}