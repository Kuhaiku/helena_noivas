"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, ShoppingBag, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCartStore, type Dress } from "@/lib/store"

interface DressGalleryProps {
  dress: Dress
  open: boolean
  onClose: () => void
}

export function DressGallery({ dress, open, onClose }: DressGalleryProps) {
  const { addItem, removeItem, items } = useCartStore()
  const inCart = items.some((i) => i.id === dress.id)
  const [activeIdx, setActiveIdx] = useState(0)

  // For now use a single image repeated to simulate a gallery
  const photos = dress.images && dress.images.length > 0
    ? dress.images
    : [dress.image, dress.image, dress.image]

  useEffect(() => {
    if (!open) return
    setActiveIdx(0)
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") setActiveIdx(i => Math.min(i + 1, photos.length - 1))
      if (e.key === "ArrowLeft") setActiveIdx(i => Math.max(i - 1, 0))
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [open, photos.length, onClose])

  const toggle = () => {
    if (inCart) removeItem(dress.id)
    else addItem(dress)
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm transition-opacity duration-300 flex items-center justify-center p-4",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          "bg-background rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden transition-all duration-300",
          open ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col md:flex-row">
          {/* Main image */}
          <div className="relative flex-1 min-h-[320px] md:min-h-[480px] bg-secondary">
            <Image
              src={photos[activeIdx]}
              alt={`${dress.name} — foto ${activeIdx + 1}`}
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 60vw"
            />

            {/* Nav arrows */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setActiveIdx(i => Math.max(i - 1, 0))}
                  disabled={activeIdx === 0}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow transition-all hover:bg-background disabled:opacity-30"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setActiveIdx(i => Math.min(i + 1, photos.length - 1))}
                  disabled={activeIdx === photos.length - 1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow transition-all hover:bg-background disabled:opacity-30"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            {/* Photo counter */}
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/70 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-foreground">
              {activeIdx + 1} / {photos.length}
            </span>

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow hover:bg-background transition-all"
              aria-label="Fechar galeria"
            >
              <X size={16} />
            </button>
          </div>

          {/* Info panel */}
          <div className="w-full md:w-64 flex flex-col p-6 gap-5 justify-between">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-sans tracking-[0.2em] uppercase text-primary mb-1">
                  {dress.category ?? "Noiva"}
                </p>
                <h2 className="font-serif text-2xl text-foreground leading-snug">{dress.name}</h2>
              </div>

              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">Tamanhos</span>
                  <span className="font-medium text-foreground">{dress.size}</span>
                </div>
                {dress.collection && (
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground text-xs uppercase tracking-wide">Coleção</span>
                    <span className="font-medium text-foreground">{dress.collection}</span>
                  </div>
                )}
                {dress.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed pt-1">{dress.description}</p>
                )}
              </div>

              {/* Thumbnails */}
              {photos.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {photos.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIdx(i)}
                      className={cn(
                        "relative w-14 h-16 rounded-lg overflow-hidden border-2 transition-all",
                        activeIdx === i ? "border-primary" : "border-transparent hover:border-border"
                      )}
                    >
                      <Image src={src} alt={`Foto ${i + 1}`} fill className="object-cover object-top" sizes="56px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={toggle}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-sans font-semibold text-sm tracking-wide transition-all duration-200 active:scale-[0.98]",
                inCart
                  ? "bg-foreground text-background hover:bg-foreground/90"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              )}
            >
              {inCart ? <Check size={16} strokeWidth={2.5} /> : <ShoppingBag size={16} />}
              {inCart ? "Adicionado à sacola" : "Adicionar à sacola"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
