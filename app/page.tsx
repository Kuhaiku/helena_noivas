"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowRight, ArrowLeft, Eye } from "lucide-react"
import { Header } from "@/components/helena/header"
import { DressCard } from "@/components/helena/dress-card"
import { CartSidebar } from "@/components/helena/cart-sidebar"
import { OnboardingModal } from "@/components/helena/onboarding-modal"
import { useAdminStore } from "@/lib/admin-store"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  { key: "todos", label: "Todos" },
  { key: "noiva", label: "Noiva" },
  { key: "debutante", label: "Debutante" },
  { key: "festa", label: "Festa" },
  { key: "acessorios", label: "Acessórios" },
]

const DRESSES = [
  {
    id: "aurora", name: "Aurora", size: "34 ao 44", price: "", image: "/images/vestido-aurora.jpg",
    category: "Noiva", collection: "Primavera 2026",
    description: "Linha A com renda francesa, cauda catedral e decote coração.",
    images: ["/images/vestido-aurora.jpg", "/images/vestido-aurora.jpg", "/images/vestido-aurora.jpg"],
  },
  {
    id: "isabela", name: "Isabela", size: "36 ao 46", price: "", image: "/images/vestido-isabela.jpg",
    category: "Noiva", collection: "Primavera 2026",
    description: "Sereia off-shoulder em crepe italiano com cauda longa.",
    images: ["/images/vestido-isabela.jpg", "/images/vestido-isabela.jpg"],
  },
  {
    id: "valentina", name: "Valentina", size: "34 ao 42", price: "", image: "/images/vestido-valentina.jpg",
    category: "Noiva", collection: "Verão 2025",
    description: "Ballgown com saia volumosa em tule camadas e corpete bordado.",
    images: ["/images/vestido-valentina.jpg", "/images/vestido-valentina.jpg"],
  },
  {
    id: "sofia", name: "Sofia", size: "36 ao 44", price: "", image: "/images/vestido-sofia.jpg",
    category: "Festa", collection: "Cápsula 2025",
    description: "Vestido midi em satin drapeado com decote V. Estilo contemporâneo.",
    images: ["/images/vestido-sofia.jpg"],
  },
  {
    id: "luna", name: "Luna", size: "34 ao 46", price: "", image: "/images/vestido-luna.jpg",
    category: "Noiva", collection: "Primavera 2026",
    description: "Boho-chic com renda floral total e manga longa em sino.",
    images: ["/images/vestido-luna.jpg", "/images/vestido-luna.jpg"],
  },
  {
    id: "bianca", name: "Bianca", size: "36 ao 42", price: "", image: "/images/vestido-bianca.jpg",
    category: "Noiva", collection: "Verão 2025",
    description: "Minimalista linha reta em satin puro com costas abertas.",
    images: ["/images/vestido-bianca.jpg"],
  },
]

