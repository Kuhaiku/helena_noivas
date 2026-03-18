"use client"

import { useState, useEffect } from "react"
import { DressCard } from "@/components/helena/dress-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Product } from "@/lib/admin-store"

export function DressGallery() {
  const [produtos, setProdutos] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<string>("todos")

  useEffect(() => {
    async function carregarVitrine() {
      try {
        const res = await fetch('/api/produtos')
        const data = await res.json()
        
        if (Array.isArray(data)) {
          // Filtramos para mostrar APENAS os que não estão marcados como ocultos
          const visiveis = data.filter((p: Product) => !p.hidden)
          setProdutos(visiveis)
        }
      } catch (error) {
        console.error("Erro ao carregar os vestidos da vitrine:", error)
      } finally {
        setLoading(false)
      }
    }
    carregarVitrine()
  }, [])

  // Aplica o filtro da categoria (Noiva, Festa, Debutante...)
  const filtrados = filtro === "todos" 
    ? produtos 
    : produtos.filter(p => p.category === filtro)

  return (
    <section id="colecao" className="w-full py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Cabeçalho da Seção */}
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-foreground">A Nossa Coleção</h2>
          <p className="text-muted-foreground max-w-[700px]">
            Descubra vestidos exclusivos para o seu momento inesquecível. Agende a sua prova e encontre o ajuste perfeito.
          </p>
        </div>

        {/* Botões de Filtro */}
        <div className="flex justify-center gap-2 sm:gap-4 mb-12 overflow-x-auto pb-2 scrollbar-hide">
          {['todos', 'noiva', 'festa', 'debutante', 'acessorios'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFiltro(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                filtro === cat 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              {cat === 'todos' ? 'Todos os Modelos' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Grade de Vestidos */}
        {loading ? (
          // Efeito visual de carregamento (Skeletons)
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[450px] w-full rounded-xl bg-secondary/60" />
                <Skeleton className="h-5 w-3/4 bg-secondary/60" />
                <Skeleton className="h-4 w-1/2 bg-secondary/60" />
              </div>
            ))}
          </div>
        ) : filtrados.length === 0 ? (
          // Mensagem de vazio
          <div className="text-center py-20 bg-secondary/30 rounded-2xl border border-dashed border-border">
            <p className="text-muted-foreground">Nenhum vestido encontrado nesta categoria.</p>
          </div>
        ) : (
          // Renderiza os cartões reais
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtrados.map((produto) => (
              <DressCard key={produto.id} dress={produto} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}