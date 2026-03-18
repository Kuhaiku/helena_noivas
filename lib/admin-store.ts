"use client"

import { create } from "zustand"

export type OrderStatus = "pendente" | "confirmado" | "compareceu" | "cancelado" | "novo"
export type StockStatus = "livre" | "alugado" | "manutencao"
export type ProductCategory = "noiva" | "debutante" | "festa" | "acessorios"
export type ProductCondition = "nova" | "usada" | "outros"

export interface DressItem {
  id: string
  name: string
  sku: string
  size: string
  price: number
  image: string
  stock: StockStatus
  note?: string
  discount?: number
}

export interface Product {
  id: string
  name: string
  description: string
  category: ProductCategory
  collection: string
  sku: string
  size: string
  color: string
  condition: ProductCondition
  stock: StockStatus
  rentalPrice: number
  salePrice?: number
  showPrice: boolean
  featured: boolean
  hidden: boolean
  images: string[]
  maintenanceNotes: string
  customWindowBefore?: number
  customWindowAfter?: number
  createdAt: string
}

export interface Order {
  id: string
  clientName: string
  clientPhone: string
  clientEmail: string
  provaDate: string
  provaTime: string
  status: OrderStatus
  items: DressItem[]
  signalPaid?: number
  totalValue?: number
  discountTotal?: number
  quitDate?: string
  cautionValue?: number
  notes?: string
  createdAt: string
}

export interface SeasonalCollection {
  id: string
  name: string
  description: string
  productIds: string[]
  active: boolean
  createdAt: string
}

// ─── DADOS LIMPOS (Sem produtos ou pedidos falsos) ────────────────────────
const DRESS_CATALOG: DressItem[] = []
const PRODUCT_CATALOG: Product[] = []
const MOCK_ORDERS: Order[] = []
const SEED_COLLECTIONS: SeasonalCollection[] = []

export type AdminSection = "dashboard" | "pedidos" | "estoque" | "cadastro" | "colecoes" | "configuracoes" | "horarios"

interface AdminStore {
  section: AdminSection
  setSection: (s: AdminSection) => void

  orders: Order[]
  setOrders: (orders: Order[]) => void
  
  catalog: DressItem[]
  
  products: Product[]
  setProducts: (products: Product[]) => void // <--- Adicionado
  
  collections: SeasonalCollection[]

  selectedOrder: Order | null
  setSelectedOrder: (o: Order | null) => void

  isOrderModalOpen: boolean
  setOrderModalOpen: (v: boolean) => void

  isFinancialModalOpen: boolean
  setFinancialModalOpen: (v: boolean) => void

  isNewOrderModalOpen: boolean
  setNewOrderModalOpen: (v: boolean) => void

  updateOrderStatus: (id: string, status: OrderStatus) => void
  updateOrderItems: (id: string, items: DressItem[]) => void
  updateOrderFinancial: (id: string, data: Partial<Order>) => void
  overrideStockStatus: (dressId: string, status: StockStatus) => void
  addOrder: (order: Order) => void
  addProduct: (product: Product) => void
  updateProduct: (id: string, data: Partial<Product>) => void
  toggleProductHidden: (id: string) => void

  addCollection: (c: SeasonalCollection) => void
  updateCollection: (id: string, data: Partial<SeasonalCollection>) => void
  deleteCollection: (id: string) => void
  setActiveCollection: (id: string) => void

  storeConfig: { windowBefore: number; windowAfter: number; provadores: number }
  setStoreConfig: (c: Partial<AdminStore["storeConfig"]>) => void

  filterStatus: OrderStatus | "todos"
  setFilterStatus: (s: OrderStatus | "todos") => void
  filterDate: string
  setFilterDate: (d: string) => void
}

export const useAdminStore = create<AdminStore>((set) => ({
  section: "dashboard",
  setSection: (section) => set({ section }),

  orders: MOCK_ORDERS,
  setOrders: (orders) => set({ orders }),

  catalog: DRESS_CATALOG,
  
  products: PRODUCT_CATALOG,
  setProducts: (products) => set({ products }), // <--- Adicionado

  collections: SEED_COLLECTIONS,

  selectedOrder: null,
  setSelectedOrder: (selectedOrder) => set({ selectedOrder }),

  isOrderModalOpen: false,
  setOrderModalOpen: (isOrderModalOpen) => set({ isOrderModalOpen }),

  isFinancialModalOpen: false,
  setFinancialModalOpen: (isFinancialModalOpen) => set({ isFinancialModalOpen }),

  isNewOrderModalOpen: false,
  setNewOrderModalOpen: (isNewOrderModalOpen) => set({ isNewOrderModalOpen }),

  updateOrderStatus: (id, status) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    })),

  updateOrderItems: (id, items) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, items } : o)),
    })),

  updateOrderFinancial: (id, data) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, ...data } : o)),
      selectedOrder: state.selectedOrder?.id === id ? { ...state.selectedOrder, ...data } : state.selectedOrder,
    })),

  overrideStockStatus: (dressId, status) =>
    set((state) => ({
      catalog: state.catalog.map((d) => (d.id === dressId ? { ...d, stock: status } : d)),
    })),

  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),

  addProduct: (product) => set((state) => ({ products: [product, ...state.products] })),

  updateProduct: (id, data) =>
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, ...data } : p)),
    })),

  toggleProductHidden: (id) =>
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, hidden: !p.hidden } : p)),
    })),

  addCollection: (c) => set((state) => ({ collections: [c, ...state.collections] })),

  updateCollection: (id, data) =>
    set((state) => ({
      collections: state.collections.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),

  deleteCollection: (id) =>
    set((state) => ({
      collections: state.collections.filter((c) => c.id !== id),
    })),

  setActiveCollection: (id) =>
    set((state) => ({
      collections: state.collections.map((c) => ({ ...c, active: c.id === id })),
    })),

  storeConfig: { windowBefore: 2, windowAfter: 3, provadores: 3 },
  setStoreConfig: (c) =>
    set((state) => ({ storeConfig: { ...state.storeConfig, ...c } })),

  filterStatus: "todos",
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  filterDate: "",
  setFilterDate: (filterDate) => set({ filterDate }),
}))