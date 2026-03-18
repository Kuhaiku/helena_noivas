"use client"

import { useState } from "react"
import { useAdminStore, type OrderStatus } from "@/lib/admin-store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

function generateId() {
  return "PED-" + String(Math.floor(Math.random() * 900) + 100)
}

export function ModalNovoPedido() {
  const { isNewOrderModalOpen, setNewOrderModalOpen, addOrder } = useAdminStore()

  const [form, setForm] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    provaDate: "",
    provaTime: "10:00",
  })

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = () => {
    if (!form.clientName || !form.provaDate) return
    addOrder({
      id: generateId(),
      ...form,
      status: "pendente" as OrderStatus,
      items: [],
      createdAt: new Date().toISOString().split("T")[0],
    })
    setNewOrderModalOpen(false)
    setForm({ clientName: "", clientPhone: "", clientEmail: "", provaDate: "", provaTime: "10:00" })
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
            <Input value={form.clientName} onChange={(e) => set("clientName", e.target.value)} placeholder="Nome completo" className="h-8 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5">Telefone</Label>
              <Input value={form.clientPhone} onChange={(e) => set("clientPhone", e.target.value)} placeholder="11 99999-0000" className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs mb-1.5">E-mail</Label>
              <Input value={form.clientEmail} onChange={(e) => set("clientEmail", e.target.value)} placeholder="email@..." className="h-8 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1.5">Data da Prova *</Label>
              <Input type="date" value={form.provaDate} onChange={(e) => set("provaDate", e.target.value)} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs mb-1.5">Horário</Label>
              <Select value={form.provaTime} onValueChange={(v) => set("provaTime", v)}>
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
          <Button variant="outline" size="sm" onClick={() => setNewOrderModalOpen(false)}>Cancelar</Button>
          <Button size="sm" onClick={handleSubmit} disabled={!form.clientName || !form.provaDate}>Criar Agendamento</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
