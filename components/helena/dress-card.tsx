"use client"

import { useState } from "react"
import Image from "next/image"
import type { Product } from "@/lib/admin-store"
import { DressGallery } from "@/components/helena/dress-gallery"

interface DressCardProps {
  dress: Product
}

export function DressCard({ dress }: DressCardProps) {
  const [galleryOpen, setGalleryOpen] = useState(false)

  // Pega a primeira imagem ou fallback
  const coverImage = dress.images && dress.images.length > 0 
    ? dress.images[0] 
    : "/images/vestido-aurora.jpg"

  return (
    <>
      <div 
        onClick={() => setGalleryOpen(true)}
        className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-all hover:shadow-md cursor-pointer h-full"
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary/50">
          <Image
            src={coverImage}
            alt={dress.name}
            fill
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {dress.featured && (
            <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">
              Destaque
            </span>
          )}
        </div>
        
        <div className="p-4 flex flex-col flex-grow justify-between gap-3">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-primary mb-1.5">
              {dress.category}
            </p>
            <h3 className="font-serif text-lg font-medium text-foreground leading-tight line-clamp-2">
              {dress.name}
            </h3>
          </div>
          
          <div className="flex justify-between items-end pt-3 border-t border-border/50 mt-auto">
            <div className="flex flex-col">
              {/* <span className="text-xs text-muted-foreground mb-0.5">Tamanho {dress.size}</span> */}
              {dress.showPrice ? (
                <span className="font-medium text-foreground">
                  R$ {(dress.rentalPrice || 0).toLocaleString('pt-BR')}
                </span>
              ) : (
                <span className="text-[11px] text-muted-foreground italic font-medium">
                  Preço sob consulta
                </span>
              )}
            </div>
            
            <button className="text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-md">
              Ver Detalhes
            </button>
          </div>
        </div>
      </div>

      {/* Renderiza o modal (invisível até ser clicado) */}
      <DressGallery 
        dress={dress} 
        open={galleryOpen} 
        onClose={() => setGalleryOpen(false)} 
      />
    </>
  )
}