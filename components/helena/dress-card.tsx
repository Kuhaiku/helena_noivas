"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus, Check, Expand } from "lucide-react"
import { useCartStore, type Dress } from "@/lib/store"
import { DressGallery } from "@/components/helena/dress-gallery"
import { cn } from "@/lib/utils"

interface DressCardProps {
  dress: Dress
}

export function DressCard({ dress }: DressCardProps) {
  const { addItem, removeItem, items } = useCartStore()
  const inCart = items.some((i) => i.id === dress.id)
  const [galleryOpen, setGalleryOpen] = useState(false)

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (inCart) removeItem(dress.id)
    else addItem(dress)
  }

  return (
    <>
      <article className="group relative bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        {/* Imagem do vestido */}
        <button
          className="relative w-full aspect-[3/4] overflow-hidden bg-secondary block cursor-zoom-in"
          onClick={() => setGalleryOpen(true)}
          aria-label={`Ver galeria de fotos de ${dress.name}`}
        >
          <Image
            src={dress.image}
            alt={`Vestido ${dress.name}`}
            fill
            className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {/* Expand hint */}
          <span className="absolute top-3 right-3 w-7 h-7 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Expand size={13} className="text-foreground" />
          </span>
        </button>

        {/* Info do vestido */}
        <div className="relative px-4 pt-3 pb-4">
          {dress.category && (
            <p className="text-[10px] font-sans tracking-[0.2em] uppercase text-primary mb-0.5">{dress.category}</p>
          )}
          <h3 className="font-serif text-base md:text-lg text-foreground text-balance leading-snug">
            {dress.name}
          </h3>
          <p className="text-muted-foreground text-xs tracking-widest uppercase mt-0.5">
            Tamanho {dress.size}
          </p>

          {/* Botão circular de adicionar */}
          <button
            onClick={toggle}
            aria-label={inCart ? "Remover da sacola" : "Adicionar à sacola"}
            className={cn(
              "absolute bottom-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm",
              inCart
                ? "bg-foreground text-background"
                : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95"
            )}
          >
            {inCart ? <Check size={16} strokeWidth={2.5} /> : <Plus size={18} strokeWidth={2.5} />}
          </button>
        </div>
      </article>

      <DressGallery dress={dress} open={galleryOpen} onClose={() => setGalleryOpen(false)} />
    </>
  )
}
