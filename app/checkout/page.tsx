"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Header } from "@/components/helena/header"
import { useCartStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Trash2, CheckCircle2, MessageCircle, ArrowLeft, AlertCircle, CalendarClock } from "lucide-react"

export default function CheckoutPage() {
  const { items, removeItem, clearCart } = useCartStore()
  const router = useRouter()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState("")
  
  const [form, setForm] = useState({ name: "", phone: "", email: "", date: "", time: "" })
  
  const [config, setConfig] = useState<any>(null)
  const [pedidosRegistados, setPedidosRegistados] = useState<any[]>([])
  const [availableSlots, setAvailableSlots] = useState<{time: string, available: boolean}[]>([])
  const [dbError, setDbError] = useState(false) 
  
  // ESTADOS DO NOVO POP-UP
  const [conflictModalOpen, setConflictModalOpen] = useState(false)
  const [suggestedDate, setSuggestedDate] = useState<{dateStr: string, formatted: string} | null>(null)
  const [suggestedSlots, setSuggestedSlots] = useState<{time: string, available: boolean}[]>([])
  const [suggestedTime, setSuggestedTime] = useState("")
  const [isSubmittingModal, setIsSubmittingModal] = useState(false)

  useEffect(() => {
    fetch('/api/configuracoes').then(res => res.json()).then(data => {
      if (data && data.businessHours) setConfig(data)
    }).catch(console.error)
  }, [])

  // Verifica a disponibilidade da agenda da loja (Provadores)
  useEffect(() => {
    if (form.date) {
      setDbError(false)
      fetch('/api/pedidos')
        .then(res => {
          if (!res.ok) throw new Error("Falha na comunicação")
          return res.json()
        })
        .then(data => {
          if (Array.isArray(data)) setPedidosRegistados(data)
          else throw new Error("Dados inválidos")
        })
        .catch(err => {
          console.error(err)
          setDbError(true)
        })
    }
  }, [form.date])

  // FUNÇÃO REUTILIZÁVEL: Calcula horários para qualquer data (Formulário ou Pop-up)
  const getSlotsForDate = (dateStr: string) => {
    if (!config?.businessHours) return []
    const [y, m, d] = dateStr.split('-')
    const dateObj = new Date(Number(y), Number(m) - 1, Number(d))
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    const dayName = days[dateObj.getDay()]

    const dayConfig = config.businessHours.find((b: any) => b.dia === dayName)

    if (!dayConfig || !dayConfig.isOpen) return []

    const contagemPorHora: Record<string, number> = {}
    pedidosRegistados.forEach(p => {
      if (p.provaDate === dateStr && p.status !== 'cancelado') {
        contagemPorHora[p.provaTime] = (contagemPorHora[p.provaTime] || 0) + 1
      }
    })

    const capacidadeMaxima = config.provadores || 1
    const slots = []
    let currentHour = parseInt(dayConfig.open.split(':')[0])
    const closeHour = parseInt(dayConfig.close.split(':')[0])

    while (currentHour < closeHour) {
      const slotTime = `${currentHour.toString().padStart(2, '0')}:00`
      const ocupados = contagemPorHora[slotTime] || 0
      slots.push({ time: slotTime, available: ocupados < capacidadeMaxima })
      currentHour++
    }
    
    return slots
  }

  // Preenche os horários do formulário principal
  useEffect(() => {
    if (dbError || !form.date || !config?.businessHours) {
      setAvailableSlots([])
      return
    }
    setAvailableSlots(getSlotsForDate(form.date))
    setForm(prev => ({ ...prev, time: "" })) 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.date, config, pedidosRegistados, dbError])

  // FUNÇÃO REUTILIZÁVEL: Salva o pedido final (Usada no Formulário e no Pop-up)
  const registrarPedido = async (dateToSave: string, timeToSave: string) => {
    const simplifiedItems = items.map(item => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      size: item.size
    }))

    const res = await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientName: form.name,
        clientPhone: form.phone,
        clientEmail: form.email,
        provaDate: dateToSave,
        provaTime: timeToSave,
        totalValue: 0,  
        items: simplifiedItems
      })
    })

    if (res.ok) {
      const data = await res.json()
      setOrderId(data.id) 
      setStep(2)          
      clearCart()
      setConflictModalOpen(false)         
    } else {
      alert("Erro ao salvar o agendamento.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return alert("A sua sacola está vazia!")
    if (!form.time) return alert("Por favor, selecione um horário para a prova.")
    
    setLoading(true)

    try {
      const cartBlockedDates = new Set<string>()
      let hasConflict = false

      // 1. Coleta as datas bloqueadas de TODOS os vestidos
      for (const item of items) {
        const res = await fetch(`/api/disponibilidade?produtoId=${item.id}&t=${Date.now()}`)
        if (res.ok) {
          const data = await res.json()
          if (data.blockedDates) {
            data.blockedDates.forEach((d: string) => cartBlockedDates.add(d))
            if (form.date && data.blockedDates.includes(form.date)) {
              hasConflict = true
            }
          }
        }
      }

      // 2. SE HOUVER CONFLITO: Procura o próximo dia útil com horários vagos
      if (hasConflict) {
        let checkDate = new Date(form.date + "T12:00:00")
        checkDate.setDate(checkDate.getDate() + 1) 
        let maxLookahead = 45 
        let foundDateStr = null
        let formattedStr = null
        let foundSlots: {time: string, available: boolean}[] = []

        const diasSemana = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado']

        while (maxLookahead > 0) {
          const dateStr = checkDate.toISOString().split('T')[0]
          const dayIndex = checkDate.getDay()
          const dayName = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][dayIndex]
          
          const dayConfig = config?.businessHours?.find((b: any) => b.dia === dayName)
          const isOpen = dayConfig ? dayConfig.isOpen : (dayIndex !== 0) 

          // Se as peças estão livres e a loja está aberta...
          if (!cartBlockedDates.has(dateStr) && isOpen) {
            const slotsForThisDay = getSlotsForDate(dateStr)
            
            // Verifica se REALMENTE tem horário na agenda
            if (slotsForThisDay.some(s => s.available)) {
              foundDateStr = dateStr
              formattedStr = `dia ${checkDate.getDate()} (${diasSemana[dayIndex]})`
              foundSlots = slotsForThisDay
              break
            }
          }
          checkDate.setDate(checkDate.getDate() + 1)
          maxLookahead--
        }

        setSuggestedDate(foundDateStr ? { dateStr: foundDateStr, formatted: formattedStr! } : null)
        setSuggestedSlots(foundSlots)
        setSuggestedTime("") // Limpa qualquer horário antigo
        setConflictModalOpen(true)
        setLoading(false)
        return // Para a execução (Não salva)
      }

      // 3. SE ESTIVER TUDO LIVRE, SALVA O AGENDAMENTO NORMAL
      await registrarPedido(form.date, form.time)
      
    } catch (error) {
      alert("Ocorreu um erro ao verificar a disponibilidade.")
    } finally {
      setLoading(false)
    }
  }

  // Renderização do Passo 2 (Sucesso)
  if (step === 2) {
    const mensagem = `Olá, Helena Noivas! Gostaria de confirmar o meu agendamento de prova realizado no site. (Pedido #${orderId})`
    const numeroWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5522999990000"
    const whatsappUrl = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header onCartClick={() => {}} />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-border max-w-md w-full text-center flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-2"><CheckCircle2 size={40} /></div>
            <div>
              <h2 className="font-serif text-3xl text-foreground mb-3">Tudo Certo!</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                O seu agendamento <strong>#{orderId}</strong> foi registado com sucesso.
              </p>
            </div>
            <div className="w-full flex flex-col gap-3 mt-4">
              <Button asChild className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white font-semibold gap-2 py-6 text-base rounded-xl shadow-md">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle size={22} /> Confirme pelo WhatsApp</a>
              </Button>
              <Button variant="outline" onClick={() => router.push("/")} className="w-full py-6 text-base rounded-xl">Voltar ao catálogo</Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onCartClick={() => {}} />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        <div className="flex flex-col gap-6">
          <div>
            <button onClick={() => router.push("/")} className="text-sm text-muted-foreground flex items-center gap-2 hover:text-foreground mb-4"><ArrowLeft size={16} /> Continuar a ver vestidos</button>
            <h1 className="font-serif text-3xl text-foreground">Peças para Prova</h1>
          </div>

          <div className="flex flex-col gap-4">
            {items.length === 0 ? (
              <p className="text-muted-foreground bg-secondary/50 p-8 rounded-2xl text-center border border-dashed border-border">Nenhuma peça selecionada.</p>
            ) : (
              items.map(item => (
                <div key={item.id} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-border shadow-sm">
                  <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-secondary shrink-0">
                    <Image src={item.image || "/placeholder.jpg"} alt={item.name} fill className="object-cover object-top" />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <h3 className="font-semibold text-foreground leading-tight">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">Tamanho: {item.size} · SKU: {item.sku}</p>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-red-500 p-2 transition-colors"><Trash2 size={18} /></button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl border border-border shadow-sm h-fit">
          <h2 className="font-serif text-2xl text-foreground mb-6">Agendar Provador</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <Label className="text-xs mb-1.5 font-medium">Nome Completo *</Label>
              <Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-11 bg-secondary/20" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs mb-1.5 font-medium">WhatsApp *</Label>
                <Input required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="h-11 bg-secondary/20" />
              </div>
              <div>
                <Label className="text-xs mb-1.5 font-medium">E-mail</Label>
                <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="h-11 bg-secondary/20" />
              </div>
            </div>

            <div className="border-t border-border mt-2 pt-5">
              <Label className="text-xs mb-1.5 font-medium block text-primary">Data da Prova na Loja *</Label>
              <Input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="h-11 bg-secondary/20 w-full" />
            </div>

            <div className="border border-border p-4 rounded-xl bg-secondary/10 mt-2">
              <Label className="text-xs mb-3 block font-medium">Horário da Prova *</Label>
              
              {!form.date ? (
                <p className="text-sm text-muted-foreground italic">Selecione uma data de prova para ver os horários.</p>
              ) : dbError ? (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <AlertCircle size={18} />
                  <p className="text-sm font-medium">Erro ao carregar horários. Verifique o banco de dados.</p>
                </div>
              ) : availableSlots.length === 0 ? (
                <p className="text-sm text-red-500 font-medium">A loja encontra-se fechada nesta data.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {availableSlots.map(slot => (
                    <button
                      type="button"
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setForm(prev => ({ ...prev, time: slot.time }))}
                      className={`py-2 rounded-lg text-sm font-medium transition-all border ${
                        !slot.available 
                          ? "bg-muted text-muted-foreground border-border opacity-50 cursor-not-allowed line-through" 
                          : form.time === slot.time
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-white text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-border mt-2 pt-6">
              <Button type="submit" disabled={loading || items.length === 0 || !form.time || dbError} className="w-full h-14 text-base font-semibold rounded-xl">
                {loading ? "A verificar disponibilidade..." : "Confirmar Agendamento"}
              </Button>
            </div>
          </form>
        </div>
      </main>

      {/* ── MODAL / POP-UP DE SUGESTÃO DE DATA E HORÁRIOS ── */}
      <Dialog open={conflictModalOpen} onOpenChange={setConflictModalOpen}>
        <DialogContent className="max-w-md text-center p-8 rounded-3xl">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
            <CalendarClock size={36} strokeWidth={1.5} />
          </div>
          <DialogTitle className="text-2xl font-serif text-foreground mb-3">Data Indisponível</DialogTitle>
          <p className="text-muted-foreground leading-relaxed">
            Poxa, pelo menos um dos vestidos que escolheu não estará na loja no dia {form.date.split('-').reverse().join('/')}.
          </p>
          
          {suggestedDate ? (
            <div className="mt-5 text-left border border-border bg-secondary/10 p-5 rounded-2xl shadow-sm">
              <p className="text-sm text-foreground font-medium mb-4 text-center">
                Mas as peças estarão livres no <strong className="text-primary">{suggestedDate.formatted}</strong>!
              </p>
              
              <Label className="text-xs mb-3 block font-medium">Escolha um horário para este dia:</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {suggestedSlots.map(slot => (
                  <button
                    type="button"
                    key={slot.time}
                    disabled={!slot.available}
                    onClick={() => setSuggestedTime(slot.time)}
                    className={`py-2 rounded-lg text-sm font-medium transition-all border ${
                      !slot.available 
                        ? "bg-muted text-muted-foreground border-border opacity-50 cursor-not-allowed line-through" 
                        : suggestedTime === slot.time
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-white text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="block mt-4 text-foreground font-medium">
              Por favor, tente agendar para a próxima semana ou altere as peças da sacola.
            </p>
          )}
          
          <div className="flex flex-col gap-3 w-full mt-6">
            {suggestedDate && (
              <Button 
                onClick={async () => {
                  setIsSubmittingModal(true)
                  await registrarPedido(suggestedDate.dateStr, suggestedTime)
                  setIsSubmittingModal(false)
                }} 
                disabled={!suggestedTime || isSubmittingModal}
                className="w-full h-14 text-base font-semibold rounded-xl shadow-md"
              >
                {isSubmittingModal ? "A agendar..." : "Confirmar neste horário"}
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => setConflictModalOpen(false)} 
              className="w-full h-14 text-sm font-medium rounded-xl border-border hover:bg-secondary"
            >
              Não, vou escolher outros vestidos disponíveis
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}