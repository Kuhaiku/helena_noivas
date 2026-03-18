"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAdminStore, BusinessHour } from "@/lib/admin-store"
import { Save, CheckCircle2 } from "lucide-react"

export function ConfigHorarios() {
  const { storeConfig, setStoreConfig } = useAdminStore()
  
  const [horarios, setHorarios] = useState<BusinessHour[]>(storeConfig.businessHours)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setHorarios(storeConfig.businessHours)
  }, [storeConfig.businessHours])

  const handleUpdate = (index: number, field: keyof BusinessHour, value: string | boolean) => {
    const novosHorarios = [...horarios]
    novosHorarios[index] = { ...novosHorarios[index], [field]: value }
    setHorarios(novosHorarios)
  }

  const handleSave = async () => {
    setLoading(true)
    const novaConfig = { ...storeConfig, businessHours: horarios }
    
    try {
      const res = await fetch('/api/configuracoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaConfig)
      })
      
      if (res.ok) {
        setStoreConfig(novaConfig)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        alert("Erro ao salvar os horários no banco de dados.")
      }
    } catch (e) {
      alert("Falha de conexão com a API.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Configuração de Horários da Loja</CardTitle>
        {saved && (
          <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            <CheckCircle2 size={16} /> Salvo com sucesso
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {horarios.map((diaInfo, index) => (
          <div key={diaInfo.dia} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-md transition-colors ${!diaInfo.isOpen ? 'bg-muted/50 opacity-70' : 'bg-white'}`}>
            <span className="w-24 font-medium mb-2 sm:mb-0">{diaInfo.dia}</span>
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <Input 
                type="time" 
                value={diaInfo.open} 
                onChange={(e) => handleUpdate(index, 'open', e.target.value)}
                disabled={!diaInfo.isOpen}
                className="w-28 sm:w-32 h-9" 
              />
              <span className="text-sm text-muted-foreground">até</span>
              <Input 
                type="time" 
                value={diaInfo.close} 
                onChange={(e) => handleUpdate(index, 'close', e.target.value)}
                disabled={!diaInfo.isOpen}
                className="w-28 sm:w-32 h-9" 
              />
              <div className="flex items-center gap-2 ml-2 sm:ml-4 bg-secondary/50 px-3 py-1.5 rounded-lg border border-border">
                <Switch 
                  checked={diaInfo.isOpen} 
                  onCheckedChange={(checked) => handleUpdate(index, 'isOpen', checked)}
                />
                <span className="text-xs font-medium w-12">{diaInfo.isOpen ? 'Aberto' : 'Fechado'}</span>
              </div>
            </div>
          </div>
        ))}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={loading} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Save size={16} />
            {loading ? "Salvando..." : "Salvar Horários"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}