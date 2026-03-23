"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Printer, ArrowLeft, Save, FileText, XCircle } from "lucide-react"

export default function ContratoPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [order, setOrder] = useState<any>(null)
  const [textoContrato, setTextoContrato] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  // Variáveis de ambiente carregadas da configuração do site
  const [storeInfo, setStoreInfo] = useState({
    name: " ",
    cnpj: "00.000.000/0000-00",
    phone: "(00) 00000-0000"
  })

  useEffect(() => {
    // Carrega dados da .env (expostos para o frontend via NEXT_PUBLIC)
    setStoreInfo({
      name: process.env.NEXT_PUBLIC_STORE_NAME || "",
      cnpj: process.env.NEXT_PUBLIC_STORE_CNPJ || "00.000.000/0000-00",
      phone: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "(00) 00000-0000"
    })

    async function carregarDados() {
      try {
        const [resPed, resConf] = await Promise.all([
          fetch('/api/pedidos'),
          fetch('/api/configuracoes')
        ])
        
        if (resPed.ok) {
          const pedidos = await resPed.json()
          const config = resConf.ok ? await resConf.json() : null
          const encontrado = pedidos.find((p: any) => p.id === id)
          
          if (encontrado) {
            setOrder(encontrado)
            
            if (encontrado.contratoTexto && encontrado.contratoTexto.length > 10) {
              setTextoContrato(encontrado.contratoTexto)
            } else {
              setTextoContrato(gerarTextoBase(encontrado, config))
            }
          }
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    carregarDados()
  }, [id])

  const gerarTextoBase = (o: any, configuracao: any) => {
    // Lista de Itens Formatada
    const itensTexto = o.items.map((i: any) => `• ${i.name} (SKU: ${i.sku}) - R$ ${Number(i.price).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`).join('\n')
    
    // Cálculo de Valores
    const totalTaxas = o.taxas?.reduce((acc: number, t: any) => acc + t.valor, 0) || 0
    const subtotal = o.items.reduce((acc: number, i: any) => acc + Number(i.price), 0) + totalTaxas
    const desconto = o.discountTotal || 0
    const totalLiquido = o.totalValue || (subtotal - desconto)
    const restante = Math.max(0, totalLiquido - o.signalPaid)
    
    // Novos valores vindos do Modal de Fechamento
    const valorCaucao = o.cautionValue || 500
    const dataQuitacao = o.quitDate ? new Date(o.quitDate + "T12:00:00").toLocaleDateString('pt-BR') : "a definir"
    const dataEventoFormatada = o.eventoDate ? o.eventoDate.split('-').reverse().join('/') : '___/___/_____'

    const clausulasDinamicas = configuracao?.contratoTemplate || `CLÁUSULA TERCEIRA - DA RETIRADA E DEVOLUÇÃO
1. A retirada deverá ocorrer até 2 dias antes do evento.
2. O traje deverá ser devolvido na mesma condição em que foi entregue, sendo proibida a lavagem ou alteração da peça pelo locatário.
3. A não devolução do traje na data combinada implicará em multa diária por atraso no valor de R$ 50,00.
4. O cliente se responsabiliza pela integridade das peças.
5. Em caso de danos irreversíveis, manchas permanentes ou perda da peça, o locatário autoriza a execução integral ou parcial da CAUÇÃO estipulada acima. Caso o dano ultrapasse o valor da caução, o locatário deverá ressarcir o valor de venda do traje.

CLÁUSULA QUARTA - DO CANCELAMENTO E RESCISÃO
A desistência da locação por parte do(a) LOCATÁRIO(A) implicará na perda integral do valor dado como sinal, para cobrir despesas operacionais e bloqueio de agenda da LOCADORA.`;

    return `CONTRATO DE LOCAÇÃO DE TRAJES A RIGOR

Pelo presente instrumento particular, de um lado ${storeInfo.name}, adiante denominada LOCADORA, e de outro lado:

NOME: ${o.clientName}
CPF: ${o.cpf || '_____________________'} | RG: ${o.rg || '_____________________'}
ENDEREÇO: ${o.endereco || '_____________________________________________________'}
TELEFONE: ${o.clientPhone}

doravante denominado(a) LOCATÁRIO(A), firmam o presente contrato mediante as seguintes cláusulas e condições:

CLÁUSULA PRIMEIRA - DO OBJETO E DATAS
A LOCADORA cede em locação ao LOCATÁRIO(A) os seguintes trajes/acessórios:
${itensTexto}
(Ver Anexo I para o Registo Fotográfico das peças)

DATA DO EVENTO: ${dataEventoFormatada}

CLÁUSULA SEGUNDA - DOS VALORES, SINAL E CAUÇÃO
O valor total da locação, já contabilizando taxas e descontos, é de R$ ${totalLiquido.toLocaleString('pt-BR', {minimumFractionDigits: 2})}.
Neste ato, o(a) LOCATÁRIO(A) efetua o pagamento a título de SINAL (reserva de data) no valor de R$ ${o.signalPaid.toLocaleString('pt-BR', {minimumFractionDigits: 2})}.

Saldo Remanescente: R$ ${restante.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
Data limite para quitação do saldo: ${dataQuitacao}

CAUÇÃO DE GARANTIA: Fica estipulado o valor de R$ ${valorCaucao.toLocaleString('pt-BR', {minimumFractionDigits: 2})} a título de caução, que servirá única e exclusivamente como garantia para cobrir eventuais avarias ou atrasos na devolução das peças.

${clausulasDinamicas}

E por estarem justos e contratados, assinam o presente em 2 (duas) vias de igual teor.

Araruama, RJ, ${new Date().toLocaleDateString('pt-BR')}



_______________________________________________________
${storeInfo.name} (Locadora)



_______________________________________________________
${o.clientName.toUpperCase()} (Locatário/a)
`
  }

  const handleSalvarTexto = async () => {
    const pedidoAtualizado = { ...order, contratoTexto: textoContrato }
    await fetch(`/api/pedidos?id=${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pedidoAtualizado) })
    setIsEditing(false)
  }

  const handlePrint = () => {
    setIsEditing(false)
    // Pequeno atraso para o React renderizar o layout de impressão (as fotos) antes de chamar a janela do Windows
    setTimeout(() => window.print(), 500)
  }

  const handleRescindir = async () => {
    if (!confirm("ATENÇÃO: Deseja realmente rescindir este contrato?\n\nO status mudará para 'Cancelado', libertando as peças para outras noivas e a cliente perderá o valor do sinal.")) return
    
    setLoading(true)
    try {
      const pedidoAtualizado = { ...order, status: "cancelado" }
      const res = await fetch(`/api/pedidos?id=${id}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(pedidoAtualizado) 
      })
      if (res.ok) {
        alert("Contrato rescindido com sucesso.")
        router.push("/admin")
      }
    } catch (error) {
      alert("Erro ao rescindir o contrato.")
      setLoading(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">A carregar documento...</div>

  const nomeSplit = storeInfo.name.split(' ')
  const primeiraPalavra = nomeSplit[0] || ""
  const restoNome = nomeSplit.slice(1).join(' ') || ""

  return (
    <div className="min-h-screen bg-[#e5e7eb] pb-20 print:bg-white print:pb-0">
      <div className="bg-white border-b border-border sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm print:hidden">
        <Button variant="ghost" onClick={() => router.push("/admin")} className="gap-2"><ArrowLeft size={16} /> Voltar ao Painel</Button>
        <div className="flex items-center gap-3">
          
          <Button onClick={handleRescindir} variant="outline" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
            <XCircle size={16} /> Rescindir Contrato
          </Button>

          {isEditing ? (
            <Button onClick={handleSalvarTexto} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"><Save size={16} /> Salvar Alterações</Button>
          ) : (
            <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2"><FileText size={16} /> Editar Texto</Button>
          )}
          <Button onClick={handlePrint} className="gap-2"><Printer size={16} /> Imprimir / PDF</Button>
        </div>
      </div>

      <div className="max-w-[800px] min-h-[1122px] mx-auto mt-8 bg-white shadow-xl py-10 px-12 print:shadow-none print:m-0 print:py-8 print:px-8">
        
        {/* Cabeçalho com as Variáveis de Ambiente */}
        <div className="flex flex-col items-center justify-center mb-6 pb-4 border-b-2 border-black">
          <span className="font-serif text-2xl tracking-widest text-black font-bold uppercase">
            {primeiraPalavra}<span className="font-light ml-1">{restoNome}</span>
          </span>
          <p className="text-[10px] text-black mt-1 tracking-widest">CNPJ: {storeInfo.cnpj} | Tel.: {storeInfo.phone}</p>
        </div>

        {/* Corpo do Contrato (Editável ou Visão Final) */}
        {isEditing ? (
          <textarea 
            value={textoContrato} 
            onChange={e => setTextoContrato(e.target.value)} 
            style={{ fontFamily: "Arial, sans-serif", fontSize: "12pt", color: "black", lineHeight: "1.5" }}
            className="w-full min-h-[850px] p-2 border border-primary/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 resize-none"
          />
        ) : (
          <div 
            style={{ fontFamily: "Arial, sans-serif", fontSize: "12pt", color: "black", lineHeight: "1.5" }}
            className="whitespace-pre-wrap text-justify"
          >
            {textoContrato}
          </div>
        )}

        {/* ── ANEXO I: FOTOS DAS PEÇAS (Aparece ao imprimir ou ao visualizar) ── */}
        {!isEditing && order?.items && order.items.length > 0 && (
          <div className="mt-16 pt-8 border-t-2 border-black break-inside-avoid">
            <h3 className="font-bold text-center text-lg mb-6 tracking-widest uppercase">Anexo I - Registo Fotográfico</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="flex flex-col items-center text-center p-4 border border-gray-200 rounded-xl bg-gray-50/50">
                  <div className="relative w-32 h-44 mb-3 rounded-lg overflow-hidden border border-gray-300 bg-white">
                    {/* Usamos a tag img normal para garantir a qualidade na hora da impressão do navegador */}
                    <img 
                      src={item.image || "/placeholder.jpg"} 
                      alt={item.name} 
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <p className="font-bold text-sm leading-tight text-black line-clamp-2 min-h-[40px]">{item.name}</p>
                  <div className="mt-2 text-xs text-gray-600 font-mono bg-white px-2 py-1 rounded border border-gray-200 w-full">
                    SKU: {item.sku}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-black bg-white px-2 py-1 rounded border border-gray-200 w-full">
                    Tamanho: {item.size}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}