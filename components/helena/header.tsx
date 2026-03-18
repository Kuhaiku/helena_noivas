"use client"

import { ShoppingBag, Menu, X } from "lucide-react"
import { useCartStore } from "@/lib/store"
import { useState } from "react"

interface HeaderProps {
  onCartClick?: () => void
}

export function Header({ onCartClick }: HeaderProps) {
  const { items } = useCartStore()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Hambúrguer */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-foreground/70 hover:text-foreground transition-colors"
            aria-label="Abrir menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo centralizado */}
          <a href="/" className="absolute left-1/2 -translate-x-1/2">
            <span className="font-serif text-xl md:text-2xl tracking-widest text-foreground select-none">
              HELENA<span className="text-primary font-light ml-1">NOIVAS</span>
            </span>
          </a>

          {/* Sacola */}
          <button
            onClick={onCartClick}
            className="relative p-2 text-foreground/70 hover:text-foreground transition-colors"
            aria-label="Abrir sacola"
          >
            <ShoppingBag size={22} />
            {items.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {items.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <nav className="bg-background border-t border-border px-6 py-4 flex flex-col gap-4 text-sm font-sans tracking-widest uppercase text-foreground/70">
          <a href="/" className="hover:text-primary transition-colors" onClick={() => setMenuOpen(false)}>Coleção</a>
          <a href="#sobre" className="hover:text-primary transition-colors" onClick={() => setMenuOpen(false)}>Sobre Nós</a>
          <a href="#contato" className="hover:text-primary transition-colors" onClick={() => setMenuOpen(false)}>Contato</a>
        </nav>
      )}
    </header>
  )
}
