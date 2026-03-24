"use client";

import { useState, useEffect, Fragment } from "react";
import { useAdminStore } from "@/lib/admin-store";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { MetricCard } from "@/components/admin/metric-card";
import { ModalLiberacao } from "@/components/admin/modal-liberacao";
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
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Product, SeasonalCollection, Category } from "@/lib/admin-store";

// ─── DASHBOARD PRINCIPAL ──────────────────────────────────────────────────
function SectionDashboard() {
  const { orders, catalog, setSelectedOrder, setOrderModalOpen, transactions, products, updateOrderStatus, updateProduct } = useAdminStore();
  
  // -- ESTADOS DO CALENDÁRIO --
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [calendarMode, setCalendarMode] = useState<"provas" | "devolucoes">("provas");

  // -- ESTADOS PARA RECEBER DEVOLUÇÃO DIRETAMENTE NO DASHBOARD --
  const [devolvendo, setDevolvendo] = useState<any>(null);
  const [devolucaoStatus, setDevolucaoStatus] = useState<"livre" | "manutencao">("livre");
  const [multa, setMulta] = useState(0);

  const today = new Date().toISOString().split("T")[0];

  const getReturnDate = (eventoDate?: string) => {
    if (!eventoDate) return null;
    const d = new Date(eventoDate + "T12:00:00");
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0) d.setDate(d.getDate() + 1); // Pula domingo
    return d.toISOString().split("T")[0];
  };

  // 1. DADOS DE PROVAS (Esconde as que já estão em uso, concluídas ou canceladas)
  const provasOrders = orders.filter(o => 
    !['cancelado', 'em_uso', 'concluido'].includes(o.status)
  );
  
  // 2. DADOS DE DEVOLUÇÕES
  const devolucoesOrders = orders.filter(o => 
    ['confirmado', 'em_uso'].includes(o.status) && !!o.eventoDate
  );

  // 3. DADOS DO DIA SELECIONADO
  const selectedDateOrders = calendarMode === "provas" 
    ? provasOrders.filter((o) => o.provaDate === selectedDate).sort((a, b) => a.provaTime.localeCompare(b.provaTime))
    : devolucoesOrders.filter((o) => getReturnDate(o.eventoDate) === selectedDate);

  // 4. PEÇAS DO DIA
  const pecasParaODia = selectedDateOrders.flatMap(order => 
    (order.items || []).map(item => ({
        ...item,
        clientName: order.clientName,
        time: calendarMode === "provas" ? order.provaTime : "Até as 18h",
        orderId: order.id,
        statusPedido: order.status
    }))
  );

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split("T")[0];

  const rentedIds = new Set(catalog.filter((d) => d.stock === "alugado").map((d) => d.id));
  
  const conflicts = orders.filter((o) => {
    if (o.status === "cancelado") return false;
    if (o.provaDate < today || o.provaDate > nextWeekStr) return false;
    return o.items.some((item) => rentedIds.has(item.id));
  });

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const faturamentoMes = transactions
    .filter((t: any) => {
      if (!t.date || t.type !== 'entrada') return false;
      const tDate = new Date(t.date + "T12:00:00");
      return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    })
    .reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);

  const pendentes = orders.filter((o) => ['novo', 'pendente', 'compareceu'].includes(o.status)).length;
  const alugueresAtivos = orders.filter((o) => ['confirmado', 'em_uso'].includes(o.status)).length;
  const nomeMes = new Date().toLocaleString('pt-BR', { month: 'long' });

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); 
  
  const blanks = Array(firstDayOfWeek).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const nextMonth = () => setCurrentMonthDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentMonthDate(new Date(year, month - 1, 1));
  const goToToday = () => {
    setCurrentMonthDate(new Date());
    setSelectedDate(today);
  };

  // Função para processar a devolução no backend
  const registrarDevolucao = async () => {
    if (!devolvendo) return;
    try {
      await fetch(`/api/pedidos?id=${devolvendo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...devolvendo, status: "concluido" }),
      });
      updateOrderStatus(devolvendo.id, "concluido");

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
    } catch (e) {
      alert("Erro ao concluir devolução.");
    }
  };

  // Criamos as nossas próprias badges para garantir que ficam perfeitas
  const renderBadge = (status: string) => {
    switch (status) {
      case 'novo': return <span className="bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Novo</span>;
      case 'pendente': return <span className="bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Pendente</span>;
      case 'compareceu': return <span className="bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Compareceu</span>;
      case 'confirmado': return <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Confirmado</span>;
      case 'em_uso': return <span className="bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Em Uso</span>;
      case 'concluido': return <span className="bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Concluído</span>;
      case 'cancelado': return <span className="bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Cancelado</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">{status}</span>;
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard Geral</h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={`Faturamento (${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)})`}
          value={`R$ ${faturamentoMes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          sub="entradas financeiras"
          icon={DollarSign}
          accent="green"
        />
        <MetricCard
          title="Provas Pendentes"
          value={pendentes.toString()}
          sub="agendamentos a confirmar"
          icon={CalendarCheck}
          accent="blue"
        />
        <MetricCard
          title="Alugueres Ativos"
          value={alugueresAtivos.toString()}
          sub="peças reservadas/na rua"
          icon={TrendingUp}
          accent="amber"
        />
        <MetricCard
          title="Peças no Acervo"
          value={products.reduce((acc, curr) => acc + (Number(curr.quantity) || 1), 0).toString()}
          sub="total de vestidos"
          icon={ClipboardList}
          accent="default"
        />
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
              const conflictItems = order.items.filter((item) => rentedIds.has(item.id));
              return (
                <div key={order.id} className="flex items-start justify-between gap-4 bg-white rounded-lg border border-amber-100 p-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-foreground">
                      {order.clientName} <span className="ml-2 text-xs text-muted-foreground font-normal">{order.id}</span>
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
                  <Button size="sm" variant="outline" className="h-7 text-xs shrink-0 border-amber-300 text-amber-700 hover:bg-amber-50" onClick={() => { setSelectedOrder(order); setOrderModalOpen(true); }}>
                    <Pencil size={11} className="mr-1" /> Ver Pedido
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* ESQUERDA: AGENDA DETALHADA DO DIA (1 Coluna) */}
        <div className="bg-white rounded-xl border border-border overflow-hidden lg:col-span-1 shadow-sm lg:sticky lg:top-24">
          <div className={`px-5 py-4 border-b border-border flex items-center gap-2 ${calendarMode === 'provas' ? 'bg-muted/20' : 'bg-amber-50/50'}`}>
            {calendarMode === 'provas' ? <Clock size={16} className="text-primary" /> : <PackageOpen size={16} className="text-amber-600" />}
            <h2 className="text-sm font-semibold text-foreground">
              {calendarMode === 'provas' ? 'Agenda do Dia' : 'Retornos do Dia'}
            </h2>
            <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-md border ${calendarMode === 'provas' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
              {selectedDate.split('-').reverse().join('/')}
            </span>
          </div>
          
          {selectedDateOrders.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
               <CalendarCheck size={40} className="text-muted-foreground/20" />
               <p>{calendarMode === 'provas' ? 'Dia livre! Nenhuma prova marcada.' : 'Nenhuma peça agendada para retornar hoje.'}</p>
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto custom-scrollbar">
              {selectedDateOrders.map((order) => (
                <div 
                  key={order.id} 
                  onClick={() => { setSelectedOrder(order); setOrderModalOpen(true); }}
                  className="p-4 flex flex-col gap-2 hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`px-2 py-1 rounded-md text-xs font-bold border transition-colors ${calendarMode === 'provas' ? 'bg-primary/10 text-primary border-primary/20 group-hover:bg-primary group-hover:text-white' : 'bg-amber-100 text-amber-700 border-amber-200 group-hover:bg-amber-600 group-hover:text-white'}`}>
                        {calendarMode === 'provas' ? order.provaTime : 'Devolver'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground line-clamp-1" title={order.clientName}>{order.clientName}</p>
                        <p className="text-[11px] text-muted-foreground">{order.clientPhone}</p>
                      </div>
                    </div>
                  </div>
                  
                  {order.items && order.items.length > 0 && (
                    <div className="flex flex-col gap-1 mt-1 pl-1 border-l-2 border-border/50 ml-1">
                      {order.items.map(item => (
                        <p key={item.id} className="text-[10px] text-muted-foreground truncate" title={item.name}>
                          • {item.name} <span className="font-mono opacity-60">({item.sku})</span>
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground font-medium">
                      {order.items?.length || 0} peça{(order.items?.length !== 1) ? "s" : ""}
                    </p>
                    <div className="flex items-center gap-2">
                      
                      {/* BOTÃO CONTRATO: Só aparece em modo provas E para os status iniciais */}
                      {calendarMode === 'provas' && ['novo', 'pendente', 'compareceu'].includes(order.status) && (
                        <Button
                          size="sm"
                          className="h-6 text-[10px] px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/admin/fechamento/${order.id}`;
                          }}
                        >
                          <FileSignature size={12} className="mr-1" /> Contrato
                        </Button>
                      )}

                      {/* BOTÃO RECEBER DEVOLUÇÃO: Só aparece no modo devoluções E se o status for em_uso */}
                      {calendarMode === 'devolucoes' && order.status === 'em_uso' && (
                        <Button
                          size="sm"
                          className="h-6 text-[10px] px-2.5 bg-amber-500 hover:bg-amber-600 text-white transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDevolvendo(order);
                          }}
                        >
                          <PackageOpen size={12} className="mr-1" /> Receber
                        </Button>
                      )}

                      {renderBadge(order.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CENTRO: PEÇAS (1 Coluna) */}
        <div className="bg-white rounded-xl border border-border overflow-hidden lg:col-span-1 shadow-sm lg:sticky lg:top-24">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2 bg-emerald-50/50">
            <PackageCheck size={16} className="text-emerald-600" />
            <h2 className="text-sm font-semibold text-foreground">
              {calendarMode === 'provas' ? 'Peças a Preparar' : 'Peças a Receber'}
            </h2>
            <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-md border border-emerald-200">
              {pecasParaODia.length}
            </span>
          </div>
          
          <div className="p-4 max-h-[600px] overflow-y-auto custom-scrollbar flex flex-col gap-3">
            {pecasParaODia.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                <Layers size={32} className="opacity-20" />
                <p className="text-xs text-center">{calendarMode === 'provas' ? 'Nenhuma peça para separar hoje.' : 'Nenhum retorno aguardado hoje.'}</p>
              </div>
            ) : (
              pecasParaODia.map((peca, idx) => {
                const finalImg = peca.image || "/placeholder.jpg";
                return (
                  <div key={`${peca.orderId}-${peca.id}-${idx}`} className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-secondary/5 hover:border-primary/30 transition-colors shadow-sm">
                    <div className="relative w-14 h-16 rounded-md overflow-hidden shrink-0 border border-border/50 bg-white">
                      <Image src={finalImg} alt={peca.name} fill className="object-cover object-top" sizes="56px" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground line-clamp-2 leading-tight mb-1" title={peca.name}>{peca.name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground mb-1.5">{peca.sku} | Tam: {peca.size}</p>
                      
                      <div className="flex items-center justify-between bg-white px-1.5 py-1 rounded border border-border/50">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-primary">
                          <Clock size={10} /> {peca.time}
                        </div>
                        <p className="text-[10px] font-medium text-foreground truncate max-w-[80px]" title={peca.clientName}>
                          {peca.clientName.split(' ')[0]}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* DIREITA: CALENDÁRIO MENSAL GIGANTE (2 Colunas) */}
        <div className="bg-white rounded-xl border border-border overflow-hidden lg:col-span-2 shadow-sm h-fit">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/20 flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <h2 className="text-base font-bold text-foreground capitalize">
                {currentMonthDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
              </h2>
              <Button variant="outline" size="sm" className="h-7 px-3 text-xs bg-white" onClick={goToToday}>
                Ir para Hoje
              </Button>
            </div>
            
            <div className="flex bg-muted p-1 rounded-lg border border-border">
              <button 
                onClick={() => setCalendarMode("provas")} 
                className={`text-[11px] px-3 py-1.5 rounded-md font-bold transition-all ${calendarMode === 'provas' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Provas / Retiradas
              </button>
              <button 
                onClick={() => setCalendarMode("devolucoes")} 
                className={`text-[11px] px-3 py-1.5 rounded-md font-bold transition-all ${calendarMode === 'devolucoes' ? 'bg-amber-50 shadow-sm text-amber-700' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Devoluções
              </button>
            </div>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={prevMonth}>
                <ChevronLeft size={16} />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={nextMonth}>
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-7 gap-2 text-center mb-3">
              {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map((dia, i) => (
                <div key={i} className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">{dia}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {blanks.map((_, i) => (
                <div key={`blank-${i}`} className="min-h-[100px] bg-secondary/20 rounded-lg border border-transparent"></div>
              ))}
              
              {days.map((day) => {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isToday = dateStr === today;
                const isSelected = dateStr === selectedDate;
                
                const dayOrders = calendarMode === "provas" 
                  ? provasOrders.filter(o => o.provaDate === dateStr)
                  : devolucoesOrders.filter(o => getReturnDate(o.eventoDate) === dateStr);

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`min-h-[100px] p-1.5 rounded-lg border transition-all cursor-pointer flex flex-col gap-1.5 overflow-hidden ${
                      isSelected 
                        ? (calendarMode === 'provas' ? "border-primary ring-1 ring-primary/50 bg-primary/5 shadow-sm" : "border-amber-500 ring-1 ring-amber-500/50 bg-amber-50 shadow-sm")
                        : isToday 
                          ? "border-blue-300 bg-blue-50/50 hover:border-primary/50" 
                          : "border-border hover:border-primary/40 hover:bg-secondary/30 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between px-1">
                      <span className={`text-xs font-bold ${isToday ? "text-blue-600" : "text-muted-foreground"}`}>
                        {day}
                      </span>
                      {dayOrders.length > 0 && (
                        <span className={`text-[9px] font-bold px-1.5 rounded-sm border ${calendarMode === 'provas' ? 'bg-muted text-muted-foreground border-border/50' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                          {dayOrders.length}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 overflow-y-auto no-scrollbar pb-1">
                      {dayOrders.map((o, idx) => (
                        <div 
                          key={idx} 
                          className={`flex items-center gap-1 bg-white border shadow-sm px-1.5 py-1 rounded text-[9px] font-medium text-foreground truncate ${calendarMode === 'devolucoes' ? 'border-amber-200' : 'border-border'}`}
                          title={calendarMode === 'provas' ? `${o.provaTime} - ${o.clientName}` : `Devolução: ${o.clientName}`}
                        >
                          <span className={`font-bold shrink-0 ${calendarMode === 'provas' ? 'text-primary' : 'text-amber-600'}`}>
                            {calendarMode === 'provas' ? `${o.provaTime.split(':')[0]}h` : <PackageOpen size={10} />}
                          </span>
                          <span className="truncate">{o.clientName.split(' ')[0]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE DEVOLUÇÃO INTEGRADO NO DASHBOARD */}
      {devolvendo && (
        <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            <div>
              <h2 className="text-lg font-bold text-foreground">Receber Devolução</h2>
              <p className="text-sm text-muted-foreground">Contrato #{devolvendo.id} - {devolvendo.clientName}</p>
            </div>
            <div>
              <Label className="text-xs mb-2 block font-semibold text-primary">Estado em que os vestidos retornaram:</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button type="button" variant={devolucaoStatus === "livre" ? "default" : "outline"} onClick={() => setDevolucaoStatus("livre")} className="h-10 text-xs">Perfeitos (Vitrine)</Button>
                <Button type="button" variant={devolucaoStatus === "manutencao" ? "default" : "outline"} onClick={() => setDevolucaoStatus("manutencao")} className="h-10 text-xs text-amber-700 border-amber-200 hover:bg-amber-50">Lavanderia / Reparo</Button>
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Houve atraso ou avaria? Cobrar Multa (R$):</Label>
              <Input type="number" min={0} value={multa} onChange={(e) => setMulta(Number(e.target.value))} className="h-10" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={() => setDevolvendo(null)} variant="ghost" className="flex-1">Cancelar</Button>
              <Button onClick={registrarDevolucao} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white">Confirmar Recebimento</Button>
            </div>
          </div>
        </div>
      )}
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
  // 1. Adicionado o updateOrderFinancial aqui para o Modal poder injetar o dinheiro
  const { orders, updateOrderStatus, updateProduct, updateOrderFinancial } =
    useAdminStore();

  const contratos = orders
    .filter((o) => o.status === "confirmado" || o.status === "em_uso")
    .sort((a, b) => (a.eventoDate || "").localeCompare(b.eventoDate || ""));

  const pecasNaRua = contratos
    .flatMap((order) =>
      order.items.map((item) => ({
        ...item,
        orderId: order.id,
        clientName: order.clientName,
        clientPhone: order.clientPhone,
        eventoDate: order.eventoDate,
        status: order.status,
        orderRaw: order,
      })),
    )
    .sort((a, b) => (a.eventoDate || "").localeCompare(b.eventoDate || ""));

  const [devolvendo, setDevolvendo] = useState<any>(null);
  const [devolucaoStatus, setDevolucaoStatus] = useState<
    "livre" | "manutencao"
  >("livre");
  const [multa, setMulta] = useState(0);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // 2. ESTADO NOVO PARA O MODAL DE LIBERAÇÃO
  const [pedidoParaLiberar, setPedidoParaLiberar] = useState<any>(null);

  // 3. FUNÇÃO SIMPLIFICADA (Apenas abre o modal)
  const registrarRetirada = (order: any) => {
    setPedidoParaLiberar(order);
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
          <TabsTrigger
            value="contratos"
            className="gap-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
          >
            <ClipboardList size={14} /> Visão por Contratos
          </TabsTrigger>
          <TabsTrigger
            value="pecas"
            className="gap-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
          >
            <Layers size={14} /> Giro de Peças Individuais
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="contratos"
          className="m-0 focus-visible:outline-none"
        >
          <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="w-10 px-3 py-3 text-center"></th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    ID
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Cliente
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Casamento
                  </th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Status
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {contratos.map((order) => {
                  const pendente = order.totalValue - (order.signalPaid || 0);
                  const isExpanded = expandedOrderId === order.id;

                  return (
                    <Fragment key={order.id}>
                      <tr
                        className={`border-b border-border hover:bg-muted/30 transition-colors ${isExpanded ? "bg-muted/10" : ""}`}
                      >
                        <td
                          className="px-3 py-4 text-center cursor-pointer"
                          onClick={() => toggleExpand(order.id)}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary"
                          >
                            {isExpanded ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </Button>
                        </td>
                        <td
                          className="px-3 py-4 font-mono text-xs text-muted-foreground cursor-pointer"
                          onClick={() => toggleExpand(order.id)}
                        >
                          {order.id}
                        </td>
                        <td
                          className="px-5 py-4 cursor-pointer"
                          onClick={() => toggleExpand(order.id)}
                        >
                          <p className="font-medium text-foreground">
                            {order.clientName}
                          </p>
                          {pendente > 0 ? (
                            <span className="text-[10px] text-red-600 font-bold">
                              Deve R$ {pendente.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-bold">
                              Total Pago
                            </span>
                          )}
                        </td>
                        <td
                          className="px-5 py-4 font-medium cursor-pointer"
                          onClick={() => toggleExpand(order.id)}
                        >
                          {order.eventoDate
                            ? order.eventoDate.split("-").reverse().join("/")
                            : "-"}
                        </td>
                        <td
                          className="px-5 py-4 text-center cursor-pointer"
                          onClick={() => toggleExpand(order.id)}
                        >
                          {order.status === "confirmado" && (
                            <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                              Aguardando Retirada
                            </span>
                          )}
                          {order.status === "em_uso" && (
                            <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                              Em Uso pela Cliente
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs"
                              onClick={() => {
                                window.location.href = `/admin/contrato/${order.id}`;
                              }}
                            >
                              <FileText size={14} className="mr-1.5" /> PDF
                            </Button>
                            {order.status === "confirmado" && (
                              <Button
                                size="sm"
                                className="h-8 text-xs bg-primary"
                                onClick={() => registrarRetirada(order)}
                              >
                                <PackageCheck size={14} className="mr-1.5" />{" "}
                                Liberar Retirada
                              </Button>
                            )}
                            {order.status === "em_uso" && (
                              <Button
                                size="sm"
                                className="h-8 text-xs bg-amber-600 hover:bg-amber-700"
                                onClick={() => setDevolvendo(order)}
                              >
                                <PackageOpen size={14} className="mr-1.5" />{" "}
                                Receber Devolução
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-muted/10 border-b border-border shadow-inner">
                          <td colSpan={6} className="px-8 py-6">
                            <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
                              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                                <h3 className="font-semibold text-foreground flex items-center gap-2">
                                  <Layers size={16} className="text-primary" />{" "}
                                  Comprovante de Peças (
                                  {order.items?.length || 0})
                                </h3>
                                <div className="text-right">
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">
                                    Valor Total do Contrato
                                  </p>
                                  <p className="text-lg font-bold text-primary">
                                    R${" "}
                                    {(order.totalValue || 0).toLocaleString(
                                      "pt-BR",
                                      { minimumFractionDigits: 2 },
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {order.items?.map((item: any, idx: number) => {
                                  const imgSrc =
                                    item.image || "/placeholder.jpg";
                                  return (
                                    <div
                                      key={idx}
                                      className="flex gap-4 p-3 rounded-lg border border-border/60 hover:border-primary/30 transition-colors bg-secondary/5"
                                    >
                                      <div className="relative w-16 h-20 rounded-md overflow-hidden shrink-0 border border-border">
                                        <Image
                                          src={imgSrc}
                                          alt={item.name}
                                          fill
                                          className="object-cover object-top"
                                          sizes="64px"
                                        />
                                      </div>
                                      <div className="flex flex-col justify-center flex-1">
                                        <p
                                          className="text-sm font-semibold text-foreground line-clamp-1"
                                          title={item.name}
                                        >
                                          {item.name}
                                        </p>
                                        <div className="flex gap-2 text-xs text-muted-foreground mt-1 mb-2 font-mono bg-white w-fit px-1.5 py-0.5 rounded border border-border/50">
                                          <span>{item.sku}</span>
                                          <span>|</span>
                                          <span>Tam: {item.size}</span>
                                        </div>
                                        <p className="text-xs font-medium text-emerald-600">
                                          R${" "}
                                          {(item.price || 0).toLocaleString(
                                            "pt-BR",
                                            { minimumFractionDigits: 2 },
                                          )}
                                        </p>
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
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-muted-foreground"
                    >
                      Nenhum contrato ativo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="pecas" className="m-0 focus-visible:outline-none">
          <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">
                      Peça
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">
                      Cliente
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">
                      Data Evento
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">
                      Localização / Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pecasNaRua.map((peca, idx) => {
                    const imgSrc = peca.image || "/placeholder.jpg";
                    return (
                      <tr
                        key={`${peca.orderId}-${peca.id}-${idx}`}
                        className="border-b border-border hover:bg-muted/30"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-12 rounded-md overflow-hidden bg-secondary shrink-0 border border-border/50">
                              <Image
                                src={imgSrc}
                                alt={peca.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            </div>
                            <div>
                              <span className="font-semibold text-foreground text-xs">
                                {peca.name}
                              </span>
                              <p className="text-[10px] text-muted-foreground font-mono">
                                SKU: {peca.sku} | T: {peca.size}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-medium text-foreground text-xs">
                            {peca.clientName}
                          </p>
                          <a
                            href={`https://wa.me/${peca.clientPhone?.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-primary hover:underline flex items-center gap-1 mt-0.5"
                          >
                            {peca.clientPhone}
                          </a>
                        </td>
                        <td className="px-5 py-3 font-medium text-xs">
                          {peca.eventoDate
                            ? peca.eventoDate.split("-").reverse().join("/")
                            : "-"}
                        </td>
                        <td className="px-5 py-3">
                          {peca.status === "confirmado" ? (
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center w-fit gap-1.5 border border-blue-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>{" "}
                              Na Loja (Reservado)
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
                      <td
                        colSpan={4}
                        className="px-5 py-10 text-center text-muted-foreground"
                      >
                        Nenhuma peça alugada no momento.
                      </td>
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
              <h2 className="text-lg font-bold text-foreground">
                Receber Devolução
              </h2>
              <p className="text-sm text-muted-foreground">
                Contrato #{devolvendo.id} - {devolvendo.clientName}
              </p>
            </div>
            <div>
              <Label className="text-xs mb-2 block font-semibold text-primary">
                Estado em que os vestidos retornaram:
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={devolucaoStatus === "livre" ? "default" : "outline"}
                  onClick={() => setDevolucaoStatus("livre")}
                  className="h-10 text-xs"
                >
                  Perfeitos (Vitrine)
                </Button>
                <Button
                  type="button"
                  variant={
                    devolucaoStatus === "manutencao" ? "default" : "outline"
                  }
                  onClick={() => setDevolucaoStatus("manutencao")}
                  className="h-10 text-xs text-amber-700 border-amber-200 hover:bg-amber-50"
                >
                  Lavanderia / Reparo
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">
                Houve atraso ou avaria? Cobrar Multa (R$):
              </Label>
              <Input
                type="number"
                min={0}
                value={multa}
                onChange={(e) => setMulta(Number(e.target.value))}
                className="h-10"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => setDevolvendo(null)}
                variant="ghost"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={registrarDevolucao}
                className="flex-1 bg-amber-600 hover:bg-amber-700"
              >
                Confirmar Recebimento
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 4. O NOSSO NOVO MODAL DE LIBERAÇÃO RENDENRIZADO AQUI! */}
      <ModalLiberacao
        open={!!pedidoParaLiberar}
        onClose={() => setPedidoParaLiberar(null)}
        order={pedidoParaLiberar}
        onSuccess={(pedidoAtualizado: any) => {
          updateOrderStatus(pedidoAtualizado.id, "em_uso");
          if (updateOrderFinancial) {
            updateOrderFinancial(pedidoAtualizado.id, pedidoAtualizado);
          }
          setPedidoParaLiberar(null);
        }}
      />
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


// ─── CONFIGURAÇÕES (COM TEMPLATE DE CONTRATO E HORÁRIOS) ────────────────────────────────
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
      
      <Button onClick={handleSave} className="w-fit bg-primary mb-4">
        <Save size={16} className="mr-2" /> Salvar Configurações Acima
      </Button>

      {/* ─── INJEÇÃO DO COMPONENTE DE HORÁRIOS AQUI ─── */}
      <div className="border-t border-border pt-6 mt-2">
        <ConfigHorarios />
      </div>

    </div>
  );
}

// ─── ESTOQUE ──────────────────────────────────────────────────────────────
function SectionEstoque() {
  const {
    catalog,
    products,
    deleteProduct,
    setEditingProduct,
    setSection,
    setCollections,
    updateProduct,
    orders,
    storeConfig,
  } = useAdminStore();
  const itensParaMostrar = products.length > 0 ? products : catalog;

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  const filteredItems = itensParaMostrar.filter((item: any) => {
    const matchSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "todos" || item.stock === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja apagar esta peça do estoque?")) return;
    try {
      const response = await fetch(`/api/produtos?id=${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        deleteProduct(id);
        const resCol = await fetch("/api/colecoes");
        if (resCol.ok) setCollections(await resCol.json());
      } else alert("Erro ao apagar no banco de dados.");
    } catch (error) {
      alert("Erro de conexão com a API.");
    }
  };

  const handleAtivarPeca = async (id: string) => {
    try {
      const res = await fetch(`/api/produtos?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: "livre" }),
      });
      if (res.ok) {
        updateProduct(id, { stock: "livre" });
      } else {
        alert("Erro ao atualizar o status da peça.");
      }
    } catch (error) {
      alert("Erro de conexão.");
    }
  };

  // ── MÁGICA: Calcular quantidade disponível HOJE ──
  const unavailableCounts = new Map<string, number>();
  if (storeConfig) {
    const todayStr = new Date().toISOString().split("T")[0];
    const targetTime = new Date(todayStr + "T12:00:00").getTime();

    orders.forEach((o) => {
      if (o.status !== "confirmado" && o.status !== "em_uso") return;
      if (!o.eventoDate) return;

      const eventTime = new Date(o.eventoDate + "T12:00:00").getTime();
      const diffDays = Math.round(
        (targetTime - eventTime) / (1000 * 60 * 60 * 24),
      );

      const windowBefore =
        storeConfig.windowBefore !== undefined
          ? Number(storeConfig.windowBefore)
          : 3;
      const windowAfter =
        storeConfig.windowAfter !== undefined
          ? Number(storeConfig.windowAfter)
          : 3;

      if (diffDays >= -windowBefore && diffDays <= windowAfter) {
        o.items.forEach((item: any) => {
          const idStr = item.id.toString();
          const currentCount = unavailableCounts.get(idStr) || 0;
          unavailableCounts.set(idStr, currentCount + 1);
        });
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Catálogo & Inventário
          </h1>
          <p className="text-sm text-muted-foreground">
            {itensParaMostrar.length} peças cadastradas na loja
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => {
            setEditingProduct(null);
            setSection("cadastro");
          }}
        >
          <Plus size={14} /> Nova Peça
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap items-center bg-white border border-border rounded-xl p-4 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
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
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-xs text-muted-foreground"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("todos");
            }}
          >
            Limpar Filtros
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Peça
                </th>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  SKU
                </th>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Tamanho
                </th>
                <th className="text-center px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Estoque
                </th>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Condição Física
                </th>
                <th className="text-right px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item: any) => {
                const imgSrc = item.images?.[0] || item.image;
                const finalImg =
                  typeof imgSrc === "string" && imgSrc.trim() !== ""
                    ? imgSrc
                    : "/placeholder.jpg";

                const qtyTotal = Number(item.quantity) || 1;
                const qtyUnavailable =
                  unavailableCounts.get(item.id.toString()) || 0;
                const qtyAvailable = Math.max(0, qtyTotal - qtyUnavailable);

                return (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-12 rounded-md overflow-hidden bg-secondary shrink-0 border border-border/50">
                          <Image
                            src={finalImg}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                        <span className="font-medium text-foreground">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                      {item.sku}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {item.size}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span className="text-sm font-bold text-foreground">
                          {qtyAvailable}{" "}
                          <span className="text-xs text-muted-foreground font-normal">
                            / {qtyTotal} livres
                          </span>
                        </span>
                        {qtyUnavailable > 0 && (
                          <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md font-medium leading-none">
                            {qtyUnavailable} em uso/preparo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {item.stock === "manutencao" ? (
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
                      {item.stock === "manutencao" && (
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

                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        onClick={() => {
                          setEditingProduct(item);
                          setSection("cadastro");
                        }}
                        title="Editar Peça"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                        onClick={() => handleDelete(item.id)}
                        title="Apagar Peça"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm text-muted-foreground"
                  >
                    Nenhuma peça encontrada com estes filtros.
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
                    <SelectItem value="manutencao">
                      Em Manutenção / Inativa
                    </SelectItem>
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
              <Label className="text-xs mb-1.5 font-medium">
                Nome da Coleção *
              </Label>
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
              <Label className="text-xs font-semibold text-primary">
                Selecione as peças desta coleção ({form.productIds.length}{" "}
                selecionadas)
              </Label>
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
                      <p
                        className="text-[10px] font-semibold text-foreground truncate"
                        title={p.name}
                      >
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
                    {colProducts.length} peça
                    {colProducts.length !== 1 ? "s" : ""} na coleção
                  </span>
                </div>

                {colProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic bg-secondary/20 p-4 rounded-lg border border-dashed border-border text-center">
                    Coleção vazia. Clique no botão de edição para adicionar
                    vestidos.
                  </p>
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
                            <p
                              className="text-[11px] font-semibold text-foreground truncate"
                              title={p.name}
                            >
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
        const [resPed, resProd, resConf, resCategorias, resColecoes, resFin] =
          await Promise.all([
            fetch("/api/pedidos"),
            fetch("/api/produtos"),
            fetch("/api/configuracoes"),
            fetch("/api/categorias"),
            fetch("/api/colecoes"),
            fetch("/api/financeiro"),
          ]);

        if (resPed.ok) {
          const dados = await resPed.json();
          if (Array.isArray(dados)) setOrders(dados);
        }
        if (resProd.ok) {
          const dados = await resProd.json();
          if (Array.isArray(dados)) setProducts(dados);
        }
        if (resConf.ok) {
          const dados = await resConf.json();
          setStoreConfig(dados);
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

    // 1. Carrega tudo imediatamente ao abrir o painel
    carregarDadosReais();

    // 2. MÁGICA DO TEMPO REAL: Atualiza tudo silenciosamente a cada 5 segundos
    const intervaloEmTempoReal = setInterval(() => {
      carregarDadosReais();
    }, 5000);

    // 3. Limpa a memória se a Helena fechar o painel
    return () => clearInterval(intervaloEmTempoReal);
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