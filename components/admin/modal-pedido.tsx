"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useAdminStore, type DressItem, type OrderStatus } from "@/lib/admin-store"
import { X, Trash2, Plus, Save, Calendar, Clock, User, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ModalPedido() {
  const { isOrderModalOpen, setOrderModalOpen, selectedOrder, products, updateOrderItems, updateOrderStatus, updateOrderFinancial, setSelectedOrder } = useAdminStore()

  const [localItems, setLocalItems] = useState<DressItem[]>([])
  const [localStatus, setLocalStatus] = useState<OrderStatus>("novo")
  const [localTotal, setLocalTotal] = useState(0)
  const [localDate, setLocalDate] = useState("")
  const [localTime, setLocalTime] = useState("")
  const [produtoSelecionado, setProdutoSelecionado] = useState<string>("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedOrder && isOrderModalOpen) {
      setLocalItems(selectedOrder.items || [])
      setLocalStatus(selectedOrder.status)
      setLocalTotal(selectedOrder.totalValue || 0)
      setLocalDate(selectedOrder.provaDate)
      setLocalTime(selectedOrder.provaTime)
    }
  }, [selectedOrder, isOrderModalOpen])

  useEffect(() => {
    if (isOrderModalOpen) {
      const novoTotal = localItems.reduce((acc, item) => acc + (item.price || 0), 0)
      setLocalTotal(novoTotal)
    }
  }, [localItems, isOrderModalOpen])

  if (!isOrderModalOpen || !selectedOrder) return null

  const handleClose = () => {
    setOrderModalOpen(false)
    setTimeout(() => setSelectedOrder(null), 300)
  }

  const removerItem = (id: string) => setLocalItems(prev => prev.filter(item => item.id !== id))

  const adicionarItem = () => {
    if (!produtoSelecionado) return
    const produtoBase = products.find(p => p.id === produtoSelecionado)
    if (!produtoBase) return
    if (localItems.some(i => i.id === produtoBase.id)) {
      alert("Este vestido já está no pedido!")
      return
    }

    const novoItem: DressItem = {
      id: produtoBase.id,
      name: produtoBase.name,
      sku: produtoBase.sku,
      size: produtoBase.size,
      price: produtoBase.rentalPrice || 0,
      image: produtoBase.images?.[0] || "/placeholder.jpg",
      stock: "alugado"
    }

    setLocalItems([...localItems, novoItem])
    setProdutoSelecionado("")
  }

  const handleSalvar = async () => {
    if (!localDate || !localTime) return alert("A data e a hora não podem estar vazias.")
    
    setLoading(true)
    try {
      const dadosAtualizados = {
        ...selectedOrder,
        status: localStatus,
        totalValue: localTotal,
        items: localItems,
        provaDate: localDate,
        provaTime: localTime
      }

      const res = await fetch(`/api/pedidos?id=${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosAtualizados)
      })

      if (res.ok) {
        updateOrderFinancial(selectedOrder.id, dadosAtualizados)
        handleClose()
      } else {
        alert("Erro ao atualizar o pedido no banco de dados.")
      }
    } catch (error) {
      alert("Erro de conexão com a API.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Pedido #{selectedOrder.id}</h2>
            <p className="text-xs text-muted-foreground">Gerencie as peças, data e o status desta prova.</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-8">
          
          {/* Info do Cliente e Reagendamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-secondary/20 p-4 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0"><User size={16} /></div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Cliente</p>
                <p className="text-sm font-semibold">{selectedOrder.clientName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0"><Phone size={16} /></div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Contato</p>
                <p className="text-sm font-semibold">{selectedOrder.clientPhone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0"><Calendar size={16} /></div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Data da Prova</p>
                <Input type="date" value={localDate} onChange={(e) => setLocalDate(e.target.value)} className="h-8 text-sm px-2 w-full" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0"><Clock size={16} /></div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Horário</p>
                <Input type="time" value={localTime} onChange={(e) => setLocalTime(e.target.value)} className="h-8 text-sm px-2 w-full" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-foreground border-b-2 border-primary pb-1">Peças no Pedido</h3>
            <div className="flex flex-col gap-3">
              {localItems.length === 0 ? (
                <p className="text-sm text-muted-foreground italic bg-secondary/30 p-4 rounded-lg text-center border border-dashed border-border">Nenhuma peça selecionada.</p>
              ) : (
                localItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between gap-4 bg-white p-3 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-16 rounded-md overflow-hidden bg-secondary shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover object-top" sizes="48px" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground line-clamp-1">{item.name}</p>
                        <p className="text-xs text-muted-foreground">SKU: {item.sku} · T{item.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-sm font-medium whitespace-nowrap">R$ {item.price.toLocaleString('pt-BR')}</p>
                      <button onClick={() => removerItem(item.id)} className="text-muted-foreground hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-end gap-3 mt-2 bg-secondary/10 p-4 rounded-xl border border-border">
              <div className="flex-1">
                <Label className="text-xs mb-1.5 block text-muted-foreground">Adicionar peça ao pedido</Label>
                <Select value={produtoSelecionado} onValueChange={setProdutoSelecionado}>
                  <SelectTrigger className="h-9 bg-white"><SelectValue placeholder="Selecione um vestido do estoque..." /></SelectTrigger>
                  <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.sku} - {p.name} (R$ {p.rentalPrice || 0})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={adicionarItem} disabled={!produtoSelecionado} variant="outline" className="h-9 gap-1.5 border-primary/50 text-primary hover:bg-primary/10"><Plus size={16} /> Adicionar</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border mt-auto">
            <div>
              <Label className="text-xs mb-1.5 block">Status do Pedido</Label>
              <Select value={localStatus} onValueChange={(v) => setLocalStatus(v as OrderStatus)}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="novo">Novo (Não Lido)</SelectItem>
                  <SelectItem value="pendente">Pendente (Aguardando)</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="compareceu">Compareceu à Prova</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col justify-center items-end bg-primary/5 px-4 rounded-lg border border-primary/10">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Valor Total</p>
              <p className="text-2xl font-serif font-bold text-primary">R$ {localTotal.toLocaleString('pt-BR')}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSalvar} disabled={loading} className="gap-2 px-8 bg-primary"><Save size={16} /> {loading ? "A Salvar..." : "Salvar Alterações"}</Button>
        </div>

      </div>
    </div>
  )
}