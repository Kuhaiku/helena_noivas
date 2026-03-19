"use client"

import { useState, useEffect } from "react"
import { useAdminStore, type Product, type Order, type Collection, type Category } from "@/lib/admin-store"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { ModalPedido } from "@/components/admin/modal-pedido"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import Image from "next/image"
import { Search, Save, Pencil, Trash2, CheckCircle2, Upload, Plus, PlusCircle } from "lucide-react"

export default function AdminPage() {
  const { 
    section, 
    setProducts, 
    setCategories, 
    setCollections, 
    setOrders, 
    setStoreConfig, 
    setTransactions 
  } = useAdminStore()
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [resProd, resCat, resCol, resPed, resConf, resFin] = await Promise.all([
          fetch('/api/produtos'),
          fetch('/api/categorias'),
          fetch('/api/colecoes'),
          fetch('/api/pedidos'),
          fetch('/api/configuracoes'),
          fetch('/api/financeiro')
        ])

        if (resProd.ok) setProducts(await resProd.json())
        if (resCat.ok) setCategories(await resCat.json())
        if (resCol.ok) setCollections(await resCol.json())
        if (resPed.ok) setOrders(await resPed.json())
        if (resConf.ok) setStoreConfig(await resConf.json())
        if (resFin.ok) setTransactions(await resFin.json())
      } catch (error) {
        console.error("Falha ao carregar admin:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [setProducts, setCategories, setCollections, setOrders, setStoreConfig, setTransactions])

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-secondary/10">A carregar painel...</div>

  return (
    <div className="min-h-screen bg-secondary/10 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 lg:p-10 overflow-x-hidden">
          {section === "dashboard" && <SectionDashboard />}
          {section === "pedidos" && <SectionPedidos />}
          {section === "financeiro" && <SectionFinanceiro />}
          {section === "estoque" && <SectionEstoque />}
          {section === "cadastro" && <SectionCadastro />}
          {section === "colecoes" && <SectionColecoes />}
          {section === "categorias" && <SectionCategorias />}
          {section === "configuracoes" && <SectionConfiguracoes />}
        </main>
      </div>
      <ModalPedido />
    </div>
  )
}

function StockStatusBadge({ status }: { status: string }) {
  if (status === "alugado") return <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold tracking-widest uppercase bg-amber-100 text-amber-700">Alugado</span>
  if (status === "manutencao") return <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold tracking-widest uppercase bg-rose-100 text-rose-700">Manutenção</span>
  return <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold tracking-widest uppercase bg-emerald-100 text-emerald-700">Livre</span>
}

function OrderStatusBadge({ status }: { status: string }) {
  if (status === "novo") return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-widest uppercase bg-blue-100 text-blue-700 border border-blue-200">Novo</span>
  if (status === "pendente") return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-widest uppercase bg-amber-100 text-amber-700 border border-amber-200">Aguardando</span>
  if (status === "confirmado") return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-widest uppercase bg-emerald-100 text-emerald-700 border border-emerald-200">Confirmado</span>
  if (status === "compareceu") return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-widest uppercase bg-purple-100 text-purple-700 border border-purple-200">Compareceu</span>
  if (status === "cancelado") return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-widest uppercase bg-gray-100 text-gray-700 border border-gray-200">Cancelado</span>
  return null
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function SectionDashboard() {
  const { products, orders, transactions } = useAdminStore()
  
  const novosPedidos = orders.filter(o => o.status === 'novo').length
  const totalPeças = products.length
  const receita = transactions.filter(t => t.type === 'entrada').reduce((a, b) => a + b.amount, 0)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-foreground">Visão Geral</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Pedidos Novos</p>
          <p className="text-3xl font-serif text-foreground">{novosPedidos}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Total no Acervo</p>
          <p className="text-3xl font-serif text-foreground">{totalPeças}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Receita Total</p>
          <p className="text-3xl font-serif text-emerald-600">R$ {receita.toLocaleString('pt-BR')}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Pedidos & Provas ────────────────────────────────────────────────────────
function SectionPedidos() {
  const { orders, setSelectedOrder, setOrderModalOpen } = useAdminStore()
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Pedidos & Provas</h1>
      </div>
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">ID</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cliente</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Data Prova</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Casamento</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total</th>
              <th className="text-right px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o: Order) => (
              <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-5 py-3 font-mono text-xs text-muted-foreground">#{o.id}</td>
                <td className="px-5 py-3 font-medium text-foreground">{o.clientName}</td>
                <td className="px-5 py-3 text-muted-foreground">{o.provaDate.split('-').reverse().join('/')} às {o.provaTime}</td>
                <td className="px-5 py-3 text-muted-foreground">{o.eventoDate ? o.eventoDate.split('-').reverse().join('/') : '-'}</td>
                <td className="px-5 py-3"><OrderStatusBadge status={o.status} /></td>
                <td className="px-5 py-3 text-right font-medium">R$ {o.totalValue.toLocaleString('pt-BR')}</td>
                <td className="px-5 py-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => { setSelectedOrder(o); setOrderModalOpen(true); }} className="h-7 w-7 p-0 text-blue-500"><Pencil size={14} /></Button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">Nenhum pedido registado.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Financeiro ───────────────────────────────────────────────────────────────
function SectionFinanceiro() {
  const { transactions, deleteTransaction, addTransaction } = useAdminStore()
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ type: "saida" as "entrada"|"saida", description: "", amount: "", date: new Date().toISOString().split("T")[0], category: "Operacional" })

  const totalEntradas = transactions.filter(t => t.type === "entrada").reduce((acc, t) => acc + t.amount, 0)
  const totalSaidas = transactions.filter(t => t.type === "saida").reduce((acc, t) => acc + t.amount, 0)
  const saldo = totalEntradas - totalSaidas

  const handleSalvarManual = async () => {
    if (!form.description || !form.amount) return
    setLoading(true)
    try {
      const dataToSave = { ...form, amount: Number(form.amount) }
      const res = await fetch('/api/financeiro', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dataToSave) })
      if (res.ok) {
        const result = await res.json()
        addTransaction({ id: result.id, ...dataToSave })
        setIsAdding(false)
        setForm({ ...form, description: "", amount: "" })
      }
    } catch (e) {
      alert("Erro ao salvar transação.")
    } finally {
      setLoading(false)
    }
  }

  const handleApagar = async (id: string) => {
    if (!confirm("Apagar este registro financeiro?")) return
    const res = await fetch(`/api/financeiro?id=${id}`, { method: 'DELETE' })
    if (res.ok) deleteTransaction(id)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Gestão Financeira</h1>
          <p className="text-sm text-muted-foreground">Controle de caixa, receitas e despesas.</p>
        </div>
        <Button size="sm" onClick={() => setIsAdding(!isAdding)} className="gap-1.5"><Plus size={14} /> Lançamento Manual</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Entradas</p>
          <p className="text-2xl font-semibold text-emerald-600">R$ {totalEntradas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Saídas</p>
          <p className="text-2xl font-semibold text-red-600">R$ {totalSaidas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
        </div>
        <div className={`p-5 rounded-xl border shadow-sm ${saldo >= 0 ? 'bg-primary/10 border-primary/20' : 'bg-red-50 border-red-200'}`}>
          <p className="text-xs uppercase tracking-widest mb-1 font-medium">Saldo Atual</p>
          <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-primary' : 'text-red-600'}`}>R$ {saldo.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white rounded-xl border border-primary/30 p-6 flex flex-col gap-4 shadow-sm">
          <h3 className="font-semibold border-b pb-2">Novo Lançamento</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <Label className="text-xs mb-1.5">Tipo</Label>
              <Select value={form.type} onValueChange={(v: any) => setForm({...form, type: v})}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="entrada">Entrada</SelectItem><SelectItem value="saida">Saída</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs mb-1.5">Descrição</Label>
              <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="h-9" />
            </div>
            <div>
              <Label className="text-xs mb-1.5">Valor (R$)</Label>
              <Input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="h-9" />
            </div>
            <div>
              <Label className="text-xs mb-1.5">Data</Label>
              <Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="h-9" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setIsAdding(false)}>Cancelar</Button>
            <Button onClick={handleSalvarManual} disabled={loading || !form.amount || !form.description}>Salvar</Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Data</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Descrição</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Pedido Ref.</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Valor</th>
              <th className="text-right px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id} className="border-b border-border hover:bg-muted/30">
                <td className="px-5 py-3 text-muted-foreground">{t.date.split('-').reverse().join('/')}</td>
                <td className="px-5 py-3 font-medium">{t.description}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{t.orderId ? `#${t.orderId}` : '-'}</td>
                <td className={`px-5 py-3 text-right font-medium ${t.type === 'entrada' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {t.type === 'entrada' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </td>
                <td className="px-5 py-3 text-right">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500" onClick={() => handleApagar(t.id)}><Trash2 size={14}/></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Estoque ─────────────────────────────────────────────────────────────────
function SectionEstoque() {
  const { products, deleteProduct, setEditingProduct, setSection } = useAdminStore()

  const handleDelete = async (id: string) => {
    if (!confirm("Apagar esta peça?")) return;
    const response = await fetch(`/api/produtos?id=${id}`, { method: 'DELETE' });
    if (response.ok) deleteProduct(id);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-foreground">Estoque</h1>
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase">Peça</th>
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase">SKU</th>
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase">Qtd</th>
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase">Status</th>
              <th className="text-right px-5 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((item: Product) => (
              <tr key={item.id} className="border-b border-border hover:bg-muted/30">
                <td className="px-5 py-3 flex items-center gap-3">
                  <div className="relative w-10 h-12 rounded-md overflow-hidden bg-secondary">
                    <Image src={item.images?.[0] || "/placeholder.jpg"} alt={item.name} fill className="object-cover" />
                  </div>
                  <span className="font-medium">{item.name}</span>
                </td>
                <td className="px-5 py-3 font-mono text-xs">{item.sku}</td>
                <td className="px-5 py-3">{item.quantity}</td>
                <td className="px-5 py-3"><StockStatusBadge status={item.stock} /></td>
                <td className="px-5 py-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => { setEditingProduct(item); setSection("cadastro") }} className="h-7 w-7 p-0 text-blue-500"><Pencil size={14} /></Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)} className="h-7 w-7 p-0 text-red-500"><Trash2 size={14} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Cadastro ─────────────────────────────────────────────────────────────────
function SectionCadastro() {
  const { addProduct, products, editingProduct, setEditingProduct, updateProduct, setSection, categories, setCollections, collections } = useAdminStore()

  const emptyForm = (): Omit<Product, "id" | "createdAt"> => ({
    name: "", description: "", category: "noiva", collection: "",
    sku: "", size: "", color: "", condition: "nova",
    stock: "livre", quantity: 1, rentalPrice: 0, showPrice: false, featured: false, hidden: false,
    images: [], maintenanceNotes: ""
  })

  const [form, setForm] = useState(emptyForm())
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (editingProduct) setForm({ ...editingProduct })
    else setForm(emptyForm())
  }, [editingProduct])

  const handleSave = async () => {
    if (!form.name || !form.sku || !form.rentalPrice) return
    try {
      if (editingProduct) {
        const response = await fetch(`/api/produtos?id=${editingProduct.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        if (response.ok) { updateProduct(editingProduct.id, form); setSaved(true); setTimeout(() => { setSaved(false); setEditingProduct(null); setSection("estoque") }, 1500) }
      } else {
        const response = await fetch('/api/produtos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        const result = await response.json()
        if (result.success) { addProduct({ ...form, id: result.produtoId.toString(), createdAt: new Date().toISOString() }); setSaved(true); setForm(emptyForm()); setTimeout(() => setSaved(false), 3000) }
      }
    } catch (e) { alert("Erro de API.") }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">{editingProduct ? "Editar Produto" : "Novo Produto"}</h1>
        {saved && <span className="text-green-600 font-medium">Salvo com sucesso!</span>}
      </div>
      <div className="bg-white p-6 rounded-xl border border-border grid grid-cols-2 gap-4">
        <div className="col-span-2"><Label>Nome</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
        <div><Label>SKU</Label><Input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} /></div>
        <div><Label>Preço de Aluguel</Label><Input type="number" value={form.rentalPrice} onChange={e => setForm({...form, rentalPrice: Number(e.target.value)})} /></div>
        <div>
          <Label>Coleção (Maiúsculas)</Label>
          <Input list="colecoes-list" value={form.collection} onChange={e => setForm({...form, collection: e.target.value.toUpperCase()})} />
          <datalist id="colecoes-list">{collections.map(c => <option key={c.id} value={c.name.toUpperCase()} />)}</datalist>
        </div>
        <div><Label>Quantidade em Estoque</Label><Input type="number" min="1" value={form.quantity} onChange={e => setForm({...form, quantity: Number(e.target.value)})} /></div>
        <Button onClick={handleSave} className="col-span-2 mt-4">Salvar Produto</Button>
      </div>
    </div>
  )
}

// ─── Coleções ─────────────────────────────────────────────────────────────────
function SectionColecoes() {
  const { collections } = useAdminStore()
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Coleções Ativas</h1>
      <div className="grid grid-cols-1 gap-4">
        {collections.map(c => (
          <div key={c.id} className="bg-white p-4 rounded-xl border flex justify-between">
            <span className="font-medium">{c.name} {c.active && "(Destaque)"}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Categorias ───────────────────────────────────────────────────────────────
function SectionCategorias() {
  const { categories } = useAdminStore()
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Categorias</h1>
      <div className="bg-white p-4 rounded-xl border">
        {categories.map(c => <div key={c.slug} className="py-2 border-b last:border-0">{c.name} ({c.slug})</div>)}
      </div>
    </div>
  )
}

// ─── Configurações ────────────────────────────────────────────────────────────
function SectionConfiguracoes() {
  const { storeConfig } = useAdminStore()
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Configurações da Loja</h1>
      <div className="bg-white p-6 rounded-xl border grid grid-cols-2 gap-4">
        <div><Label>Dias Bloqueio (Antes do Evento)</Label><Input value={storeConfig?.windowBefore || 2} disabled /></div>
        <div><Label>Dias Bloqueio (Depois do Evento)</Label><Input value={storeConfig?.windowAfter || 3} disabled /></div>
        <div><Label>Quantidade de Provadores</Label><Input value={storeConfig?.provadores || 1} disabled /></div>
      </div>
    </div>
  )
}