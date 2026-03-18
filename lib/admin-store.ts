"use client"

import { create } from "zustand"

export type OrderStatus = "pendente" | "confirmado" | "compareceu" | "cancelado"
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

// Full product model (catalog entry)
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
  hidden: boolean        // ocultar da vitrine pública
  images: string[]       // ordered; [0] is cover
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

// ─── Seed data ──────────────────────────────────────────────────────────────

const DRESS_CATALOG: DressItem[] = [
  { id: "1", name: "Aurora", sku: "HN-001", size: "38", price: 3800, image: "/images/vestido-aurora.jpg", stock: "livre" },
  { id: "2", name: "Isabela", sku: "HN-002", size: "40", price: 4200, image: "/images/vestido-isabela.jpg", stock: "alugado" },
  { id: "3", name: "Valentina", sku: "HN-003", size: "36", price: 5100, image: "/images/vestido-valentina.jpg", stock: "livre" },
  { id: "4", name: "Sofia", sku: "HN-004", size: "42", price: 2900, image: "/images/vestido-sofia.jpg", stock: "manutencao" },
  { id: "5", name: "Luna", sku: "HN-005", size: "38", price: 4500, image: "/images/vestido-luna.jpg", stock: "livre" },
  { id: "6", name: "Bianca", sku: "HN-006", size: "44", price: 3300, image: "/images/vestido-bianca.jpg", stock: "alugado" },
]

const PRODUCT_CATALOG: Product[] = [
  {
    id: "p1", name: "Aurora", description: "Vestido de noiva linha A com renda francesa, cauda catedral e decote coração. Tecido tule italiano com forro acetinado.",
    category: "noiva", collection: "Primavera 2026", sku: "HN-001", size: "38", color: "Branco Puro",
    condition: "nova", stock: "livre", rentalPrice: 3800, salePrice: 9500, showPrice: false, featured: true, hidden: false,
    images: ["/images/vestido-aurora.jpg"], maintenanceNotes: "", createdAt: "2025-01-10",
  },
  {
    id: "p2", name: "Isabela", description: "Vestido sereia off-shoulder em crepe italiano com cauda longa e decote bordado com micro-cristais.",
    category: "noiva", collection: "Primavera 2026", sku: "HN-002", size: "40", color: "Off-white",
    condition: "usada", stock: "alugado", rentalPrice: 4200, showPrice: false, featured: true, hidden: false,
    images: ["/images/vestido-isabela.jpg"], maintenanceNotes: "Ajuste de zíper em 03/2025.", createdAt: "2025-01-15",
  },
  {
    id: "p3", name: "Valentina", description: "Ballgown clássico com saia volumosa em tule camadas, corpete bordado florido e cauda real.",
    category: "noiva", collection: "Verão 2025", sku: "HN-003", size: "36", color: "Champagne",
    condition: "nova", stock: "livre", rentalPrice: 5100, salePrice: 12000, showPrice: false, featured: false, hidden: false,
    images: ["/images/vestido-valentina.jpg"], maintenanceNotes: "", createdAt: "2024-11-20",
  },
  {
    id: "p4", name: "Sofia", description: "Vestido midi moderno em satin drapeado com decote V e detalhe de cinto dourado. Estilo contemporâneo.",
    category: "festa", collection: "Cápsula 2025", sku: "HN-004", size: "42", color: "Branco Puro",
    condition: "usada", stock: "manutencao", rentalPrice: 2900, showPrice: false, featured: false, hidden: false,
    images: ["/images/vestido-sofia.jpg"], maintenanceNotes: "Em manutenção: limpeza a seco e ajuste na barra.", createdAt: "2024-09-05",
  },
  {
    id: "p5", name: "Luna", description: "Vestido boho-chic com renda floral total, manga longa em sino e silhueta evasê com cauda elegante.",
    category: "noiva", collection: "Primavera 2026", sku: "HN-005", size: "38", color: "Off-white",
    condition: "nova", stock: "livre", rentalPrice: 4500, salePrice: 10800, showPrice: false, featured: true, hidden: false,
    images: ["/images/vestido-luna.jpg"], maintenanceNotes: "", createdAt: "2025-02-01",
  },
  {
    id: "p6", name: "Bianca", description: "Vestido minimalista linha reta em satin puro com costas abertas e decote barco. Elegância absoluta.",
    category: "noiva", collection: "Verão 2025", sku: "HN-006", size: "44", color: "Branco Puro",
    condition: "usada", stock: "alugado", rentalPrice: 3300, showPrice: false, featured: false, hidden: false,
    images: ["/images/vestido-bianca.jpg"], maintenanceNotes: "Último aluguel: 05/2025.", createdAt: "2024-08-12",
  },
]

