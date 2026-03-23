import { create } from "zustand";

export type AdminSection =
  | "dashboard"
  | "pedidos"
  | "financeiro"
  | "estoque"
  | "cadastro"
  | "colecoes"
  | "categorias"
  | "configuracoes"
  | "horarios"
  | "contratos";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
}
export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  collection: string;
  sku: string;
  size: string;
  color: string;
  condition: "nova" | "usada" | "desgastada";
  stock: "livre" | "alugado" | "manutencao";
  quantity: number;
  rentalPrice: number;
  salePrice?: number;
  showPrice: boolean;
  featured: boolean;
  hidden: boolean;
  images: string[];
  maintenanceNotes?: string;
  customWindowBefore?: number;
  customWindowAfter?: number;
  createdAt: string;
}
export interface Collection {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  productIds: string[];
}
export interface SeasonalCollection extends Collection {
  startDate?: string;
  endDate?: string;
}

// ── NOVOS STATUS DE LOGÍSTICA ADICIONADOS ──
export type OrderStatus =
  | "novo"
  | "pendente"
  | "confirmado"
  | "compareceu"
  | "cancelado"
  | "em_uso"
  | "concluido";

export interface DressItem {
  id: string;
  name: string;
  sku: string;
  size: string;
  price: number;
  image: string;
  stock: string;
  discount?: number;
}
export interface TaxaExtra {
  nome: string;
  valor: number;
}

export interface Order {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  cpf?: string;
  rg?: string;
  endereco?: string;
  provaDate: string;
  provaTime: string;
  eventoDate?: string;
  status: OrderStatus;
  items: DressItem[];
  taxas?: TaxaExtra[];
  contratoTexto?: string;
  totalValue: number;
  signalPaid: number;
  // ── CAMPOS ADICIONADOS PARA O FINANCEIRO ──
  cautionValue?: number;
  quitDate?: string;
  discountTotal?: number;
  createdAt: string;
}

export interface StoreConfig {
  windowBefore: number;
  windowAfter: number;
  businessHours: {
    dia: string;
    isOpen: boolean;
    open: string;
    close: string;
  }[];
  provadores: number;
  sinalPercentage?: number;
  contratoTemplate?: string;
}
export interface Transaction {
  id: string;
  type: "entrada" | "saida";
  description: string;
  amount: number;
  date: string;
  category: string;
  orderId?: string;
  createdAt?: string;
}

interface AdminStore {
  section: AdminSection;
  setSection: (section: AdminSection) => void;
  categories: Category[];
  setCategories: (cats: Category[]) => void;
  products: Product[];
  setProducts: (prods: Product[]) => void;
  addProduct: (prod: Product) => void;
  updateProduct: (id: string, prod: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  collections: Collection[];
  setCollections: (cols: Collection[]) => void;
  addCollection: (col: Collection) => void;
  updateCollection: (id: string, col: Partial<Collection>) => void;
  deleteCollection: (id: string) => void;
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updateOrderFinancial: (id: string, data: Partial<Order>) => void;
  updateOrderItems: (id: string, items: DressItem[]) => void;
  deleteOrder: (id: string) => void;
  storeConfig: StoreConfig | null;
  setStoreConfig: (config: StoreConfig) => void;
  catalog: Product[];
  setCatalog: (cat: Product[]) => void;
  editingProduct: Product | null;
  setEditingProduct: (prod: Product | null) => void;
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterDate: string;
  setFilterDate: (date: string) => void;
  
  // ── ESTADOS DOS MODAIS CORRIGIDOS ──
  isOrderModalOpen: boolean;
  setOrderModalOpen: (isOpen: boolean) => void;
  isFinancialModalOpen: boolean;
  setFinancialModalOpen: (isOpen: boolean) => void;
  isNewOrderModalOpen: boolean;
  setNewOrderModalOpen: (isOpen: boolean) => void;
  
  transactions: Transaction[];
  setTransactions: (t: Transaction[]) => void;
  addTransaction: (t: Transaction) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  section: "dashboard",
  setSection: (section) => set({ section }),
  categories: [],
  setCategories: (categories) => set({ categories }),
  products: [],
  setProducts: (products) => set({ products }),
  addProduct: (prod) =>
    set((state) => ({ products: [prod, ...state.products] })),
  updateProduct: (id, prod) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...prod } : p,
      ),
    })),
  deleteProduct: (id) =>
    set((state) => ({ products: state.products.filter((p) => p.id !== id) })),
  collections: [],
  setCollections: (collections) => set({ collections }),
  addCollection: (col) =>
    set((state) => ({ collections: [...state.collections, col] })),
  updateCollection: (id, col) =>
    set((state) => ({
      collections: state.collections.map((c) =>
        c.id === id ? { ...c, ...col } : c,
      ),
    })),
  deleteCollection: (id) =>
    set((state) => ({
      collections: state.collections.filter((c) => c.id !== id),
    })),
  orders: [],
  setOrders: (orders) => set({ orders }),
  updateOrderStatus: (id, status) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    })),
  updateOrderFinancial: (id, data) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, ...data } : o)),
    })),
  updateOrderItems: (id, items) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, items } : o)),
    })),
  deleteOrder: (id) =>
    set((state) => ({ orders: state.orders.filter((o) => o.id !== id) })),
  storeConfig: null,
  setStoreConfig: (storeConfig) => set({ storeConfig }),
  catalog: [],
  setCatalog: (catalog) => set({ catalog }),
  editingProduct: null,
  setEditingProduct: (editingProduct) => set({ editingProduct }),
  selectedOrder: null,
  setSelectedOrder: (order) => set({ selectedOrder: order }),
  filterStatus: "todos",
  setFilterStatus: (status) => set({ filterStatus: status }),
  filterDate: "",
  setFilterDate: (date) => set({ filterDate: date }),
  
  // ── IMPLEMENTAÇÃO DOS ESTADOS DE MODAL CORRIGIDOS ──
  isOrderModalOpen: false,
  setOrderModalOpen: (isOpen) => set({ isOrderModalOpen: isOpen }),
  isFinancialModalOpen: false,
  setFinancialModalOpen: (isOpen) => set({ isFinancialModalOpen: isOpen }),
  isNewOrderModalOpen: false,
  setNewOrderModalOpen: (isOpen) => set({ isNewOrderModalOpen: isOpen }),
  
  transactions: [],
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (t) =>
    set((state) => ({ transactions: [t, ...state.transactions] })),
  updateTransaction: (id, t) =>
    set((state) => ({
      transactions: state.transactions.map((tr) =>
        tr.id === id ? { ...tr, ...t } : tr,
      ),
    })),
  deleteTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    })),
}));