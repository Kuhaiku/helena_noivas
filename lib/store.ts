"use client"

import { create } from "zustand"

export interface Dress {
  id: string
  name: string
  size: string
  price: string
  image: string
  images?: string[]
  category?: string
  collection?: string
  description?: string
}

interface CartStore {
  items: Dress[]
  isCartOpen: boolean
  addItem: (dress: Dress) => void
  removeItem: (id: string) => void
  setCartOpen: (open: boolean) => void
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  isCartOpen: false,
  addItem: (dress) =>
    set((state) => {
      if (state.items.find((i) => i.id === dress.id)) return state
      return { items: [...state.items, dress] }
    }),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  setCartOpen: (open) => set({ isCartOpen: open }),
}))
