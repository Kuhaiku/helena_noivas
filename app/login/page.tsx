"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Mail } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErro("")

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })

      if (res.ok) {
        window.location.href = "/admin" // Força o refresh da página para o Middleware ler o cookie
      } else {
        const data = await res.json()
        setErro(data.message || "Erro ao iniciar sessão.")
      }
    } catch (error) {
      setErro("Erro de ligação ao servidor.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-border overflow-hidden">
        <div className="bg-primary/5 p-8 text-center border-b border-border">
          {/* ── NOME DINÂMICO VINDO DO .ENV ── */}
          <span className="font-serif text-3xl tracking-widest text-foreground uppercase">
            {process.env.NEXT_PUBLIC_ADMIN_NAME || "ADMIN"}
            <span className="text-primary font-light ml-1">ADMIN</span>
          </span>
          <p className="text-sm text-muted-foreground mt-2">Sistema de Gestão e ERP</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 flex flex-col gap-5">
          {erro && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center border border-red-100">{erro}</div>}
          
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">E-mail de Acesso</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="pl-10 h-11" placeholder="admin@loja.com.br" />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold mb-1.5 block">Palavra-passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="pl-10 h-11" placeholder="••••••••" />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="h-11 mt-2 font-semibold text-base shadow-md">
            {loading ? "A Entrar..." : "Aceder ao Painel"}
          </Button>
        </form>
      </div>
    </div>
  )
}