const MOCK_ORDERS: Order[] = [
  {
    id: "PED-001",
    clientName: "Ana Carolina Meireles",
    clientPhone: "11 99999-0001",
    clientEmail: "ana@email.com",
    provaDate: new Date().toISOString().split("T")[0],
    provaTime: "10:00",
    status: "confirmado",
    items: [{ ...DRESS_CATALOG[0], note: "", discount: 0 }],
    createdAt: new Date().toISOString().split("T")[0],
  },
  {
    id: "PED-002",
    clientName: "Beatriz Fontana",
    clientPhone: "11 99999-0002",
    clientEmail: "bia@email.com",
    provaDate: new Date().toISOString().split("T")[0],
    provaTime: "14:00",
    status: "pendente",
    items: [{ ...DRESS_CATALOG[2], note: "", discount: 0 }, { ...DRESS_CATALOG[4], note: "", discount: 0 }],
    createdAt: new Date().toISOString().split("T")[0],
  },
  {
    id: "PED-003",
    clientName: "Camila Duarte",
    clientPhone: "11 99999-0003",
    clientEmail: "camila@email.com",
    provaDate: (() => { const d = new Date(); d.setDate(d.getDate() + 2); return d.toISOString().split("T")[0] })(),
    provaTime: "11:00",
    status: "compareceu",
    items: [{ ...DRESS_CATALOG[5], note: "Ajuste nas alças", discount: 200 }],
    signalPaid: 990,
    totalValue: 3100,
    createdAt: (() => { const d = new Date(); d.setDate(d.getDate() - 4); return d.toISOString().split("T")[0] })(),
  },
  {
    id: "PED-004",
    clientName: "Daniela Ribeiro",
    clientPhone: "11 99999-0004",
    clientEmail: "dani@email.com",
    provaDate: (() => { const d = new Date(); d.setDate(d.getDate() + 3); return d.toISOString().split("T")[0] })(),
    provaTime: "09:00",
    status: "pendente",
    items: [{ ...DRESS_CATALOG[1], note: "", discount: 0 }],
    createdAt: (() => { const d = new Date(); d.setDate(d.getDate() - 2); return d.toISOString().split("T")[0] })(),
  },
  {
    id: "PED-005",
    clientName: "Eduarda Sampaio",
    clientPhone: "11 99999-0005",
    clientEmail: "edu@email.com",
    provaDate: (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split("T")[0] })(),
    provaTime: "15:30",
    status: "cancelado",
    items: [{ ...DRESS_CATALOG[3], note: "", discount: 0 }],
    createdAt: (() => { const d = new Date(); d.setDate(d.getDate() - 5); return d.toISOString().split("T")[0] })(),
  },
  {
    id: "PED-006",
    clientName: "Fernanda Costa",
    clientPhone: "11 99999-0006",
    clientEmail: "fer@email.com",
    provaDate: new Date().toISOString().split("T")[0],
    provaTime: "16:00",
    status: "confirmado",
    items: [{ ...DRESS_CATALOG[4], note: "", discount: 0 }],
    createdAt: new Date().toISOString().split("T")[0],
  },
]

// ─── Seasonal Collection ─────────────────────────────────────────────────────

export interface SeasonalCollection {
  id: string
  name: string           // Ex: "Primavera 2026"
  description: string    // Subtítulo exibido na home
  productIds: string[]   // IDs de Product que compõem a coleção
  active: boolean        // Somente uma ativa aparece no destaque da home
  createdAt: string
}

const SEED_COLLECTIONS: SeasonalCollection[] = [
  {
    id: "col-1",
    name: "Primavera 2026",
    description: "Leveza, renda e romantismo para o casamento dos seus sonhos.",
    productIds: ["p1", "p2", "p5"],
    active: true,
    createdAt: "2025-01-10",
  },
  {
    id: "col-2",
    name: "Verão 2025",
    description: "Silhuetas limpas, tecidos frescos e elegância sem esforço.",
    productIds: ["p3", "p6"],
    active: false,
    createdAt: "2024-08-01",
  },
]

export type AdminSection = "dashboard" | "pedidos" | "estoque" | "cadastro" | "colecoes" | "configuracoes" | "horarios"

interface AdminStore {
  section: AdminSection
  setSection: (s: AdminSection) => void

  orders: Order[]
  catalog: DressItem[]
  products: Product[]
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
  catalog: DRESS_CATALOG,
  products: PRODUCT_CATALOG,
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
