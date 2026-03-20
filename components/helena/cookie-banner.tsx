"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Verifica se a pessoa já aceitou no passado
    const aceitou = localStorage.getItem("lgpd_cookies_aceites")
    if (!aceitou) setShow(true)
  }, [])

  const aceitarCookies = () => {
    localStorage.setItem("lgpd_cookies_aceites", "true")
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.05)] p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-full duration-500">
      <div className="text-sm text-muted-foreground max-w-4xl text-center md:text-left">
        <p className="font-semibold text-foreground mb-1">Aviso de Privacidade e Cookies</p>
        Utilizamos cookies e tecnologias semelhantes para melhorar a sua experiência de navegação, personalizar o seu atendimento e analisar o nosso tráfego. Ao continuar a utilizar o nosso site, concorda com a nossa Política de Privacidade.
      </div>
      <div className="flex shrink-0 gap-3 w-full md:w-auto">
        <Button onClick={aceitarCookies} className="w-full md:w-auto h-11 px-8 font-semibold shadow-sm">Aceitar e Continuar</Button>
      </div>
    </div>
  )
}