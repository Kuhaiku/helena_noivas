"use client"

import { X, Trash2, ShoppingBag } from "lucide-react"
import Image from "next/image"
import { useCartStore } from "@/lib/store"
import { cn } from "@/lib/utils"

interface CartSidebarProps {
  open: boolean
  onClose: () => void
  onCheckout: () => void
}

export function CartSidebar({ open, onClose, onCheckout }: CartSidebarProps) {
  const { items, removeItem } = useCartStore()

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Painel lateral */}
      <aside
        className={cn(
          "fixed right-0 top-0 h-full w-full max-w-sm z-50 bg-background shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
        aria-label="Sacola de vestidos"
      >
        {/* Header do sidebar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-primary" />
            <span className="font-serif text-lg text-foreground">Minha Sacola</span>
          </div>
          <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors" aria-label="Fechar sacola">
            <X size={20} />
          </button>
        </div>

        {/* Lista de itens */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <ShoppingBag size={40} className="text-border" />
              <p className="font-serif text-lg text-foreground/60">Sua sacola está vazia</p>
              <p className="text-sm text-muted-foreground leading-relaxed">Adicione vestidos que deseja experimentar na loja.</p>
            </div>
          ) : (
            items.map((dress) => (
              <div key={dress.id} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/60">
                <div className="relative w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                  <Image src={dress.image} alt={dress.name} fill className="object-cover object-top" sizes="64px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-sm text-foreground truncate">{dress.name}</p>
                  <p className="text-xs text-muted-foreground tracking-widest uppercase mt-0.5">Tam. {dress.size}</p>
                </div>
                <button
                  onClick={() => removeItem(dress.id)}
                  className="p-1.5 text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                  aria-label={`Remover ${dress.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* CTA agendar */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-border">
            <button
              onClick={onCheckout}
              className="w-full bg-primary text-primary-foreground font-sans font-semibold text-sm tracking-wide py-4 rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 shadow-sm"
            >
              Agendar Prova na Loja
            </button>
            <p className="text-center text-xs text-muted-foreground mt-3 leading-relaxed">
              {items.length} {items.length === 1 ? "vestido selecionado" : "vestidos selecionados"}
            </p>
          </div>
        )}
      </aside>
    </>
  )
}
