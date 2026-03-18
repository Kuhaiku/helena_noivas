"use client"

import { useState } from "react"
import Image from "next/image"
import { useAdminStore, type DressItem } from "@/lib/admin-store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrderStatusBadge } from "@/components/admin/status-badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, X } from "lucide-react"

export function ModalPedido() {
  const {
    selectedOrder,
    isOrderModalOpen,
    setOrderModalOpen,
    updateOrderItems,
    updateOrderStatus,
    catalog,
    setFinancialModalOpen,
  } = useAdminStore()

  const [localItems, setLocalItems] = useState<DressItem[]>(selectedOrder?.items ?? [])
  const [addingId, setAddingId] = useState("")

  if (!selectedOrder) return null

  const items = localItems.length > 0 ? localItems : selectedOrder.items

  const handleOpen = (open: boolean) => {
    if (open) setLocalItems(selectedOrder.items)
    setOrderModalOpen(open)
  }

  const handleAddItem = () => {
    if (!addingId) return
    const dress = catalog.find((d) => d.id === addingId)
    if (!dress || items.find((i) => i.id === addingId)) return
    setLocalItems([...items, { ...dress, note: "", discount: 0 }])
    setAddingId("")
  }

  const handleRemoveItem = (id: string) => {
    setLocalItems(items.filter((i) => i.id !== id))
  }

  const handleNoteChange = (id: string, note: string) => {
    setLocalItems(items.map((i) => (i.id === id ? { ...i, note } : i)))
  }

  const handleDiscountChange = (id: string, discount: number) => {
    setLocalItems(items.map((i) => (i.id === id ? { ...i, discount } : i)))
  }

  const handleSave = () => {
    updateOrderItems(selectedOrder.id, items)
    setOrderModalOpen(false)
  }

  const subtotal = items.reduce((s, i) => s + i.price, 0)
  const totalDiscount = items.reduce((s, i) => s + (i.discount ?? 0), 0)
  const total = subtotal - totalDiscount

  const availableToadd = catalog.filter((d) => !items.find((i) => i.id === d.id))

  return (
    <Dialog open={isOrderModalOpen} onOpenChange={handleOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-base">
                Pedido {selectedOrder.id} — {selectedOrder.clientName}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Prova: {selectedOrder.provaDate} às {selectedOrder.provaTime}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <OrderStatusBadge status={selectedOrder.status} />
              <Select
                value={selectedOrder.status}
                onValueChange={(v) => updateOrderStatus(selectedOrder.id, v as any)}
              >
                <SelectTrigger className="h-7 text-xs w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="compareceu">Compareceu</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        {/* Items */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Carrinho</p>
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 bg-muted/40 rounded-lg p-3">
              <div className="relative w-16 h-20 rounded-md overflow-hidden shrink-0 bg-border">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.sku} · Tam. {item.size}
                    </p>
                    <p className="text-sm font-medium text-foreground mt-0.5">
                      R$ {item.price.toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Label className="text-[10px] text-muted-foreground mb-1">Notas de Costura</Label>
                    <Input
                      value={item.note ?? ""}
                      onChange={(e) => handleNoteChange(item.id, e.target.value)}
                      placeholder="Ex: Ajuste nas alças..."
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground mb-1">Desconto (R$)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={item.discount ?? 0}
                      onChange={(e) => handleDiscountChange(item.id, Number(e.target.value))}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add item */}
        {availableToadd.length > 0 && (
          <div className="flex gap-2 items-center">
            <Select value={addingId} onValueChange={setAddingId}>
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue placeholder="Adicionar vestido ao carrinho..." />
              </SelectTrigger>
              <SelectContent>
                {availableToadd.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name} — {d.sku} (Tam. {d.size})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={handleAddItem} className="h-8 gap-1">
              <Plus size={13} /> Adicionar
            </Button>
          </div>
        )}

        <Separator />

        {/* Totals */}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>R$ {subtotal.toLocaleString("pt-BR")}</span>
          </div>
          {totalDiscount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Descontos</span>
              <span>− R$ {totalDiscount.toLocaleString("pt-BR")}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-foreground border-t border-border pt-2">
            <span>Total</span>
            <span>R$ {total.toLocaleString("pt-BR")}</span>
          </div>
        </div>

        <DialogFooter className="gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setOrderModalOpen(false)}>
            Cancelar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setOrderModalOpen(false)
              setFinancialModalOpen(true)
            }}
          >
            Fechamento Financeiro
          </Button>
          <Button size="sm" onClick={handleSave}>
            Salvar Pedido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
