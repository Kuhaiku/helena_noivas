"use client"

import { useState } from "react"
import { useAdminStore, type OrderStatus } from "@/lib/admin-store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"

function generateId() {
  return "PED-" + String(Math.floor(Math.random() * 900) + 100)
}

export function ModalNovoPedido() {
  const { isNewOrderModalOpen, setNewOrderModalOpen, addOrder } = useAdminStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    provaDate: "",
    provaTime: "10:00",
  })

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async () => {
    if (!form.clientName || !form.provaDate) return
    
    setLoading(true)
    try {
      const novoPedido = {
        clientName: form.clientName,
        clientPhone: form.clientPhone,
        clientEmail: form.clientEmail,
        provaDate: form.provaDate,
        provaTime: form.provaTime,
        status: "pendente",
        items: [],
        totalValue: 0,
        signalPaid: 0,
        eventoDate: ""
      }

      // ── ENVIO PARA O BANCO DE DADOS (API) ──
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoPedido),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        // Se gravou no banco, atualizamos a lista na tela
        addOrder({
          id: data.id, // Usa o ID real gerado pelo MySQL
          ...novoPedido,
          status: "pendente" as OrderStatus,
          items: [],
          createdAt: new Date().toISOString().split("T")[0],
        })

        toast({
          title: "Sucesso!",
          description: "Agendamento gravado no banco de dados.",
        })

        setNewOrderModalOpen(false)
        setForm({ clientName: "", clientPhone: "", clientEmail: "", provaDate: "", provaTime: "10:00" })
      } else {
        throw new Error(data.message || "Erro ao salvar")
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message || "Verifique a conexão com o banco.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isNewOrderModalOpen} onOpenChange={setNewOrderModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Novo Agendamento Manual</DialogTitle>
        </DialogHeader>
        <Separator />
        <div className="space-y-3">
          <div>
            <Label className="text-xs mb-1.5">Nome da Cliente *</Label>
            <Input 
              value={form.clientName} 
              onChange={(e) => set("clientName", e.target.value)} 
              placeholder="Nome completo" 
              className="h-8 text-sm" 
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5">Telefone</Label>
              <Input 
                value={form.clientPhone} 
                onChange={(e) => set("clientPhone", e.target.value)} 
                placeholder="11 99999-0000" 
                className="h-8 text-sm" 
                disabled={loading}
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5">E-mail</Label>
              <Input 
                value={form.clientEmail} 
                onChange={(e) => set("clientEmail", e.target.value)} 
                placeholder="email@..." 
                className="h-8 text-sm" 
                disabled={loading}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5">Data da Prova *</Label>
              <Input 
                type="date" 
                value={form.provaDate} 
                onChange={(e) => set("provaDate", e.target.value)} 
                className="h-8 text-sm" 
                disabled={loading}
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5">Horário</Label>
              <Select 
                value={form.provaTime} 
                onValueChange={(v) => set("provaTime", v)}
                disabled={loading}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => setNewOrderModalOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={loading || !form.clientName || !form.provaDate}>
            {loading ? "Salvando..." : "Criar Agendamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}