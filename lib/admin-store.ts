import { create } from "zustand"

export type AdminSection = "dashboard" | "pedidos" | "estoque" | "cadastro" | "colecoes" | "categorias" | "configuracoes" | "horarios" | "financeiro"

export interface Category {
  slug: string
  name: string
  description?: string
}

export interface Product {
  id: string
  name: string
  description?: string
  category: string
  collection: string
  sku: string
  size: string
  color: string
  condition: "nova" | "usada" | "desgastada"
  stock: "livre" | "alugado" | "manutencao"
  quantity: number
  rentalPrice: number
  salePrice?: number
  showPrice: boolean
  featured: boolean
  hidden: boolean
  images: string[]
  maintenanceNotes?: string
  customWindowBefore?: number
  customWindowAfter?: number
  createdAt: string
}

export interface Collection {
  id: string
  name: string
  description?: string
  active: boolean
  productIds: string[]
}

export type OrderStatus = "novo" | "pendente" | "confirmado" | "compareceu" | "cancelado"

export interface DressItem {
  id: string
  name: string
  sku: string
  size: string
  price: number
  image: string
  stock: string
}

export interface Order {
  id: string
  clientName: string
  clientPhone: string
  clientEmail: string
  provaDate: string
  provaTime: string
  eventoDate?: string
  status: OrderStatus
  items: DressItem[]
  totalValue: number
  signalPaid: number
  createdAt: string
}

export interface StoreConfig {
  windowBefore: number
  windowAfter: number
  businessHours: {
    dia: string
    isOpen: boolean
    open: string
    close: string
  }[]
  provadores: number
}

// ── Módulo Financeiro ──
export interface Transaction {
  id: string
  type: "entrada" | "saida"
  description: string
  amount: number
  date: string
  category: string
  orderId?: string
  createdAt?: string
}

interface AdminStore {
  section: AdminSection
  setSection: (section: AdminSection) => void

  categories: Category[]
  setCategories: (cats: Category[]) => void

  products: Product[]
  setProducts: (prods: Product[]) => void
  addProduct: (prod: Product) => void
  updateProduct: (id: string, prod: Partial<Product>) => void
  deleteProduct: (id: string) => void

  collections: Collection[]
  setCollections: (cols: Collection[]) => void

  orders: Order[]
  setOrders: (orders: Order[]) => void
  updateOrderStatus: (id: string, status: OrderStatus) => void
  updateOrderFinancial: (id: string, data: { totalValue?: number, signalPaid?: number }) => void
  updateOrderItems: (id: string, items: DressItem[]) => void
  deleteOrder: (id: string) => void

  storeConfig: StoreConfig | null
  setStoreConfig: (config: StoreConfig) => void

  catalog: Product[]
  setCatalog: (cat: Product[]) => void

  editingProduct: Product | null
  setEditingProduct: (prod: Product | null) => void

  isOrderModalOpen: boolean
  selectedOrder: Order | null
  setOrderModalOpen: (isOpen: boolean) => void
  setSelectedOrder: (order: Order | null) => void

  // ── Ações Financeiras ──
  transactions: Transaction[]
  setTransactions: (t: Transaction[]) => void
  addTransaction: (t: Transaction) => void
  deleteTransaction: (id: string) => void
}

export const useAdminStore = create<AdminStore>((set) => ({
  section: "dashboard",
  setSection: (section) => set({ section }),

  categories: [],
  setCategories: (categories) => set({ categories }),

  products: [],
  setProducts: (products) => set({ products }),
  addProduct: (prod) => set((state) => ({ products: [prod, ...state.products] })),
  updateProduct: (id, prod) => set((state) => ({
    products: state.products.map((p) => (p.id === id ? { ...p, ...prod } : p)),
  })),
  deleteProduct: (id) => set((state) => ({
    products: state.products.filter((p) => p.id !== id),
  })),

  collections: [],
  setCollections: (collections) => set({ collections }),

  orders: [],
  setOrders: (orders) => set({ orders }),
  updateOrderStatus: (id, status) => set((state) => ({
    orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
  })),
  updateOrderFinancial: (id, data) => set((state) => ({
    orders: state.orders.map((o) => (o.id === id ? { ...o, ...data } : o)),
  })),
  updateOrderItems: (id, items) => set((state) => ({
    orders: state.orders.map((o) => (o.id === id ? { ...o, items } : o)),
  })),
  deleteOrder: (id) => set((state) => ({
    orders: state.orders.filter((o) => o.id !== id),
  })),

  storeConfig: null,
  setStoreConfig: (storeConfig) => set({ storeConfig }),

  catalog: [],
  setCatalog: (catalog) => set({ catalog }),

  editingProduct: null,
  setEditingProduct: (editingProduct) => set({ editingProduct }),

  isOrderModalOpen: false,
  selectedOrder: null,
  setOrderModalOpen: (isOpen) => set({ isOrderModalOpen: isOpen }),
  setSelectedOrder: (order) => set({ selectedOrder: order }),

  // ── Inicialização Financeira ──
  transactions: [],
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (t) => set((state) => ({ transactions: [t, ...state.transactions] })),
  deleteTransaction: (id) => set((state) => ({ transactions: state.transactions.filter(t => t.id !== id) })),
}))