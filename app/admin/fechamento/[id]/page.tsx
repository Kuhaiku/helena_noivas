"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, FileSignature, CheckCircle2, DollarSign, Calendar, Printer } from "lucide-react"

export default function FechamentoContratoPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [order, setOrder] = useState<any>(null)
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  // Campos do Contrato
  const [eventoDate, setEventoDate] = useState("")
  const [desconto, setDesconto] = useState(0)
  const [sinal, setSinal] = useState(0)

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resPed, resConf] = await Promise.all([
          fetch('/api/pedidos'),
          fetch('/api/configuracoes')
        ])
        
        if (resPed.ok) {
          const pedidos = await resPed.json()
          const encontrado = pedidos.find((p: any) => p.id === id)
          if (encontrado) {
            setOrder(encontrado)
            setEventoDate(encontrado.eventoDate || "")
          }
        }
        
        if (resConf.ok) {
          const c = await resConf.json()
          setConfig(c)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    carregarDados()
  }, [id])

  // Matemática Financeira Automática
  const subtotal = order?.items?.reduce((acc: number, item: any) => acc + Number(item.price), 0) || 0
  const totalFinal = Math.max(0, subtotal - desconto)
  const percentualSinal = config?.sinalPercentage || 30
  
  // Sugere o valor do sinal automaticamente com base nas configurações
  useEffect(() => {
    if (totalFinal > 0 && sinal === 0) {
      setSinal((totalFinal * percentualSinal) / 100)
    }
  }, [totalFinal, percentualSinal, sinal])

  const restante = Math.max(0, totalFinal - sinal)

  const handleFinalizarContrato = async () => {
    if (!eventoDate) return alert("A Data do Casamento é obrigatória para trancar o estoque.")
    if (sinal < 0 || sinal > totalFinal) return alert("Valor de sinal inválido.")

    setSaving(true)
    try {
      // 1. Atualiza o Pedido para CONFIRMADO (Tranca a vitrine)
      const pedidoAtualizado = {
        ...order,
        eventoDate,
        totalValue: totalFinal,
        signalPaid: sinal,
        status: "confirmado"
      }

      const resPedido = await fetch(`/api/pedidos?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedidoAtualizado)
      })

      if (!resPedido.ok) throw new Error("Erro ao atualizar pedido")

      // 2. Lança a ENTRADA no Financeiro
      if (sinal > 0) {
        const transacao = {
          type: "entrada",
          description: `Sinal - Contrato #${id} (${order.clientName})`,
          amount: sinal,
          date: new Date().toISOString().split("T")[0],
          category: "Locação",
          orderId: id
        }
        await fetch('/api/financeiro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transacao)
        })
      }

      setSucesso(true)
    } catch (error) {
      alert("Ocorreu um erro ao finalizar o contrato.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-secondary/10">A carregar contrato...</div>
  if (!order) return <div className="min-h-screen flex items-center justify-center bg-secondary/10 text-red-500">Pedido não encontrado.</div>

  if (sucesso) {
    return (
      <div className="min-h-screen bg-secondary/10 flex items-center justify-center p-4 print:bg-white print:p-0">
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-border max-w-2xl w-full flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4 print:hidden"><CheckCircle2 size={40} /></div>
          <h1 className="text-3xl font-serif mb-2">Contrato Fechado!</h1>
          <p className="text-muted-foreground mb-8 print:hidden">O estoque foi trancado e o valor do sinal já consta no seu Financeiro.</p>
          
          {/* Recibo Simples para Impressão */}
          <div className="w-full text-left border border-border rounded-xl p-6 bg-secondary/5">
            <h3 className="font-bold text-lg mb-4 border-b pb-2">Resumo do Contrato #{id}</h3>
            <p><strong>Cliente:</strong> {order.clientName}</p>
            <p><strong>Data do Casamento:</strong> {eventoDate.split('-').reverse().join('/')}</p>
            <p className="mt-4"><strong>Valor Total:</strong> R$ {totalFinal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
            <p><strong>Sinal Pago:</strong> R$ {sinal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
            <p className="text-lg font-bold text-primary mt-2">Restante na Retirada: R$ {restante.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
          </div>

          <div className="flex gap-4 mt-8 print:hidden">
            <Button onClick={() => window.print()} variant="outline" className="gap-2"><Printer size={16} /> Imprimir Recibo</Button>
            <Button onClick={() => router.push("/admin")} className="gap-2">Voltar ao Painel</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary/10 pb-20">
      <div className="bg-white border-b border-border sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin")} className="gap-2 text-muted-foreground"><ArrowLeft size={16} /> Voltar</Button>
          <Separator orientation="vertical" className="h-6" />
          <h1 className="font-semibold text-lg flex items-center gap-2"><FileSignature className="text-primary" size={20} /> Fechamento de Contrato</h1>
        </div>
        <div className="font-mono text-sm text-muted-foreground">Pedido #{order.id}</div>
      </div>

      <div className="max-w-4xl mx-auto mt-8 px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Coluna Esquerda: Dados e Peças */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">Dados da Cliente</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Nome Completo</p>
                <p className="font-medium">{order.clientName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">WhatsApp</p>
                <p className="font-medium">{order.clientPhone}</p>
              </div>
            </div>
            
            <Separator className="my-5" />
            
            <h2 className="text-sm font-semibold uppercase tracking-widest text-primary mb-4 flex items-center gap-2"><Calendar size={16}/> Data Oficial do Evento</h2>
            <div className="max-w-[250px]">
              <Label className="text-xs mb-1.5 block">Data do Casamento (Tranca o Estoque) *</Label>
              <Input type="date" value={eventoDate} onChange={e => setEventoDate(e.target.value)} className="h-11 border-primary/30 focus-visible:ring-primary" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">Peças Alugadas</h2>
            <div className="flex flex-col gap-3">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl border border-border bg-secondary/10">
                  <div className="relative w-12 h-16 rounded-md overflow-hidden shrink-0"><Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" /></div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm line-clamp-1">{item.name}</p>
                    <p className="text-xs text-muted-foreground">SKU: {item.sku} · T{item.size}</p>
                  </div>
                  <p className="font-medium text-sm">R$ {Number(item.price).toLocaleString('pt-BR')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna Direita: Financeiro */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl border border-primary/30 shadow-sm sticky top-24">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-primary mb-4 flex items-center gap-2"><DollarSign size={16}/> Acerto Financeiro</h2>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">R$ {subtotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
              </div>
              
              <div>
                <Label className="text-xs mb-1.5 block text-muted-foreground">Desconto Concedido (R$)</Label>
                <Input type="number" min={0} value={desconto} onChange={e => setDesconto(Number(e.target.value))} className="h-9" />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Total Final</span>
                <span className="font-bold text-lg text-foreground">R$ {totalFinal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
              </div>

              <div className="bg-secondary/20 p-4 rounded-xl border border-border mt-2">
                <Label className="text-xs mb-1.5 block text-primary font-semibold">Valor do Sinal Pago Agora (R$)</Label>
                <Input type="number" min={0} max={totalFinal} value={sinal} onChange={e => setSinal(Number(e.target.value))} className="h-11 font-bold text-lg text-emerald-600 bg-white" />
                <p className="text-[10px] text-muted-foreground mt-1.5">Sugestão automática: {percentualSinal}% do valor.</p>
              </div>

              <div className="flex items-center justify-between bg-primary/5 p-3 rounded-lg border border-primary/10 mt-2">
                <span className="text-xs font-semibold text-primary">Restante na Retirada</span>
                <span className="font-bold text-primary">R$ {restante.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
              </div>
            </div>

            <Button onClick={handleFinalizarContrato} disabled={saving || !eventoDate} className="w-full h-14 mt-8 text-base font-semibold shadow-md">
              {saving ? "A Processar..." : "Confirmar e Lançar"}
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}