export default function VitrinePage() {
  const [onboardingOpen, setOnboardingOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState("todos")
  const [weddingDate, setWeddingDate] = useState<string | null>(null)
  const [seasonalIdx, setSeasonalIdx] = useState(0)
  const router = useRouter()

  const { collections, products } = useAdminStore()

  // Coleção sazonal ativa
  const activeCollection = collections.find((c) => c.active) ?? null
  const seasonalProducts = activeCollection
    ? products.filter((p) => activeCollection.productIds.includes(p.id) && !p.hidden)
    : []

  useEffect(() => {
    const seen = sessionStorage.getItem("helena-onboarding")
    if (!seen) {
      const timer = setTimeout(() => setOnboardingOpen(true), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleOnboardingChoice = (hasDate: boolean, date?: string) => {
    sessionStorage.setItem("helena-onboarding", "done")
    if (hasDate && date) setWeddingDate(date)
    setOnboardingOpen(false)
  }

  const handleCheckout = () => {
    setCartOpen(false)
    router.push("/checkout")
  }

  // Vitrine: apenas peças visíveis (não ocultas)
  const visibleDresses = DRESSES.filter((d) => {
    const product = products.find((p) => p.id === d.id || p.name.toLowerCase() === d.name.toLowerCase())
    return !product?.hidden
  })

  const filtered =
    activeCategory === "todos"
      ? visibleDresses
      : visibleDresses.filter((d) => d.category.toLowerCase() === activeCategory)

  return (
    <div className="min-h-screen bg-background">
      <Header onCartClick={() => setCartOpen(true)} />

      {/* ── Hero (sempre visível) ─────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden bg-secondary/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-center min-h-[480px] md:min-h-[560px]">
            <div className="py-16 md:py-20 flex flex-col items-start gap-6 order-2 md:order-1">
              <p className="text-xs font-sans tracking-[0.25em] uppercase text-primary">
                Coleção Exclusiva
              </p>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.15] text-balance">
                Encontre o vestido dos seus sonhos
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed max-w-sm">
                Escolha online, experimente pessoalmente. Nossa equipe de consultoras estará pronta para te receber.
              </p>
              {weddingDate && (
                <p className="text-xs bg-primary/10 text-primary px-4 py-2 rounded-full font-medium">
                  Casamento em {new Date(weddingDate + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                </p>
              )}
            </div>
            <div className="relative h-72 md:h-full md:min-h-[560px] order-1 md:order-2">
              <Image
                src="/images/hero-noiva.jpg"
                alt="Noiva em vestido elegante"
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-secondary/20 md:bg-gradient-to-l md:from-transparent md:to-secondary/30" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Destaque Sazonal (logo abaixo do hero, quando há coleção ativa) ──── */}
      {activeCollection && seasonalProducts.length > 0 && (
        <section className="w-full bg-secondary/60 border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-xs font-sans tracking-[0.25em] uppercase text-primary mb-2">
                  Coleção em Destaque
                </p>
                <h2 className="font-serif text-3xl md:text-4xl text-foreground leading-[1.15] text-balance">
                  {activeCollection.name}
                </h2>
                {activeCollection.description && (
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed mt-3 max-w-lg">
                    {activeCollection.description}
                  </p>
                )}
              </div>
              <p className="text-xs text-muted-foreground shrink-0">
                {seasonalProducts.length} peça{seasonalProducts.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-none">
              {seasonalProducts.map((product) => {
                const dress = {
                  id: product.id,
                  name: product.name,
                  size: product.size,
                  price: product.showPrice && product.rentalPrice > 0
                    ? `R$ ${product.rentalPrice.toLocaleString("pt-BR")}`
                    : "",
                  image: product.images[0] ?? "/images/vestido-aurora.jpg",
                  images: product.images,
                  category: product.category,
                  collection: product.collection,
                  description: product.description,
                }
                return (
                  <div key={product.id} className="snap-start shrink-0 w-[220px] sm:w-[260px]">
                    <DressCard dress={dress} />
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Separador */}
      <div className="flex items-center justify-center py-10">
        <div className="h-px w-16 bg-border" />
        <p className="mx-4 text-xs font-sans tracking-[0.3em] uppercase text-muted-foreground">
          Catálogo Completo
        </p>
        <div className="h-px w-16 bg-border" />
      </div>

      {/* Filtros de categoria */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={cn(
                "px-5 py-2 rounded-full text-xs font-sans font-semibold tracking-wide transition-all duration-200 border",
                activeCategory === cat.key
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              )}
            >
              {cat.label}
              {cat.key !== "todos" && (
                <span className="ml-1.5 text-[10px] opacity-70">
                  ({visibleDresses.filter((d) => d.category.toLowerCase() === cat.key).length})
                </span>
              )}
            </button>
          ))}
          <span className="ml-auto text-xs text-muted-foreground hidden sm:block">
            {filtered.length} {filtered.length === 1 ? "peça" : "peças"}
          </span>
        </div>
      </section>

      {/* Grid de vestidos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
            {filtered.map((dress) => (
              <DressCard key={dress.id} dress={dress} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <p className="font-serif text-xl text-foreground">Nenhuma peça nesta categoria</p>
            <p className="text-sm text-muted-foreground">Em breve novidades nesta linha.</p>
            <button onClick={() => setActiveCategory("todos")} className="text-xs text-primary underline underline-offset-4 mt-2">
              Ver todas as peças
            </button>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground mt-12 leading-relaxed max-w-md mx-auto">
          Clique na foto para ver a galeria completa. Toque no{" "}
          <span className="text-primary font-semibold">+</span> para adicionar à sacola e agendar sua prova presencial.
        </p>
      </section>

      {/* Footer */}
      <footer id="contato" className="border-t border-border bg-secondary/30 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="font-serif text-lg tracking-widest text-foreground">
            HELENA<span className="text-primary font-light ml-1">NOIVAS</span>
          </span>
          <p className="text-xs text-muted-foreground leading-relaxed text-center md:text-right">
            Rio de Janeiro, RJ &nbsp;·&nbsp; @helenanoivasrj &nbsp;·&nbsp; (21) 99999-0000
          </p>
        </div>
      </footer>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={handleCheckout} />

      <OnboardingModal
        open={onboardingOpen}
        onClose={() => {
          sessionStorage.setItem("helena-onboarding", "done")
          setOnboardingOpen(false)
        }}
        onChoice={handleOnboardingChoice}
      />
    </div>
  )
}
