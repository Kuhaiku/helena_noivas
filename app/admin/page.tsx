"use client";

import { useState, useEffect, Fragment } from "react";
import { useAdminStore } from "@/lib/admin-store";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { MetricCard } from "@/components/admin/metric-card";
import {
  OrderStatusBadge,
  StockStatusBadge,
} from "@/components/admin/status-badge";
import { ModalPedido } from "@/components/admin/modal-pedido";
import { ModalNovoPedido } from "@/components/admin/modal-novo-pedido";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ConfigHorarios } from "@/components/admin/config-horarios";
import Image from "next/image";
import {
  CalendarCheck,
  ClipboardList,
  TrendingUp,
  DollarSign,
  Plus,
  Filter,
  Pencil,
  FileSignature,
  FileText,
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
  Tag,
  PackageCheck,
  PackageOpen,
  AlertCircle,
  Search,
  Unlock,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import type { Product, SeasonalCollection, Category } from "@/lib/admin-store";


// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function SectionDashboard() {
  const { orders, catalog, setSelectedOrder, setOrderModalOpen } =
    useAdminStore();
  const today = new Date().toISOString().split("T")[0];

  const todayOrders = orders
    .filter((o) => o.provaDate === today && o.status !== "cancelado")
    .sort((a, b) => a.provaTime.localeCompare(b.provaTime));

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split("T")[0];

  const rentedIds = new Set(
    catalog.filter((d) => d.stock === "alugado").map((d) => d.id),
  );
  const conflicts = orders.filter((o) => {
    if (o.status === "cancelado") return false;
    if (o.provaDate < today || o.provaDate > nextWeekStr) return false;
    return o.items.some((item) => rentedIds.has(item.id));
  });

  const totalNoivas = orders.length;
  const fechados = orders.filter(
    (o) =>
      o.status === "confirmado" ||
      o.status === "em_uso" ||
      o.status === "concluido",
  ).length;
  const taxaConversao =
    totalNoivas > 0 ? Math.round((fechados / totalNoivas) * 100) : 0;
  const pendentes = orders.filter(
    (o) =>
      o.status === "pendente" ||
      o.status === "novo" ||
      o.status === "compareceu",
  ).length;
  const faturamentoPendente = orders
    .filter((o) => o.status === "confirmado" && o.totalValue)
    .reduce((s, o) => s + (o.totalValue ?? 0) - (o.signalPaid ?? 0), 0);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Provas Hoje"
          value={todayOrders.length}
          sub="agendamentos para hoje"
          icon={CalendarCheck}
          accent="blue"
        />
        <MetricCard
          title="Aguardando Contrato"
          value={pendentes}
          sub="provas realizadas/pendentes"
          icon={ClipboardList}
          accent="amber"
        />
        <MetricCard
          title="Taxa de Conversão"
          value={`${taxaConversao}%`}
          sub={`${fechados} de ${totalNoivas} noivas`}
          icon={TrendingUp}
          accent="green"
        />
        <MetricCard
          title="Faturamento Pendente"
          value={`R$ ${faturamentoPendente.toLocaleString("pt-BR")}`}
          sub="saldo a receber nas retiradas"
          icon={DollarSign}
          accent="red"
        />
      </div>

      {conflicts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <h2 className="text-sm font-semibold text-amber-800">
              {conflicts.length} alerta{conflicts.length !== 1 ? "s" : ""} de
              conflito de estoque
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {conflicts.map((order) => {
              const conflictItems = order.items.filter((item) =>
                rentedIds.has(item.id),
              );
              return (
                <div
                  key={order.id}
                  className="flex items-start justify-between gap-4 bg-white rounded-lg border border-amber-100 p-4"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-foreground">
                      {order.clientName}{" "}
                      <span className="ml-2 text-xs text-muted-foreground font-normal">
                        {order.id}
                      </span>
                    </p>
                    <p className="text-xs text-amber-700">
                      Prova em{" "}
                      {new Date(
                        order.provaDate + "T12:00:00",
                      ).toLocaleDateString("pt-BR")}{" "}
                      às {order.provaTime}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {conflictItems.map((item) => (
                        <span
                          key={item.id}
                          className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium"
                        >
                          {item.name} ({item.sku}) — ainda alugado
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs shrink-0 border-amber-300 text-amber-700 hover:bg-amber-50"
                    onClick={() => {
                      setSelectedOrder(order);
                      setOrderModalOpen(true);
                    }}
                  >
                    <Pencil size={11} className="mr-1" /> Ver Pedido
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Clock size={15} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Agenda do Dia
            </h2>
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
                <div
                  key={order.id}
                  className="px-5 py-3.5 flex items-center justify-between hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 text-center">
                      <p className="text-xs font-bold text-primary leading-none">
                        {order.provaTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {order.clientName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.items?.length || 0} peça
                        {order.items?.length !== 1 ? "s" : ""} &middot;{" "}
                        {order.clientPhone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <OrderStatusBadge status={order.status} />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => {
                        setSelectedOrder(order);
                        setOrderModalOpen(true);
                      }}
                    >
                      <Pencil size={12} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <BarChart3 size={15} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Métricas de Conversão
            </h2>
          </div>
          <div className="p-5 flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">Total de noivas</span>
                </div>
                <span className="font-semibold text-foreground">
                  {totalNoivas}
                </span>
              </div>
              <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-400 rounded-full"
                  style={{ width: "100%" }}
                />
              </div>

              <div className="flex items-center justify-between text-sm mt-1">
                <div className="flex items-center gap-2">
                  <CalendarCheck size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">Vieram provar</span>
                </div>
                <span className="font-semibold text-foreground">
                  {
                    orders.filter(
                      (o) =>
                        o.status === "compareceu" ||
                        o.status === "confirmado" ||
                        o.status === "em_uso" ||
                        o.status === "concluido",
                    ).length
                  }
                </span>
              </div>
              <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{
                    width:
                      totalNoivas > 0
                        ? `${Math.round((orders.filter((o) => o.status === "compareceu" || o.status === "confirmado" || o.status === "em_uso" || o.status === "concluido").length / totalNoivas) * 100)}%`
                        : "0%",
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-sm mt-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Contratos fechados
                  </span>
                </div>
                <span className="font-semibold text-foreground">
                  {fechados}
                </span>
              </div>
              <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{
                    width: totalNoivas > 0 ? `${taxaConversao}%` : "0%",
                  }}
                />
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between bg-primary/5 rounded-lg px-4 py-3">
              <p className="text-sm text-foreground font-medium">
                Taxa de conversão geral
              </p>
              <p className="text-2xl font-bold font-serif text-primary">
                {taxaConversao}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ABA DE PEDIDOS & PROVAS ──────────────────────────────────────────────────
function SectionPedidos() {
  const {
    orders,
    filterStatus,
    setFilterStatus,
    filterDate,
    setFilterDate,
    setSelectedOrder,
    setOrderModalOpen,
    setNewOrderModalOpen,
  } = useAdminStore();

  // Aqui só mostra as intenções (provas que não viraram contratos ou foram canceladas recentemente)
  const filtered = orders.filter((o) => {
    const isProva =
      o.status === "novo" ||
      o.status === "pendente" ||
      o.status === "compareceu" ||
      o.status === "cancelado";
    const matchStatus =
      filterStatus === "todos" ? isProva : o.status === filterStatus;
    const matchDate = !filterDate || o.provaDate === filterDate;
    return matchStatus && matchDate;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Gestão de Provas
          </h1>
          <p className="text-sm text-muted-foreground">
            Converta agendamentos em contratos.
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => setNewOrderModalOpen(true)}
        >
          <Plus size={14} /> Novo Agendamento
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap items-center bg-white border border-border rounded-xl p-4">
        <Filter size={15} className="text-muted-foreground shrink-0" />
        <Select
          value={filterStatus}
          onValueChange={(v) => setFilterStatus(v as any)}
        >
          <SelectTrigger className="h-8 text-xs w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="novo">Novo</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
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
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() => {
              setFilterStatus("todos");
              setFilterDate("");
            }}
          >
            Limpar filtros
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase">
                  ID
                </th>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase">
                  Cliente
                </th>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase">
                  Prova
                </th>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase">
                  Status
                </th>
                <th className="text-right px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border hover:bg-muted/30"
                >
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                    {order.id}
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground">
                      {order.clientName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.clientPhone}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">
                    {order.provaDate.split("-").reverse().join("/")}
                    <br />
                    {order.provaTime}
                  </td>
                  <td className="px-5 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs gap-1"
                        onClick={() => {
                          setSelectedOrder(order);
                          setOrderModalOpen(true);
                        }}
                      >
                        <Pencil size={12} /> Editar
                      </Button>
                      {order.status !== "cancelado" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          onClick={() => {
                            window.location.href = `/admin/fechamento/${order.id}`;
                          }}
                        >
                          <FileSignature size={12} /> Fechar Contrato
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-muted-foreground"
                  >
                    Nenhuma prova pendente com estes filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


// ─── ABA DE LOGÍSTICA & GIRO DE PEÇAS ──────────────────────────────────────────
function SectionContratos() {
  const { orders, updateOrderStatus, updateProduct } = useAdminStore();

  // Filtramos apenas os contratos que afetam a logística atual
  const contratos = orders
    .filter((o) => o.status === "confirmado" || o.status === "em_uso")
    .sort((a, b) => (a.eventoDate || "").localeCompare(b.eventoDate || ""));

  // MÁGICA: Transformamos os contratos numa lista plana de PEÇAS ALUGADAS
  const pecasNaRua = contratos.flatMap((order) =>
    order.items.map((item) => ({
      ...item,
      orderId: order.id,
      clientName: order.clientName,
      clientPhone: order.clientPhone,
      eventoDate: order.eventoDate,
      status: order.status,
      orderRaw: order,
    }))
  ).sort((a, b) => (a.eventoDate || "").localeCompare(b.eventoDate || ""));

  const [devolvendo, setDevolvendo] = useState<any>(null);
  const [devolucaoStatus, setDevolucaoStatus] = useState<"livre" | "manutencao">("livre");
  const [multa, setMulta] = useState(0);
  
  // ESTADO PARA CONTROLAR A LINHA EXPANDIDA (O COMPROVANTE)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const registrarRetirada = async (order: any) => {
    const pendente = order.totalValue - (order.signalPaid || 0);
    if (pendente > 0) {
      if (!confirm(`ATENÇÃO! A cliente ainda deve R$ ${pendente.toFixed(2)}. Tem certeza que deseja liberar os vestidos sem registrar o pagamento?`)) return;
    } else {
      if (!confirm("Confirmar a retirada das peças pela cliente? O status mudará para 'Em Uso'.")) return;
    }

    const res = await fetch(`/api/pedidos?id=${order.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...order, status: "em_uso" }),
    });
    if (res.ok) updateOrderStatus(order.id, "em_uso");
  };

  const registrarDevolucao = async () => {
    if (!devolvendo) return;
    try {
      await fetch(`/api/pedidos?id=${devolvendo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...devolvendo, status: "concluido" }),
      });
      updateOrderStatus(devolvendo.id, "concluido");

      // Atualiza o estoque das peças devolvidas (Livre ou Manutenção)
      for (const item of devolvendo.items) {
        await fetch(`/api/produtos?id=${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stock: devolucaoStatus }),
        });
        updateProduct(item.id, { stock: devolucaoStatus });
      }

      if (multa > 0) {
        await fetch("/api/financeiro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "entrada",
            description: `Multa/Avaria - Contrato #${devolvendo.id}`,
            amount: multa,
            date: new Date().toISOString().split("T")[0],
            category: "Multa",
          }),
        });
      }

      setDevolvendo(null);
      setMulta(0);
      setDevolucaoStatus("livre");
      alert("Devolução concluída! Peças organizadas.");
    } catch (e) {
      alert("Erro ao concluir devolução.");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Logística & Giro de Peças
        </h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe onde está cada vestido e gira as retiradas e devoluções.
        </p>
      </div>

      <Tabs defaultValue="contratos" className="w-full flex flex-col gap-5">
        <TabsList className="w-fit bg-white border border-border shadow-sm h-11 px-1">
          <TabsTrigger value="contratos" className="gap-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
            <ClipboardList size={14} /> Visão por Contratos
          </TabsTrigger>
          <TabsTrigger value="pecas" className="gap-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
            <Layers size={14} /> Giro de Peças Individuais
          </TabsTrigger>
        </TabsList>

        {/* ── VISÃO 1: CONTRATOS COM EXPANSÃO (COMPROVANTE) ── */}
        <TabsContent value="contratos" className="m-0 focus-visible:outline-none">
          <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="w-10 px-3 py-3 text-center"></th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase">ID</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Cliente</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Casamento</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Ações</th>
                </tr>
              </thead>
              <tbody>
                {contratos.map((order) => {
                  const pendente = order.totalValue - (order.signalPaid || 0);
                  const isExpanded = expandedOrderId === order.id;

                  return (
                    <Fragment key={order.id}>
                      <tr 
                        className={`border-b border-border hover:bg-muted/30 transition-colors ${isExpanded ? 'bg-muted/10' : ''}`}
                      >
                        <td className="px-3 py-4 text-center cursor-pointer" onClick={() => toggleExpand(order.id)}>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </Button>
                        </td>
                        <td className="px-3 py-4 font-mono text-xs text-muted-foreground cursor-pointer" onClick={() => toggleExpand(order.id)}>
                          {order.id}
                        </td>
                        <td className="px-5 py-4 cursor-pointer" onClick={() => toggleExpand(order.id)}>
                          <p className="font-medium text-foreground">{order.clientName}</p>
                          {pendente > 0 ? (
                            <span className="text-[10px] text-red-600 font-bold">Deve R$ {pendente.toFixed(2)}</span>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-bold">Total Pago</span>
                          )}
                        </td>
                        <td className="px-5 py-4 font-medium cursor-pointer" onClick={() => toggleExpand(order.id)}>
                          {order.eventoDate ? order.eventoDate.split("-").reverse().join("/") : "-"}
                        </td>
                        <td className="px-5 py-4 text-center cursor-pointer" onClick={() => toggleExpand(order.id)}>
                          {order.status === "confirmado" && <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Aguardando Retirada</span>}
                          {order.status === "em_uso" && <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Em Uso pela Cliente</span>}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => { window.location.href = `/admin/contrato/${order.id}`; }}>
                              <FileText size={14} className="mr-1.5" /> PDF
                            </Button>
                            {order.status === "confirmado" && (
                              <Button size="sm" className="h-8 text-xs bg-primary" onClick={() => registrarRetirada(order)}>
                                <PackageCheck size={14} className="mr-1.5" /> Liberar Retirada
                              </Button>
                            )}
                            {order.status === "em_uso" && (
                              <Button size="sm" className="h-8 text-xs bg-amber-600 hover:bg-amber-700" onClick={() => setDevolvendo(order)}>
                                <PackageOpen size={14} className="mr-1.5" /> Receber Devolução
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* GAVETA EXPANDIDA (COMPROVANTE) */}
                      {isExpanded && (
                        <tr className="bg-muted/10 border-b border-border shadow-inner">
                          <td colSpan={6} className="px-8 py-6">
                            <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
                              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                                <h3 className="font-semibold text-foreground flex items-center gap-2">
                                  <Layers size={16} className="text-primary"/> Comprovante de Peças ({order.items?.length || 0})
                                </h3>
                                <div className="text-right">
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Valor Total do Contrato</p>
                                  <p className="text-lg font-bold text-primary">R$ {(order.totalValue || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {order.items?.map((item: any, idx: number) => {
                                  const imgSrc = item.image || "/placeholder.jpg";
                                  return (
                                    <div key={idx} className="flex gap-4 p-3 rounded-lg border border-border/60 hover:border-primary/30 transition-colors bg-secondary/5">
                                      <div className="relative w-16 h-20 rounded-md overflow-hidden shrink-0 border border-border">
                                        <Image src={imgSrc} alt={item.name} fill className="object-cover object-top" sizes="64px" />
                                      </div>
                                      <div className="flex flex-col justify-center flex-1">
                                        <p className="text-sm font-semibold text-foreground line-clamp-1" title={item.name}>{item.name}</p>
                                        <div className="flex gap-2 text-xs text-muted-foreground mt-1 mb-2 font-mono bg-white w-fit px-1.5 py-0.5 rounded border border-border/50">
                                          <span>{item.sku}</span>
                                          <span>|</span>
                                          <span>Tam: {item.size}</span>
                                        </div>
                                        <p className="text-xs font-medium text-emerald-600">R$ {(item.price || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
                {contratos.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">Nenhum contrato ativo.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ── VISÃO 2: GIRO DE PEÇAS INDIVIDUAIS ── */}
        <TabsContent value="pecas" className="m-0 focus-visible:outline-none">
          <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Peça</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Cliente</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Data Evento</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Localização / Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pecasNaRua.map((peca, idx) => {
                    const imgSrc = peca.image || "/placeholder.jpg";
                    return (
                      <tr key={`${peca.orderId}-${peca.id}-${idx}`} className="border-b border-border hover:bg-muted/30">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-12 rounded-md overflow-hidden bg-secondary shrink-0 border border-border/50">
                              <Image src={imgSrc} alt={peca.name} fill className="object-cover" sizes="40px" />
                            </div>
                            <div>
                              <span className="font-semibold text-foreground text-xs">{peca.name}</span>
                              <p className="text-[10px] text-muted-foreground font-mono">SKU: {peca.sku} | T: {peca.size}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-medium text-foreground text-xs">{peca.clientName}</p>
                          <a href={`https://wa.me/${peca.clientPhone?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-1 mt-0.5">
                            {peca.clientPhone}
                          </a>
                        </td>
                        <td className="px-5 py-3 font-medium text-xs">
                          {peca.eventoDate ? peca.eventoDate.split("-").reverse().join("/") : "-"}
                        </td>
                        <td className="px-5 py-3">
                          {peca.status === "confirmado" ? (
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center w-fit gap-1.5 border border-blue-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Na Loja (Reservado)
                            </span>
                          ) : (
                            <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center w-fit gap-1.5 border border-amber-100">
                              <PackageOpen size={12} /> Com a Cliente
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {pecasNaRua.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">Nenhuma peça alugada no momento.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* MODAL DE DEVOLUÇÃO MANTIDO INTACTO */}
      {devolvendo && (
        <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-bold text-foreground">Receber Devolução</h2>
              <p className="text-sm text-muted-foreground">Contrato #{devolvendo.id} - {devolvendo.clientName}</p>
            </div>
            <div>
              <Label className="text-xs mb-2 block font-semibold text-primary">Estado em que os vestidos retornaram:</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button type="button" variant={devolucaoStatus === "livre" ? "default" : "outline"} onClick={() => setDevolucaoStatus("livre")} className="h-10 text-xs">
                  Perfeitos (Vitrine)
                </Button>
                <Button type="button" variant={devolucaoStatus === "manutencao" ? "default" : "outline"} onClick={() => setDevolucaoStatus("manutencao")} className="h-10 text-xs text-amber-700 border-amber-200 hover:bg-amber-50">
                  Lavanderia / Reparo
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Houve atraso ou avaria? Cobrar Multa (R$):</Label>
              <Input type="number" min={0} value={multa} onChange={(e) => setMulta(Number(e.target.value))} className="h-10" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={() => setDevolvendo(null)} variant="ghost" className="flex-1">Cancelar</Button>
              <Button onClick={registrarDevolucao} className="flex-1 bg-amber-600 hover:bg-amber-700">Confirmar Recebimento</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ABA FINANCEIRO (COM EDIÇÃO) ─────────────────────────────────────────────
function SectionFinanceiro() {
  const {
    transactions,
    deleteTransaction,
    addTransaction,
    updateTransaction,
    orders,
    updateOrderFinancial,
  } = useAdminStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const formVazio = {
    type: "saida" as "entrada" | "saida",
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "Operacional",
  };
  const [form, setForm] = useState(formVazio);

  const contasAReceber = orders.filter(
    (o) =>
      o.status === "confirmado" &&
      o.totalValue &&
      o.totalValue > (o.signalPaid || 0),
  );

  const openAdd = () => {
    setForm(formVazio);
    setIsAdding(true);
    setEditingId(null);
  };
  const openEdit = (t: any) => {
    setForm({
      type: t.type,
      description: t.description,
      amount: t.amount.toString(),
      date: t.date,
      category: t.category,
    });
    setEditingId(t.id);
    setIsAdding(true);
  };

  const totalEntradas = transactions
    .filter((t) => t.type === "entrada")
    .reduce((acc, t) => acc + t.amount, 0);
  const totalSaidas = transactions
    .filter((t) => t.type === "saida")
    .reduce((acc, t) => acc + t.amount, 0);
  const saldo = totalEntradas - totalSaidas;

  const handleSalvar = async () => {
    if (!form.description || !form.amount) return;
    setLoading(true);
    try {
      const dataToSave = { ...form, amount: Number(form.amount) };

      if (editingId) {
        updateTransaction(editingId, dataToSave);
      } else {
        const res = await fetch("/api/financeiro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSave),
        });
        if (res.ok) {
          const result = await res.json();
          addTransaction({ id: result.id, ...dataToSave });
        }
      }
      setIsAdding(false);
    } catch (e) {
      alert("Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  const handleReceberRestante = async (order: any) => {
    const restante = order.totalValue - (order.signalPaid || 0);
    if (
      !confirm(
        `Deseja lançar a quitação de R$ ${restante.toFixed(2)} do contrato de ${order.clientName}?`,
      )
    )
      return;
    try {
      const transacao = {
        type: "entrada",
        description: `Quitação Final - Contrato #${order.id}`,
        amount: restante,
        date: new Date().toISOString().split("T")[0],
        category: "Locação",
      };
      const resFin = await fetch("/api/financeiro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transacao),
      });
      const resPed = await fetch(`/api/pedidos?id=${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...order, signalPaid: order.totalValue }),
      });
      if (resFin.ok && resPed.ok) {
        addTransaction({ id: (await resFin.json()).id, ...transacao } as any);
        updateOrderFinancial(order.id, { signalPaid: order.totalValue });
      }
    } catch (error) {}
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">
          Gestão Financeira
        </h1>
        <Button size="sm" onClick={openAdd} className="gap-1.5">
          <Plus size={14} /> Lançamento
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
            Entradas
          </p>
          <p className="text-2xl font-semibold text-emerald-600">
            R${" "}
            {totalEntradas.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
            Saídas
          </p>
          <p className="text-2xl font-semibold text-red-600">
            R${" "}
            {totalSaidas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div
          className={`p-5 rounded-xl border shadow-sm ${saldo >= 0 ? "bg-primary/10 border-primary/20" : "bg-red-50 border-red-200"}`}
        >
          <p className="text-xs uppercase tracking-widest mb-1 font-medium">
            Saldo Atual
          </p>
          <p
            className={`text-2xl font-bold ${saldo >= 0 ? "text-primary" : "text-red-600"}`}
          >
            R$ {saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {contasAReceber.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-2">
          <h3 className="font-semibold text-blue-800 mb-3 text-sm">
            Valores a Receber (Retirada)
          </h3>
          <div className="flex flex-col gap-2">
            {contasAReceber.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between bg-white px-4 py-2.5 rounded-lg border border-blue-100 shadow-sm"
              >
                <div>
                  <p className="text-sm font-semibold">{o.clientName}</p>
                  <p className="text-xs text-muted-foreground">
                    Contrato #{o.id}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-bold text-blue-700">
                    R${" "}
                    {(o.totalValue - o.signalPaid).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => handleReceberRestante(o)}
                    className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Receber
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isAdding && (
        <div className="bg-white rounded-xl border border-primary/30 p-6 flex flex-col gap-4 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h3 className="font-semibold border-b pb-2">
            {editingId ? "Editar Lançamento" : "Novo Lançamento"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <Label className="text-xs mb-1.5">Tipo</Label>
              <Select
                value={form.type}
                onValueChange={(v: any) => setForm({ ...form, type: v })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs mb-1.5">Descrição</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="h-9"
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5">Valor (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="h-9"
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5">Data</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="h-9"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setIsAdding(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSalvar}
              disabled={loading || !form.amount || !form.description}
            >
              Salvar
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">
                Data
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">
                Descrição
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">
                Valor
              </th>
              <th className="text-right px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr
                key={t.id}
                className="border-b border-border last:border-0 hover:bg-muted/30"
              >
                <td className="px-5 py-3 text-muted-foreground">
                  {t.date.split("-").reverse().join("/")}
                </td>
                <td className="px-5 py-3 font-medium">
                  {t.description}{" "}
                  {t.orderId && (
                    <span className="text-xs text-muted-foreground ml-2">
                      #{t.orderId}
                    </span>
                  )}
                </td>
                <td
                  className={`px-5 py-3 text-right font-medium ${t.type === "entrada" ? "text-emerald-600" : "text-red-600"}`}
                >
                  {t.type === "entrada" ? "+" : "-"} R${" "}
                  {t.amount.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => openEdit(t)}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-red-500 hover:bg-red-50"
                      onClick={() => deleteTransaction(t.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── CONFIGURAÇÕES (COM TEMPLATE DE CONTRATO) ────────────────────────────────
function SectionConfiguracoes() {
  const { storeConfig, setStoreConfig } = useAdminStore();
  const [config, setConfig] = useState(storeConfig);
  const [saved, setSaved] = useState(false);

  useEffect(() => setConfig(storeConfig), [storeConfig]);

  const handleSave = async () => {
    try {
      const res = await fetch("/api/configuracoes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setStoreConfig(config!);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {}
  };

  if (!config) return null;

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Configurações da Loja
          </h1>
        </div>
        {saved && (
          <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
            <CheckCircle2 size={16} /> Salvo
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6 flex flex-col gap-4">
          <h2 className="text-sm font-semibold border-b pb-2">
            Regras de Negócio
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs mb-1.5">Bloqueio Antes (Dias)</Label>
              <Input
                type="number"
                value={config.windowBefore}
                onChange={(e) =>
                  setConfig({ ...config, windowBefore: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5">Bloqueio Depois (Dias)</Label>
              <Input
                type="number"
                value={config.windowAfter}
                onChange={(e) =>
                  setConfig({ ...config, windowAfter: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5">Provadores</Label>
              <Input
                type="number"
                value={config.provadores}
                onChange={(e) =>
                  setConfig({ ...config, provadores: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5">% Entrada (Sinal)</Label>
              <Input
                type="number"
                value={config.sinalPercentage}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    sinalPercentage: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 flex flex-col gap-4 md:col-span-2">
          <h2 className="text-sm font-semibold border-b pb-2 flex items-center gap-2">
            <FileText size={16} /> Cláusulas Padrão do Contrato
          </h2>
          <p className="text-xs text-muted-foreground">
            O texto que preencher aqui será usado em todos os novos contratos
            gerados. Apenas substitua a Cláusula Terceira e Quarta, pois as
            primeiras são geradas automaticamente com os nomes e valores.
          </p>
          <Textarea
            rows={12}
            value={config.contratoTemplate || ""}
            onChange={(e) =>
              setConfig({ ...config, contratoTemplate: e.target.value })
            }
            placeholder="CLÁUSULA TERCEIRA - DA RETIRADA..."
            className="font-serif text-sm bg-secondary/5"
          />
        </div>
      </div>
      <Button onClick={handleSave} className="w-fit bg-primary">
        <Save size={16} className="mr-2" /> Salvar Configurações
      </Button>
    </div>
  );
}

// ─── ESTOQUE ──────────────────────────────────────────────────────────────
function SectionEstoque() {
  const { catalog, products, deleteProduct, setEditingProduct, setSection, setCollections, updateProduct } = useAdminStore()
  const itensParaMostrar = products.length > 0 ? products : catalog

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")

  const filteredItems = itensParaMostrar.filter((item: any) => {
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === "todos" || item.stock === statusFilter
    return matchSearch && matchStatus
  })

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

  // Agora esta função serve apenas para tirar da Manutenção e voltar para a Vitrine
  const handleAtivarPeca = async (id: string) => {
    try {
      const res = await fetch(`/api/produtos?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: 'livre' })
      });
      if (res.ok) {
        updateProduct(id, { stock: 'livre' });
      } else {
        alert("Erro ao atualizar o status da peça.");
      }
    } catch (error) {
      alert("Erro de conexão.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Catálogo & Inventário</h1>
          <p className="text-sm text-muted-foreground">{itensParaMostrar.length} peças cadastradas na loja</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => { setEditingProduct(null); setSection("cadastro"); }}><Plus size={14} /> Nova Peça</Button>
      </div>

      <div className="flex gap-3 flex-wrap items-center bg-white border border-border rounded-xl p-4 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 pl-9 text-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 text-sm w-56">
            <SelectValue placeholder="Filtrar por Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos (Ativos e Inativos)</SelectItem>
            <SelectItem value="livre">Disponível no Catálogo</SelectItem>
            <SelectItem value="manutencao">Em Manutenção / Inativo</SelectItem>
          </SelectContent>
        </Select>
        {(searchTerm || statusFilter !== "todos") && (
          <Button variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground" onClick={() => { setSearchTerm(""); setStatusFilter("todos"); }}>
            Limpar Filtros
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Peça</th>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">SKU</th>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tamanho</th>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Condição Física</th>
                <th className="text-right px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item: any) => {
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
                    <td className="px-5 py-3">
                      {item.stock === 'manutencao' ? (
                        <span className="bg-red-50 text-red-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center w-fit gap-1">
                          <AlertCircle size={12} /> Inativo/Manutenção
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center w-fit gap-1">
                          <CheckCircle2 size={12} /> Ativo no Catálogo
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right flex items-center justify-end gap-2">
                      
                      {item.stock === 'manutencao' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 text-xs gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50" 
                          onClick={() => handleAtivarPeca(item.id)}
                          title="Devolver para o Catálogo"
                        >
                          <Unlock size={12} /> Reativar
                        </Button>
                      )}

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
              {filteredItems.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">Nenhuma peça encontrada com estes filtros.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── CADASTRO DE PRODUTO (COMPLETO) ───────────────────────────────────────────
function SectionCadastro() {
  const {
    addProduct,
    products,
    editingProduct,
    setEditingProduct,
    updateProduct,
    setSection,
    categories,
    setCollections,
    collections,
  } = useAdminStore();

  const emptyForm = (): Omit<Product, "id" | "createdAt"> => ({
    name: "",
    description: "",
    category: "noiva",
    collection: "",
    sku: "",
    size: "",
    color: "",
    condition: "nova",
    stock: "livre",
    quantity: 1,
    rentalPrice: 0,
    salePrice: undefined,
    showPrice: false,
    featured: false,
    hidden: false,
    images: [],
    maintenanceNotes: "",
    customWindowBefore: undefined,
    customWindowAfter: undefined,
  });

  const [form, setForm] = useState(emptyForm());
  const [saved, setSaved] = useState(false);
  const [coverIdx, setCoverIdx] = useState(0);

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
      });
      setCoverIdx(0);
    } else {
      setForm(emptyForm());
    }
  }, [editingProduct]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const slotsAvailable = 6 - form.images.length;
    const filesToProcess = files.slice(0, slotsAvailable);

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setForm((prev) => {
          const newImages = [...prev.images, base64String].slice(0, 6);
          return { ...prev, images: newImages };
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleRemoveImage = (idx: number) => {
    const updated = form.images.filter((_, i) => i !== idx);
    set("images", updated);
    if (coverIdx >= updated.length) setCoverIdx(0);
  };

  const handleMoveImage = (from: number, to: number) => {
    if (to < 0 || to >= form.images.length) return;
    const arr = [...form.images];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    set("images", arr);
    if (coverIdx === from) setCoverIdx(to);
  };

  const handleSave = async () => {
    if (!form.name || !form.sku || !form.rentalPrice) return;
    try {
      if (editingProduct) {
        const response = await fetch(`/api/produtos?id=${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const result = await response.json();
        if (result.success) {
          updateProduct(editingProduct.id, form);
          const resCol = await fetch("/api/colecoes");
          if (resCol.ok) setCollections(await resCol.json());
          setSaved(true);
          setTimeout(() => {
            setSaved(false);
            setEditingProduct(null);
            setSection("estoque");
          }, 1500);
        }
      } else {
        const response = await fetch("/api/produtos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const result = await response.json();
        if (result.success) {
          const product: Product = {
            ...form,
            id: result.produtoId.toString(),
            createdAt: new Date().toISOString().split("T")[0],
          };
          addProduct(product);
          const resCol = await fetch("/api/colecoes");
          if (resCol.ok) setCollections(await resCol.json());
          setSaved(true);
          setForm(emptyForm());
          setCoverIdx(0);
          setTimeout(() => setSaved(false), 3000);
        }
      }
    } catch (error) {
      alert("Erro de conexão com a API.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {editingProduct ? "Editar Produto" : "Cadastro de Produto"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {editingProduct
              ? `A alterar o produto: ${editingProduct.sku}`
              : `${products.length} produtos cadastrados`}
          </p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-medium px-4 py-2 rounded-full">
            <CheckCircle2 size={14} />{" "}
            {editingProduct ? "Atualizado!" : "Produto salvo!"}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="bg-white rounded-xl border border-border p-6 flex flex-col gap-5">
            <h2 className="text-sm font-semibold text-foreground border-b border-border pb-3">
              1. Informações Básicas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label className="text-xs mb-1.5">Nome do Modelo *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Ex: Sereia Rendado Premium"
                  className="h-9"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs mb-1.5">Descrição Detalhada</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={3}
                  className="resize-none text-sm"
                />
              </div>
              <div>
                <Label className="text-xs mb-1.5">Categoria</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => set("category", v)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1.5">Coleção</Label>
                <Input
                  list="colecoes-list"
                  value={form.collection}
                  onChange={(e) =>
                    set("collection", e.target.value.toUpperCase())
                  }
                  placeholder="EX: OUTONO"
                  className="h-9 uppercase"
                />
                <datalist id="colecoes-list">
                  {collections.map((c) => (
                    <option key={c.id} value={c.name.toUpperCase()} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-6 flex flex-col gap-5">
            <h2 className="text-sm font-semibold text-foreground border-b border-border pb-3">
              2. Gestão de SKU & Peças
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <Label className="text-xs mb-1.5">SKU *</Label>
                <Input
                  value={form.sku}
                  onChange={(e) => set("sku", e.target.value)}
                  className="h-9 font-mono"
                />
              </div>
              <div>
                <Label className="text-xs mb-1.5">Tamanho</Label>
                <Input
                  value={form.size}
                  onChange={(e) => set("size", e.target.value)}
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-xs mb-1.5">Cor</Label>
                <Input
                  value={form.color}
                  onChange={(e) => set("color", e.target.value)}
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-xs mb-1.5">Quantidade FÍSICA</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.quantity || 1}
                  onChange={(e) => set("quantity", Number(e.target.value))}
                  className="h-9"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-6 flex flex-col gap-5">
            <h2 className="text-sm font-semibold text-foreground border-b border-border pb-3">
              3. Regras de Negócio
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs mb-1.5">Condição (Estoque)</Label>
                <Select
                  value={form.stock}
                  onValueChange={(v) => set("stock", v as any)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="livre">Ativa no Catálogo</SelectItem>
                    <SelectItem value="manutencao">Em Manutenção / Inativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1.5">Valor de Aluguel *</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.rentalPrice || ""}
                  onChange={(e) => set("rentalPrice", Number(e.target.value))}
                  className="h-9"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-1">
              <div className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3 flex-1">
                <div>
                  <p className="text-sm font-medium">Exibir Preço</p>
                </div>
                <Switch
                  checked={form.showPrice}
                  onCheckedChange={(v) => set("showPrice", v)}
                />
              </div>
              <div className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3 flex-1">
                <div>
                  <p className="text-sm font-medium">Destaque na Home</p>
                </div>
                <Switch
                  checked={form.featured}
                  onCheckedChange={(v) => set("featured", v)}
                />
              </div>
              <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-4 py-3 flex-1">
                <div>
                  <p className="text-sm font-medium">Ocultar da Vitrine</p>
                </div>
                <Switch
                  checked={form.hidden}
                  onCheckedChange={(v) => set("hidden", v)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={!form.name || !form.sku || !form.rentalPrice}
              className="py-3 px-8 text-sm font-semibold gap-2 bg-primary"
            >
              <Save size={15} />{" "}
              {editingProduct ? "Atualizar Produto" : "Salvar Produto"}
            </Button>
            {editingProduct && (
              <Button
                onClick={() => {
                  setEditingProduct(null);
                  setSection("estoque");
                }}
                variant="outline"
                className="py-3 px-8 text-sm font-semibold"
              >
                Cancelar Edição
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-6">
          <div className="bg-white rounded-xl border border-border p-4 flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold mb-0.5">4. Mídia e Visual</p>
              <p className="text-[11px] text-muted-foreground">
                Arraste a capa com as setas.
              </p>
            </div>

            {form.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {form.images.map((src, i) => (
                  <div key={i} className="relative group">
                    <button
                      onClick={() => setCoverIdx(i)}
                      className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${i === coverIdx ? "border-primary" : "border-transparent"}`}
                    >
                      <Image
                        src={src}
                        alt={`Foto ${i + 1}`}
                        fill
                        className="object-cover object-top"
                        sizes="80px"
                      />
                    </button>
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-1 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground/60 rounded-b-lg py-0.5">
                      <button
                        onClick={() => handleMoveImage(i, i - 1)}
                        disabled={i === 0}
                        className="text-white text-[10px] px-1 disabled:opacity-30"
                      >
                        &#x2190;
                      </button>
                      <button
                        onClick={() => handleRemoveImage(i)}
                        className="text-white text-[10px] px-1"
                      >
                        &#x2715;
                      </button>
                      <button
                        onClick={() => handleMoveImage(i, i + 1)}
                        disabled={i === form.images.length - 1}
                        className="text-white text-[10px] px-1 disabled:opacity-30"
                      >
                        &#x2192;
                      </button>
                    </div>
                    {i === coverIdx && (
                      <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        Capa
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                disabled={form.images.length >= 6}
              />
              <label
                htmlFor="image-upload"
                className={`w-full flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg py-3.5 text-xs text-muted-foreground transition-all ${form.images.length >= 6 ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:border-primary/50 hover:text-primary"}`}
              >
                <Upload size={14} />{" "}
                {form.images.length === 0
                  ? "Adicionar Fotos"
                  : `Adicionar mais (${form.images.length}/6)`}
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── COLEÇÕES ────────────────────────────────────────────────────────────
function SectionColecoes() {
  const {
    collections,
    setCollections,
    products,
    addCollection,
    updateCollection,
    deleteCollection,
  } = useAdminStore();
  const [editing, setEditing] = useState<SeasonalCollection | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    productIds: [] as string[],
  });

  const openCreate = () => {
    setForm({ name: "", description: "", productIds: [] });
    setEditing(null);
    setIsCreating(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  const openEdit = (col: SeasonalCollection) => {
    setForm({
      name: col.name,
      description: col.description || "",
      productIds: col.productIds,
    });
    setEditing(col);
    setIsCreating(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    if (!form.name) return;
    if (editing) {
      const res = await fetch(`/api/colecoes?id=${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) updateCollection(editing.id, form);
    } else {
      const res = await fetch("/api/colecoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, active: false }),
      });
      if (res.ok) {
        const data = await res.json();
        addCollection({ id: data.id, ...form, active: false });
      }
    }
    setIsCreating(false);
    setEditing(null);
  };

  const handleAtivar = async (id: string) => {
    const res = await fetch(`/api/colecoes?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: true }),
    });
    if (res.ok) {
      const updated = collections.map((c) => ({ ...c, active: c.id === id }));
      setCollections(updated);
    }
  };

  const handleApagar = async (id: string) => {
    if (!confirm("Apagar coleção?")) return;
    const res = await fetch(`/api/colecoes?id=${id}`, { method: "DELETE" });
    if (res.ok) deleteCollection(id);
  };

  const toggleProduct = (id: string) => {
    setForm((f) => ({
      ...f,
      productIds: f.productIds.includes(id)
        ? f.productIds.filter((p) => p !== id)
        : [...f.productIds, id],
    }));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Coleções Sazonais
          </h1>
          <p className="text-sm text-muted-foreground">
            A coleção ativa é exibida em destaque na home da vitrine.
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={openCreate}>
          <Plus size={14} /> Nova Coleção
        </Button>
      </div>

      {isCreating && (
        <div className="bg-white rounded-xl border-2 border-primary/20 p-6 flex flex-col gap-5 shadow-md">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-base font-bold text-foreground">
              {editing ? `A editar: ${editing.name}` : "Criar Nova Coleção"}
            </h2>
            <button
              onClick={() => setIsCreating(false)}
              className="text-muted-foreground hover:text-red-500 bg-muted/50 p-1.5 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs mb-1.5 font-medium">Nome da Coleção *</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Ex: Outono 2027"
                className="h-10 bg-secondary/10"
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5 font-medium">
                Subtítulo (exibido na home)
              </Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Ex: Elegância para momentos únicos."
                className="h-10 bg-secondary/10"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs font-semibold text-primary">Selecione as peças desta coleção ({form.productIds.length} selecionadas)</Label>
            </div>
            
            {/* OTIMIZAÇÃO: Usamos flex-wrap e largura fixa (w-24) para as miniaturas nunca esticarem. O items-start também impede estiramento vertical */}
            <div className="flex flex-wrap gap-3 mt-1 max-h-[360px] overflow-y-auto items-start pr-2 custom-scrollbar border border-border/50 rounded-xl p-3 bg-muted/10">
              {products.map((p) => {
                const selected = form.productIds.includes(p.id);
                const coverImg =
                  p.images && p.images.length > 0
                    ? p.images[0]
                    : "/placeholder.jpg";

                return (
                  <button
                    key={p.id}
                    onClick={() => toggleProduct(p.id)}
                    // A largura está fixada em w-24 (96px)
                    className={`w-24 shrink-0 relative flex flex-col rounded-xl overflow-hidden border transition-all text-left ${selected ? "border-primary shadow-sm ring-2 ring-primary/20" : "border-border hover:border-primary/40 bg-white"}`}
                  >
                    <div className="relative aspect-[3/4] bg-secondary w-full">
                      <Image
                        src={coverImg}
                        alt={p.name}
                        fill
                        className="object-cover object-top"
                        sizes="96px"
                      />
                      {selected && (
                        <div className="absolute inset-0 bg-primary/20 flex items-start justify-end p-1">
                          <CheckCircle2
                            size={16}
                            className="text-white bg-primary rounded-full shadow-sm"
                          />
                        </div>
                      )}
                    </div>
                    <div className="p-1.5 bg-white flex flex-col gap-0.5 border-t border-border/50">
                      <p className="text-[10px] font-semibold text-foreground truncate" title={p.name}>
                        {p.name}
                      </p>
                      <p className="text-[8px] text-muted-foreground font-mono">
                        {p.sku}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border mt-2">
            <Button
              onClick={handleSave}
              disabled={!form.name}
              className="gap-2 px-6"
            >
              <Save size={16} />{" "}
              {editing ? "Salvar Alterações" : "Criar Coleção"}
            </Button>
            <Button variant="ghost" onClick={() => setIsCreating(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* LISTA DE COLEÇÕES EXISTENTES */}
      <div className="flex flex-col gap-5">
        {collections.map((col) => {
          const colProducts = products.filter((p) =>
            col.productIds.includes(p.id),
          );
          return (
            <div
              key={col.id}
              className={`bg-white rounded-xl border overflow-hidden transition-all ${col.active ? "border-primary/50 shadow-md ring-1 ring-primary/10" : "border-border shadow-sm hover:border-primary/30"}`}
            >
              <div className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap border-b border-border bg-muted/10">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ${col.active ? "bg-primary animate-pulse" : "bg-border"}`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-bold text-foreground">
                        {col.name}
                      </p>
                      {col.active && (
                        <span className="text-[10px] bg-primary text-primary-foreground font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                          Em Destaque
                        </span>
                      )}
                    </div>
                    {col.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {col.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!col.active && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                      onClick={() => handleAtivar(col.id)}
                    >
                      <RadioTower size={14} /> Ativar Destaque
                    </Button>
                  )}
                  <div className="h-4 w-px bg-border mx-1"></div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary"
                    onClick={() => openEdit(col as SeasonalCollection)}
                    title="Editar Coleção"
                  >
                    <Pencil size={15} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                    onClick={() => handleApagar(col.id)}
                    title="Apagar Coleção"
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>

              {/* VITRINE DE PEÇAS DA COLEÇÃO */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Layers size={14} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {colProducts.length} peça{colProducts.length !== 1 ? "s" : ""} na coleção
                  </span>
                </div>
                
                {colProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic bg-secondary/20 p-4 rounded-lg border border-dashed border-border text-center">Coleção vazia. Clique no botão de edição para adicionar vestidos.</p>
                ) : (
                  <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                    {colProducts.map((p) => {
                      const coverImg =
                        p.images && p.images.length > 0
                          ? p.images[0]
                          : "/placeholder.jpg";
                      return (
                        <div
                          key={p.id}
                          className="shrink-0 w-28 flex flex-col rounded-lg overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow bg-white"
                        >
                          <div className="relative aspect-[3/4] bg-secondary">
                            <Image
                              src={coverImg}
                              alt={p.name}
                              fill
                              className="object-cover object-top"
                              sizes="112px"
                            />
                          </div>
                          <div className="p-2 flex flex-col gap-0.5 text-center">
                            <p className="text-[11px] font-semibold text-foreground truncate" title={p.name}>
                              {p.name}
                            </p>
                            <p className="text-[9px] text-muted-foreground font-mono">
                              {p.sku}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
// ─── CATEGORIAS ───────────────────────────────────────────────────────────────
function SectionCategorias() {
  const { categories, setCategories } = useAdminStore();
  const [novoNome, setNovoNome] = useState("");

  const handleCriar = async () => {
    if (!novoNome) return;
    const res = await fetch("/api/categorias", {
      method: "POST",
      body: JSON.stringify({ name: novoNome }),
    });
    if (res.ok) {
      const data = await res.json();
      setCategories([
        ...categories,
        { id: data.id, name: novoNome, slug: data.slug },
      ]);
      setNovoNome("");
    }
  };

  const handleApagar = async (id: string) => {
    if (!confirm("Tem certeza que deseja apagar esta categoria?")) return;
    const res = await fetch(`/api/categorias?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setCategories(categories.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Categorias da Loja
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie as categorias da vitrine.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-end gap-4 mb-8">
          <div className="flex-1">
            <Label className="text-xs mb-1.5">Nova Categoria</Label>
            <Input
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder="Ex: Daminhas"
              className="h-9"
            />
          </div>
          <Button
            onClick={handleCriar}
            disabled={!novoNome}
            className="h-9 gap-2"
          >
            <Plus size={14} /> Adicionar
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30"
            >
              <div className="flex items-center gap-3">
                <Tag size={16} className="text-primary" />
                <span className="font-medium text-sm">{cat.name}</span>
                <span className="text-xs text-muted-foreground font-mono">
                  ({cat.slug})
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-red-500 hover:bg-red-50"
                onClick={() => handleApagar(cat.id)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function AdminPage() {
  const {
    section,
    setOrders,
    setProducts,
    setStoreConfig,
    setCategories,
    setCollections,
    setTransactions,
  } = useAdminStore();

  useEffect(() => {
    async function carregarDadosReais() {
      try {
        const [
          resPedidos,
          resProdutos,
          resConfig,
          resCategorias,
          resColecoes,
          resFin,
        ] = await Promise.all([
          fetch("/api/pedidos"),
          fetch("/api/produtos"),
          fetch("/api/configuracoes"),
          fetch("/api/categorias"),
          fetch("/api/colecoes"),
          fetch("/api/financeiro"),
        ]);

        if (resPedidos.ok) {
          const dados = await resPedidos.json();
          if (Array.isArray(dados)) setOrders(dados);
        }
        if (resProdutos.ok) {
          const dados = await resProdutos.json();
          if (Array.isArray(dados)) setProducts(dados);
        }
        if (resConfig.ok) {
          const dados = await resConfig.json();
          if (dados && !dados.error) setStoreConfig(dados);
        }
        if (resCategorias.ok) {
          const dados = await resCategorias.json();
          if (Array.isArray(dados)) setCategories(dados);
        }
        if (resColecoes.ok) {
          const dados = await resColecoes.json();
          if (Array.isArray(dados)) setCollections(dados);
        }
        if (resFin.ok) {
          const dados = await resFin.json();
          if (Array.isArray(dados)) setTransactions(dados);
        }
      } catch (error) {
        console.error("Erro ao carregar do MySQL:", error);
      }
    }
    carregarDadosReais();
  }, [
    setOrders,
    setProducts,
    setStoreConfig,
    setCategories,
    setCollections,
    setTransactions,
  ]);

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-8 min-w-0 overflow-x-hidden">
        {section === "dashboard" && <SectionDashboard />}
        {section === "pedidos" && <SectionPedidos />}
        {section === "contratos" && <SectionContratos />}
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
  );
}
