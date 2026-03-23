"use client"

import { useState, useEffect } from "react"
import { useAdminStore } from "@/lib/admin-store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { FileSignature, Lock, AlertTriangle, Loader2 } from "lucide-react"

export function ModalFechamento() {
  const {
    selectedOrder,
    isFinancialModalOpen,
    setFinancialModalOpen,
    updateOrderFinancial,
    updateOrderStatus,
  } = useAdminStore()

  const subtotal = selectedOrder?.items.reduce((s, i) => s + (i.price || 0), 0) ?? 0
  const totalDiscount = selectedOrder?.items.reduce((s, i) => s + (i.discount ?? 0), 0) ?? 0
  const total = subtotal - totalDiscount

  const defaultSignal = Math.round(total * 0.3)

  const [signalPaid, setSignalPaid] = useState(defaultSignal)
  const [cautionValue, setCautionValue] = useState(500)
  const [quitDate, setQuitDate] = useState("")
  const [eventoDate, setEventoDate] = useState("") // NOVO: Data do Casamento
  const [fees, setFees] = useState(0)

  // ESTADOS DO MOTOR DE DISPONIBILIDADE
  const [isChecking, setIsChecking] = useState(false)
  const [blockedErrors, setBlockedErrors] = useState<string[]>([])

  useEffect(() => {
    if (selectedOrder) {
      const base = subtotal - totalDiscount
      setSignalPaid(selectedOrder.signalPaid ?? Math.round(base * 0.3))
      setCautionValue(selectedOrder.cautionValue ?? 500)
      setQuitDate(selectedOrder.quitDate ?? "")
      setEventoDate(selectedOrder.eventoDate ?? "")
      setBlockedErrors([]) // Limpa erros ao abrir
    }
  }, [selectedOrder])

  if (!selectedOrder) return null

  const grandTotal = total + fees
  const remaining = grandTotal - signalPaid

  const handleConfirm = async () => {
    if (!eventoDate) {
      setBlockedErrors(["A Data do Casamento/Evento é obrigatória para fechar o contrato."])
      return
    }

    setIsChecking(true)
    setBlockedErrors([])
    const errosEncontrados: string[] = []

    try {
      // Usamos um timestamp (?t=Date.now) para o navegador NUNCA usar cache nesta chamada
      for (const item of selectedOrder.items) {
        const res = await fetch(`/api/disponibilidade?produtoId=${item.id}&t=${Date.now()}`)
        
        if (res.ok) {
          const data = await res.json()
          if (data.error) {
            errosEncontrados.push(`Erro no sistema ao verificar o vestido ${item.sku}: ${data.error}`)
          } else if (data.blockedDates && data.blockedDates.includes(eventoDate)) {
            errosEncontrados.push(`O vestido "${item.name}" (${item.sku}) não tem estoque livre para o dia ${eventoDate.split('-').reverse().join('/')}.`)
          }
        } else {
          errosEncontrados.push(`Falha de comunicação com o servidor ao verificar a peça: ${item.name}.`)
        }
      }

      // SE HOUVER CONFLITO, BLOQUEIA TUDO!
      if (errosEncontrados.length > 0) {
        setBlockedErrors(errosEncontrados)
        setIsChecking(false)
        return 
      }

      // SE ESTIVER TUDO LIVRE, PROCEDE COM O FECHAMENTO
      const dadosAtualizados = {
        ...selectedOrder,
        eventoDate,
        signalPaid,
        totalValue: grandTotal,
        discountTotal: totalDiscount,
        cautionValue,
        quitDate,
        status: "confirmado"
      }

      // Atualiza o banco de dados
      await fetch(`/api/pedidos?id=${selectedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosAtualizados)
      })

      // Atualiza o estado visual
      updateOrderFinancial(selectedOrder.id, dadosAtualizados as any)
      updateOrderStatus(selectedOrder.id, "confirmado")
      setFinancialModalOpen(false)

    } catch (error) {
      setBlockedErrors(["Erro de rede ao verificar o estoque. Tente novamente."])
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <Dialog open={isFinancialModalOpen} onOpenChange={setFinancialModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <FileSignature size={16} className="text-primary" />
            Fechamento Financeiro — {selectedOrder.id}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">{selectedOrder.clientName}</p>
        </DialogHeader>

        {/* ALERTA DE BLOQUEIO (MOTOR MATEMÁTICO) */}
        {blockedErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex flex-col gap-1.5 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle size={14} />
              Conflito de Estoque Detetado
            </div>
            <ul className="list-disc pl-5 text-[11.5px] text-red-600 font-medium">
              {blockedErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <Separator />

        {/* Resumo */}
        <div className="space-y-1.5 text-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Resumo de Valores</p>
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal ({selectedOrder.items.length} peça{selectedOrder.items.length !== 1 ? "s" : ""})</span>
            <span>R$ {subtotal.toLocaleString("pt-BR")}</span>
          </div>
          {totalDiscount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Descontos aplicados</span>
              <span>− R$ {totalDiscount.toLocaleString("pt-BR")}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Taxas adicionais</span>
            <Input
              type="number"
              min={0}
              value={fees}
              onChange={(e) => setFees(Number(e.target.value))}
              className="h-7 text-xs w-28 text-right"
            />
          </div>
          <div className="flex justify-between font-semibold text-foreground border-t border-border pt-2">
            <span>Total</span>
            <span>R$ {grandTotal.toLocaleString("pt-BR")}</span>
          </div>
        </div>

        <Separator />

        {/* Pagamento e Datas */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Datas e Pagamento</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 text-primary font-bold">Data do Evento *</Label>
              <Input
                type="date"
                value={eventoDate}
                onChange={(e) => {
                  setEventoDate(e.target.value)
                  setBlockedErrors([]) // Limpa o erro se a pessoa mudar a data
                }}
                className={`h-8 text-sm ${!eventoDate ? 'border-primary/50 bg-primary/5' : ''}`}
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5">Data de Quitação</Label>
              <Input
                type="date"
                value={quitDate}
                onChange={(e) => setQuitDate(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5 flex justify-between">
                <span>Sinal (30% = R$ {defaultSignal.toLocaleString("pt-BR")})</span>
              </Label>
              <Input
                type="number"
                min={0}
                value={signalPaid}
                onChange={(e) => setSignalPaid(Number(e.target.value))}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5">Valor de Caução</Label>
              <Input
                type="number"
                min={0}
                value={cautionValue}
                onChange={(e) => setCautionValue(Number(e.target.value))}
                className="h-8 text-sm"
              />
            </div>
          </div>

          {/* Saldo */}
          <div className="bg-muted rounded-lg p-3 flex justify-between items-center mt-1">
            <span className="text-sm text-muted-foreground">Saldo restante</span>
            <span className={`text-sm font-bold ${remaining > 0 ? "text-amber-600" : "text-emerald-600"}`}>
              R$ {remaining.toLocaleString("pt-BR")}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setFinancialModalOpen(false)} disabled={isChecking}>
            Cancelar
          </Button>
          <Button size="sm" className="gap-1.5" onClick={handleConfirm} disabled={isChecking}>
            {isChecking ? (
              <><Loader2 size={13} className="animate-spin" /> Verificando...</>
            ) : (
              <><Lock size={13} /> Gerar Contrato e Bloquear Estoque</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}