"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Trash2, ShieldCheck, ChevronLeft, Calendar, Clock, User, Smartphone, MessageCircle } from "lucide-react"
import { Header } from "@/components/helena/header"
import { useCartStore } from "@/lib/store"

const TIME_SLOTS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"]

export default function CheckoutPage() {
  const { items, removeItem } = useCartStore()
  const router = useRouter()

  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    date: "",
    time: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const isValid =
    form.name.trim().length > 2 &&
    form.whatsapp.trim().length >= 10 &&
    form.date &&
    form.time &&
    items.length > 0

  const buildWhatsAppMessage = () => {
    const dressList = items.map((d) => `• ${d.name} (Tam. ${d.size})`).join("\n")
    return encodeURIComponent(
      `Olá, Helena Noivas! 💐\n\nMeu nome é ${form.name} e gostaria de agendar minha prova.\n\n*Vestidos escolhidos:*\n${dressList}\n\n*Data pretendida:* ${form.date}\n*Horário:* ${form.time}\n\n*WhatsApp:* ${form.whatsapp}\n\nAguardo confirmação. Obrigada!`
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    const msg = buildWhatsAppMessage()
    window.open(`https://wa.me/5521999990000?text=${msg}`, "_blank")
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header onCartClick={() => router.push("/")} />
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageCircle size={30} className="text-primary" />
          </div>
          <h2 className="font-serif text-3xl text-foreground">Agendamento enviado!</h2>
          <p className="text-muted-foreground max-w-sm leading-relaxed">
            Sua mensagem foi encaminhada para o WhatsApp da Helena Noivas. Uma consultora entrará em contato em breve para confirmar.
          </p>
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm font-sans text-primary hover:underline mt-2"
          >
            <ChevronLeft size={16} /> Voltar à coleção
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onCartClick={() => {}} />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wide"
        >
          <ChevronLeft size={14} /> Voltar à coleção
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="mb-10">
          <p className="text-xs font-sans tracking-[0.25em] uppercase text-primary mb-2">Etapa final</p>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground">Sua Sacola & Agendamento</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Lado esquerdo — vestidos selecionados */}
          <section aria-label="Vestidos selecionados">
            <h2 className="font-serif text-xl text-foreground mb-5">
              {items.length === 0 ? "Nenhum vestido selecionado" : `${items.length} ${items.length === 1 ? "vestido selecionado" : "vestidos selecionados"}`}
            </h2>

            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border-2 border-dashed border-border text-center">
                <p className="font-serif text-lg text-foreground/50">Sua sacola está vazia</p>
                <button onClick={() => router.push("/")} className="text-sm text-primary hover:underline">
                  Explorar coleção
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {items.map((dress) => (
                  <div key={dress.id} className="flex items-center gap-5 p-4 rounded-2xl bg-card border border-border shadow-sm">
                    <div className="relative w-20 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-secondary">
                      <Image
                        src={dress.image}
                        alt={dress.name}
                        fill
                        className="object-cover object-top"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-lg text-foreground">{dress.name}</p>
                      <p className="text-xs text-muted-foreground tracking-widest uppercase mt-1">
                        Tamanho {dress.size}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(dress.id)}
                      className="p-2 text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                      aria-label={`Remover ${dress.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Lado direito — formulário de agendamento (sticky no desktop) */}
          <section aria-label="Agendar prova" className="lg:sticky lg:top-28">
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="font-serif text-xl text-foreground mb-6">Agendar Prova na Loja</h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Nome */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-xs font-sans font-medium tracking-widest uppercase text-muted-foreground">
                    Seu nome
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="name"
                      type="text"
                      placeholder="Nome completo"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      required
                      className="w-full bg-secondary/60 border border-input rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="whatsapp" className="text-xs font-sans font-medium tracking-widest uppercase text-muted-foreground">
                    WhatsApp
                  </label>
                  <div className="relative">
                    <Smartphone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="whatsapp"
                      type="tel"
                      placeholder="(21) 99999-9999"
                      value={form.whatsapp}
                      onChange={(e) => handleChange("whatsapp", e.target.value)}
                      required
                      className="w-full bg-secondary/60 border border-input rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {/* Data */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="date" className="text-xs font-sans font-medium tracking-widest uppercase text-muted-foreground">
                    Data da prova
                  </label>
                  <div className="relative">
                    <Calendar size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <input
                      id="date"
                      type="date"
                      value={form.date}
                      onChange={(e) => handleChange("date", e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      required
                      className="w-full bg-secondary/60 border border-input rounded-xl pl-10 pr-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {/* Horário */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-sans font-medium tracking-widest uppercase text-muted-foreground flex items-center gap-1.5">
                    <Clock size={12} /> Horário preferido
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => handleChange("time", slot)}
                        className={`px-4 py-2 rounded-xl text-sm font-sans border transition-all duration-150 ${
                          form.time === slot
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-secondary/60 text-foreground border-border hover:border-primary/50"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <button
                  type="submit"
                  disabled={!isValid}
                  className="w-full mt-2 bg-primary text-primary-foreground font-sans font-semibold text-sm tracking-wide py-4 rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} />
                  Agendar Prova via WhatsApp
                </button>

                {/* Aviso de confiança */}
                <div className="flex items-start gap-2.5 p-4 rounded-xl bg-secondary/50 border border-border">
                  <ShieldCheck size={16} className="text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Sua prova será <strong className="text-foreground font-medium">presencial em nossa loja</strong>. A disponibilidade exata para o seu evento será confirmada pelas nossas consultoras.
                  </p>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
