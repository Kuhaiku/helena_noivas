"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/helena/header"
import { DressCard } from "@/components/helena/dress-card"
import { CartSidebar } from "@/components/helena/cart-sidebar"
import { useAdminStore } from "@/lib/admin-store"

export default function ColecoesPage() {
  const [cartOpen, setCartOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const { collections, setCollections, products, setProducts } = useAdminStore()

  // Puxa as coleções e produtos do Banco de Dados ao carregar a página
  useEffect(() => {
    async function fetchData() {
      try {
        const [resProd, resCol] = await Promise.all([
          fetch('/api/produtos'),
          fetch('/api/colecoes')
        ])

        if (resProd.ok) setProducts(await resProd.json())
        if (resCol.ok) setCollections(await resCol.json())
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [setProducts, setCollections])

  const handleCheckout = () => {
    setCartOpen(false)
    router.push("/checkout")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onCartClick={() => setCartOpen(true)} />

      <main className="flex-1 py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* ── Cabeçalho da Página ── */}
        <div className="text-center mb-16">
          <p className="text-xs font-sans tracking-[0.25em] uppercase text-primary mb-3">Nossas Linhas</p>
          <h1 className="font-serif text-4xl md:text-5xl text-foreground">Todas as Coleções</h1>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Explore as nossas coleções sazonais e temáticas. Cada peça foi cuidadosamente selecionada para tornar o seu momento inesquecível.
          </p>
        </div>

        {/* ── Área de Carregamento e Listagem ── */}
        {loading ? (
          <div className="flex justify-center items-center py-20 text-muted-foreground text-sm">
            A carregar as nossas coleções exclusivas...
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-20 bg-secondary/30 rounded-2xl border border-dashed border-border">
            <p className="text-muted-foreground">Nenhuma coleção cadastrada no momento.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-24">
            {collections.map((colecao) => {
              // Proteção garantida para ler os IDs dos produtos
              let ids = colecao.productIds || []
              if (typeof ids === 'string') {
                try { ids = JSON.parse(ids) } catch (e) { ids = [] }
              }

              // Filtra os produtos que pertencem a esta coleção e não estão ocultos
              const pecasDaColecao = products.filter(p => Array.isArray(ids) && ids.includes(p.id) && !p.hidden)

              // Se a coleção estiver vazia, não a desenha na tela
              if (pecasDaColecao.length === 0) return null

              return (
                <section key={colecao.id} className="flex flex-col gap-8">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4">
                    <div>
                      <h2 className="font-serif text-2xl md:text-3xl text-foreground">{colecao.name}</h2>
                      {colecao.description && (
                        <p className="text-muted-foreground mt-2 max-w-3xl">{colecao.description}</p>
                      )}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest shrink-0">
                      {pecasDaColecao.length} peça{pecasDaColecao.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {pecasDaColecao.map(dress => (
                      <DressCard key={dress.id} dress={dress} />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-border bg-secondary/30 py-10 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="font-serif text-lg tracking-widest text-foreground uppercase">
            {/* Puxa o nome e divide-o pelo espaço em branco */}
            {(process.env.NEXT_PUBLIC_STORE_NAME || "").split(" ")[0]}
            <span className="text-primary font-light ml-1">
              {(process.env.NEXT_PUBLIC_STORE_NAME || "").split(" ").slice(1).join(" ")}
            </span>
          </span>
          <p className="text-xs text-muted-foreground leading-relaxed text-center md:text-right">
            {process.env.NEXT_PUBLIC_STORE_LOCATION} &nbsp;·&nbsp; {process.env.NEXT_PUBLIC_STORE_INSTAGRAM}
          </p>
        </div>
      </footer>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={handleCheckout} />
    </div>
  )
}