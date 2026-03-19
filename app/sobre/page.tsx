"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Header } from "@/components/helena/header"
import { CartSidebar } from "@/components/helena/cart-sidebar"
import { MapPin, Phone, Mail, Clock, Instagram } from "lucide-react"

export default function SobrePage() {
  const [cartOpen, setCartOpen] = useState(false)
  const router = useRouter()

  const handleCheckout = () => {
    setCartOpen(false)
    router.push("/checkout")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Cabeçalho ── */}
      <Header onCartClick={() => setCartOpen(true)} />

      <main className="flex-1 w-full pb-20">
        
        {/* ── Hero Section (Capa) ── */}
        <section className="relative w-full h-[300px] md:h-[400px] bg-secondary/50 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image 
              src="/images/vestido-aurora.jpg" /* Podes trocar por uma foto da fachada da loja */
              alt="Helena Noivas Interior" 
              fill 
              className="object-cover object-center opacity-30 blur-[2px]" 
              priority
            />
          </div>
          <div className="relative z-10 text-center px-4">
            <p className="text-xs font-sans tracking-[0.3em] uppercase text-primary mb-3">Conheça a nossa essência</p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground">A Nossa História</h1>
          </div>
        </section>

        {/* ── Seção da História ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-lg">
              <Image 
                src="/images/hero-noiva.jpg" /* Podes trocar por uma foto da dona/equipe */
                alt="História Helena Noivas" 
                fill 
                className="object-cover object-top" 
              />
            </div>
            <div className="flex flex-col gap-6">
              <h2 className="font-serif text-3xl md:text-4xl text-foreground leading-snug">
                Vestindo sonhos <br/>
                <span className="text-primary italic font-light">desde o primeiro sim.</span>
              </h2>
              <div className="space-y-4 text-muted-foreground text-sm md:text-base leading-relaxed">
                <p>
                  A Helena Noivas nasceu do desejo de transformar a escolha do vestido de noiva num momento tão mágico e inesquecível quanto o próprio dia do casamento. Localizada no coração de Araruama, a nossa loja foi pensada para ser um refúgio de tranquilidade e beleza para as noivas da Região dos Lagos.
                </p>
                <p>
                  Sabemos que cada mulher é única e carrega consigo uma história de amor ímpar. Por isso, a nossa curadoria de vestidos é feita com extrema dedicação, procurando não apenas acompanhar as tendências, mas oferecer peças intemporais, com rendas exclusivas e caimentos perfeitos.
                </p>
                <p>
                  A nossa missão vai muito além de alugar um vestido. Queremos fazer parte da sua história, oferecendo um atendimento acolhedor, transparente e apaixonado. Aqui, o seu sonho é desenhado em cada detalhe.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Divisor ── */}
        <div className="flex items-center justify-center py-4">
          <div className="h-px w-16 bg-border" />
          <p className="mx-4 text-xs font-sans tracking-[0.3em] uppercase text-muted-foreground">Onde Estamos</p>
          <div className="h-px w-16 bg-border" />
        </div>

        {/* ── Seção de Contato e Mapa ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden flex flex-col lg:flex-row">
            
            {/* Informações de Contato */}
            <div className="w-full lg:w-1/3 p-8 md:p-12 bg-secondary/30 flex flex-col justify-center gap-8">
              <div>
                <h3 className="font-serif text-2xl text-foreground mb-6">Visite-nos</h3>
                <div className="flex flex-col gap-5">
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-1">Endereço</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        R. Bernardo Vasconcelos, 116 - Centro<br/>
                        Araruama - RJ, 28979-192
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-1">Telefone / WhatsApp</p>
                      <p className="text-sm text-muted-foreground">(22)98167-5166
          </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-1">Horário de Atendimento</p>
                      <p className="text-sm text-muted-foreground">Segunda a Sexta: 09h às 18h<br/>Sábado: 09h às 14h</p>
                    </div>
                  </div>

                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <a href="https://www.instagram.com/helenanoivasrj/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                  <Instagram size={18} /> @helenanoivasrj
                </a>
              </div>
            </div>

            {/* Mapa do Google (Iframe) */}
            <div className="w-full lg:w-2/3 min-h-[400px] lg:min-h-full bg-muted relative">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1426.168009476581!2d-42.3407323668705!3d-22.871880490004198!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x97695c91367e83%3A0x6e52b050ddd83121!2sAteli%C3%AA%20Helena%20Noivas!5e1!3m2!1spt-BR!2sbr!4v1773943177879!5m2!1spt-BR!2sbr"
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-secondary/30 py-10 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="font-serif text-lg tracking-widest text-foreground">
            HELENA<span className="text-primary font-light ml-1">NOIVAS</span>
          </span>
          <p className="text-xs text-muted-foreground leading-relaxed text-center md:text-right">
            Rio de Janeiro, RJ &nbsp;·&nbsp; @helenanoivasrj &nbsp;·&nbsp; (22)98167-5166
          </p>
        </div>
      </footer>

      {/* ── Sidebar do Carrinho ── */}
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={handleCheckout} />
    </div>
  )
}