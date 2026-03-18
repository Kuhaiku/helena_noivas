"use client"

import { useState, useEffect } from "react"
import { useAdminStore } from "@/lib/admin-store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { FileSignature, Lock } from "lucide-react"

export function ModalFechamento() {
  const {
    selectedOrder,
    isFinancialModalOpen,
    setFinancialModalOpen,
    updateOrderFinancial,
    updateOrderStatus,
  } = useAdminStore()

  const subtotal = selectedOrder?.items.reduce((s, i) => s + i.price, 0) ?? 0
  const totalDiscount = selectedOrder?.items.reduce((s, i) => s + (i.discount ?? 0), 0) ?? 0
  const total = subtotal - totalDiscount

  const defaultSignal = Math.round(total * 0.3)

  const [signalPaid, setSignalPaid] = useState(defaultSignal)
  const [cautionValue, setCautionValue] = useState(500)
  const [quitDate, setQuitDate] = useState("")
  const [fees, setFees] = useState(0)

  useEffect(() => {
    if (selectedOrder) {
      const base = subtotal - totalDiscount
      setSignalPaid(selectedOrder.signalPaid ?? Math.round(base * 0.3))
      setCautionValue(selectedOrder.cautionValue ?? 500)
      setQuitDate(selectedOrder.quitDate ?? "")
    }
  }, [selectedOrder])

  if (!selectedOrder) return null

  const grandTotal = total + fees
  const remaining = grandTotal - signalPaid

  const handleConfirm = () => {
    updateOrderFinancial(selectedOrder.id, {
      signalPaid,
      totalValue: grandTotal,
      discountTotal: totalDiscount,
      cautionValue,
      quitDate,
    })
    updateOrderStatus(selectedOrder.id, "confirmado")
    setFinancialModalOpen(false)
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

        {/* Sinal */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pagamento</p>

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

          <div>
            <Label className="text-xs mb-1.5">Data de Quitação</Label>
            <Input
              type="date"
              value={quitDate}
              onChange={(e) => setQuitDate(e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          {/* Saldo */}
          <div className="bg-muted rounded-lg p-3 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Saldo restante</span>
            <span className={`text-sm font-bold ${remaining > 0 ? "text-amber-600" : "text-emerald-600"}`}>
              R$ {remaining.toLocaleString("pt-BR")}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setFinancialModalOpen(false)}>
            Cancelar
          </Button>
          <Button size="sm" className="gap-1.5" onClick={handleConfirm}>
            <Lock size={13} />
            Gerar Contrato e Bloquear Estoque
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
