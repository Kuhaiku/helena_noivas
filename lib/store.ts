import { create } from "zustand"
import { persist } from "zustand/middleware"

// Atualizamos a interface para receber os dados reais do MySQL
export interface Dress {
  id: string
  name: string
  sku: string
  size: string
  price: number
  image: string
  stock: string
}

interface CartStore {
  items: Dress[]
  addItem: (item: Dress) => void
  removeItem: (id: string) => void
  clearCart: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      
      addItem: (item) => set((state) => {
        // Evita adicionar o mesmo vestido duas vezes
        const alreadyInCart = state.items.some((i) => i.id === item.id)
        if (alreadyInCart) return state
        return { items: [...state.items, item] }
      }),
      
      // Agora espera receber um ID como argumento (o que resolve o teu erro 2554)
      removeItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id)
      })),
      
      // Função nova para limpar a sacola após o agendamento (resolve o erro 2339)
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "loja-cart-storage", // Nome genérico e invisível para o White Label
    }
  )
)