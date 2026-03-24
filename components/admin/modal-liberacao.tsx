"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, DollarSign, CheckCircle2, ShieldAlert } from "lucide-react"

export function ModalLiberacao({ open, onClose, order, onSuccess }: any) {
  const [loading, setLoading] = useState(false)

  if (!order) return null

  const total = Number(order.totalValue) || 0
  const pago = Number(order.signalPaid) || 0
  const divida = Math.max(0, total - pago)

  const handleReceberELiberar = async () => {
    setLoading(true)
    try {
      // 1. Atualiza pedido: Marca como Pago total e Status 'em_uso'
      const dadosAtualizados = {
        ...order,
        status: "em_uso",
        signalPaid: total 
      }

      await fetch(`/api/pedidos?id=${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosAtualizados)
      })

      // 2. MÁGICA: Lança a entrada financeira automaticamente
      await fetch('/api/financeiro', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "entrada",
          description: `Quitação de Saldo - Contrato #${order.id} - ${order.clientName}`,
          amount: divida,
          date: new Date().toISOString().split('T')[0],
          category: "Aluguel",
          orderId: order.id
        })
      })

      onSuccess(dadosAtualizados)
    } catch (error) {
      alert("Erro ao liberar as peças.")
    } finally {
      setLoading(false)
    }
  }

  const handleLiberarSemReceber = async () => {
    setLoading(true)
    try {
      const dadosAtualizados = { ...order, status: "em_uso" }
      await fetch(`/api/pedidos?id=${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosAtualizados)
      })
      onSuccess(dadosAtualizados)
    } catch (error) {
      alert("Erro ao liberar as peças.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md text-center p-8 rounded-3xl shadow-2xl border-0">
        {divida > 0 ? (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-5 shadow-inner">
              <ShieldAlert size={40} strokeWidth={1.5} />
            </div>
            <DialogTitle className="text-2xl font-serif text-foreground mb-3">Saldo Pendente!</DialogTitle>
            <p className="text-muted-foreground leading-relaxed mb-6">
              A cliente <strong>{order.clientName}</strong> ainda tem um saldo em aberto de <strong className="text-amber-600 text-lg">R$ {divida.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>.
            </p>

            <div className="flex flex-col gap-3 w-full">
              <Button
                onClick={handleReceberELiberar}
                disabled={loading}
                className="w-full h-14 text-base font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md gap-2"
              >
                <DollarSign size={18} /> Receber Saldo e Liberar
              </Button>
              <Button
                variant="outline"
                onClick={handleLiberarSemReceber}
                disabled={loading}
                className="w-full h-12 text-sm font-medium rounded-xl border-amber-200 text-amber-700 hover:bg-amber-50 gap-2"
              >
                <AlertTriangle size={16} /> Liberar sem receber agora
              </Button>
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={loading}
                className="w-full h-12 mt-2 text-muted-foreground"
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-5 shadow-inner">
              <CheckCircle2 size={40} strokeWidth={1.5} />
            </div>
            <DialogTitle className="text-2xl font-serif text-foreground mb-3">Tudo Pago!</DialogTitle>
            <p className="text-muted-foreground leading-relaxed mb-6">
              O contrato não tem pendências financeiras. As peças podem ser entregues à cliente.
            </p>
            <div className="flex flex-col gap-3 w-full">
              <Button
                onClick={handleLiberarSemReceber}
                disabled={loading}
                className="w-full h-14 text-base font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
              >
                Liberar Peças
              </Button>
              <Button variant="ghost" onClick={onClose} disabled={loading} className="w-full h-12 text-muted-foreground">Cancelar</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}