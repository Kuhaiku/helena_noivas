"use client"

import { useState } from "react"
import { Calendar, Sparkles, X, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface OnboardingModalProps {
  open: boolean
  onClose: () => void
  onChoice: (hasDate: boolean, weddingDate?: string) => void
}

const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]
const WEEKDAYS = ["D","S","T","Q","Q","S","S"]

function MiniCalendar({ onSelect }: { onSelect: (date: string) => void }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selected, setSelected] = useState<string>("")

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayStr = today.toISOString().split("T")[0]

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const handleDay = (day: number) => {
    const d = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    setSelected(d)
    onSelect(d)
  }

  const cells = Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} />)
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    const isPast = dateStr < todayStr
    const isSel = dateStr === selected
    cells.push(
      <button
        key={d}
        disabled={isPast}
        onClick={() => handleDay(d)}
        className={cn(
          "w-8 h-8 rounded-full text-xs flex items-center justify-center transition-all",
          isPast && "text-muted-foreground/40 cursor-not-allowed",
          !isPast && !isSel && "hover:bg-primary/10 text-foreground",
          isSel && "bg-primary text-primary-foreground font-semibold"
        )}
      >
        {d}
      </button>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1 rounded-full hover:bg-muted transition-colors">
          <ChevronLeft size={14} />
        </button>
        <p className="text-xs font-semibold text-foreground">
          {MONTHS[month]} {year}
        </p>
        <button onClick={nextMonth} className="p-1 rounded-full hover:bg-muted transition-colors">
          <ChevronRight size={14} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="text-[10px] text-center text-muted-foreground font-medium py-0.5">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells}
      </div>
    </div>
  )
}

export function OnboardingModal({ open, onClose, onChoice }: OnboardingModalProps) {
  const [step, setStep] = useState<"choice" | "calendar">("choice")
  const [weddingDate, setWeddingDate] = useState<string>("")

  const handleHasDate = () => setStep("calendar")
  const handleConfirmDate = () => {
    onChoice(true, weddingDate)
    setStep("choice")
    setWeddingDate("")
  }
  const handleNoDate = () => {
    onChoice(false)
  }
  const handleClose = () => {
    setStep("choice")
    setWeddingDate("")
    onClose()
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm transition-opacity duration-300 flex items-end sm:items-center justify-center p-4",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
      onClick={handleClose}
    >
      <div
        className={cn(
          "bg-background rounded-2xl w-full max-w-lg shadow-2xl transition-all duration-300 relative",
          open ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-1.5 text-muted-foreground hover:text-foreground transition-colors z-10"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        {step === "choice" && (
          <div className="p-8">
            <div className="text-center mb-8">
              <p className="text-xs font-sans tracking-[0.2em] uppercase text-primary mb-3">Bem-vinda</p>
              <h2 className="font-serif text-2xl md:text-3xl text-foreground text-balance leading-snug">
                Vamos encontrar o vestido perfeito para você
              </h2>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                Nos conte um pouco mais sobre você para personalizarmos a sua experiência.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleHasDate}
                className="group flex flex-col items-center gap-4 p-6 rounded-2xl border-2 border-border hover:border-primary bg-secondary/50 hover:bg-primary/5 transition-all duration-200 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Calendar size={22} className="text-primary" />
                </div>
                <div>
                  <p className="font-serif text-base text-foreground">Já tenho a data</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">do casamento definida</p>
                </div>
              </button>

              <button
                onClick={handleNoDate}
                className="group flex flex-col items-center gap-4 p-6 rounded-2xl border-2 border-border hover:border-primary bg-secondary/50 hover:bg-primary/5 transition-all duration-200 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Sparkles size={22} className="text-primary" />
                </div>
                <div>
                  <p className="font-serif text-base text-foreground">Ainda estou avaliando</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">as datas possíveis</p>
                </div>
              </button>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Você pode explorar o catálogo livremente em qualquer caso.
            </p>
          </div>
        )}

        {step === "calendar" && (
          <div className="p-8">
            <button
              onClick={() => setStep("choice")}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ChevronLeft size={14} /> Voltar
            </button>

            <div className="text-center mb-6">
              <p className="text-xs font-sans tracking-[0.2em] uppercase text-primary mb-2">Data do Casamento</p>
              <h2 className="font-serif text-2xl text-foreground text-balance leading-snug">
                Quando é o grande dia?
              </h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Isso nos ajuda a verificar a disponibilidade dos vestidos para a sua data.
              </p>
            </div>

            <div className="bg-secondary/50 rounded-xl p-5 mb-5">
              <MiniCalendar onSelect={setWeddingDate} />
            </div>

            {weddingDate && (
              <p className="text-center text-xs text-primary font-semibold mb-4">
                Data selecionada: {new Date(weddingDate + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
              </p>
            )}

            <button
              onClick={handleConfirmDate}
              disabled={!weddingDate}
              className={cn(
                "w-full py-3.5 rounded-xl font-sans font-semibold text-sm tracking-wide transition-all duration-200",
                weddingDate
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] shadow-sm"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              Confirmar Data e Ver Coleção
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
