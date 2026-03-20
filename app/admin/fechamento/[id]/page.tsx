"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  FileSignature,
  CheckCircle2,
  DollarSign,
  Calendar,
  User,
  Trash2,
  Plus,
} from "lucide-react";

export default function FechamentoContratoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Documentação e Evento
  const [eventoDate, setEventoDate] = useState("");
  const [cpf, setCpf] = useState("");
  const [rg, setRg] = useState("");
  const [endereco, setEndereco] = useState("");

  // Financeiro
  const [desconto, setDesconto] = useState(0);
  const [sinal, setSinal] = useState(0);
  const [taxas, setTaxas] = useState<{ nome: string; valor: number }[]>([]);

  // Nova taxa temp
  const [novaTaxaNome, setNovaTaxaNome] = useState("");
  const [novaTaxaValor, setNovaTaxaValor] = useState("");

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resPed, resConf] = await Promise.all([
          fetch("/api/pedidos"),
          fetch("/api/configuracoes"),
        ]);
        if (resPed.ok) {
          const pedidos = await resPed.json();
          const encontrado = pedidos.find((p: any) => p.id === id);
          if (encontrado) {
            setOrder(encontrado);
            setEventoDate(encontrado.eventoDate || "");
            setCpf(encontrado.cpf || "");
            setRg(encontrado.rg || "");
            setEndereco(encontrado.endereco || "");
            setTaxas(encontrado.taxas || []);
            setSinal(encontrado.signalPaid || 0);
          }
        }
        if (resConf.ok) setConfig(await resConf.json());
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [id]);

  const addTaxa = () => {
    if (!novaTaxaNome || !novaTaxaValor) return;
    setTaxas([...taxas, { nome: novaTaxaNome, valor: Number(novaTaxaValor) }]);
    setNovaTaxaNome("");
    setNovaTaxaValor("");
  };

  const removeTaxa = (idx: number) =>
    setTaxas(taxas.filter((_, i) => i !== idx));

  // Matemática
  const subtotal =
    order?.items?.reduce(
      (acc: number, item: any) => acc + Number(item.price),
      0,
    ) || 0;
  const totalTaxas = taxas.reduce((acc, t) => acc + t.valor, 0);
  const totalFinal = Math.max(0, subtotal + totalTaxas - desconto);
  const percentualSinal = config?.sinalPercentage || 30;

  useEffect(() => {
    if (totalFinal > 0 && sinal === 0)
      setSinal((totalFinal * percentualSinal) / 100);
  }, [totalFinal, percentualSinal, sinal]);

  const restante = Math.max(0, totalFinal - sinal);

  const handleGerarContrato = async () => {
    if (!eventoDate || !cpf || !endereco)
      return alert(
        "Preencha a Data do Evento, CPF e Endereço para gerar o contrato legal.",
      );

    setSaving(true);
    try {
      const pedidoAtualizado = {
        ...order,
        eventoDate,
        cpf,
        rg,
        endereco,
        taxas,
        totalValue: totalFinal,
        signalPaid: sinal,
        status: "confirmado",
      };

      const resPedido = await fetch(`/api/pedidos?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedidoAtualizado),
      });
      if (!resPedido.ok) throw new Error("Erro ao atualizar");

      if (sinal > 0 && order.signalPaid !== sinal) {
        // Só lança se o sinal mudou
        await fetch("/api/financeiro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "entrada",
            description: `Sinal - Contrato #${id} (${order.clientName})`,
            amount: sinal,
            date: new Date().toISOString().split("T")[0],
            category: "Locação",
            orderId: id,
          }),
        });
      }

      // VAI PARA A PÁGINA DO CONTRATO
      router.push(`/admin/contrato/${id}`);
    } catch (error) {
      alert("Ocorreu um erro.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/10">
        A carregar...
      </div>
    );
  if (!order)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Pedido não encontrado.
      </div>
    );

  return (
    <div className="min-h-screen bg-secondary/10 pb-20">
      <div className="bg-white border-b border-border sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin")}
            className="gap-2 text-muted-foreground"
          >
            <ArrowLeft size={16} /> Voltar
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <h1 className="font-semibold text-lg flex items-center gap-2">
            <FileSignature className="text-primary" size={20} /> Preparar
            Contrato
          </h1>
        </div>
        <div className="font-mono text-sm text-muted-foreground">
          Pedido #{order.id}
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
              <User size={16} /> Documentação Legal
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label className="text-xs mb-1.5 block">
                  Nome Completo (Locatário)
                </Label>
                <Input
                  value={order.clientName}
                  disabled
                  className="h-10 bg-muted/50"
                />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">CPF *</Label>
                <Input
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className="h-10"
                />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">RG</Label>
                <Input
                  value={rg}
                  onChange={(e) => setRg(e.target.value)}
                  placeholder="00.000.000-0"
                  className="h-10"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs mb-1.5 block">
                  Endereço Completo de Residência *
                </Label>
                <Input
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Rua, Número, Bairro, Cidade - Estado, CEP"
                  className="h-10"
                />
              </div>
            </div>
            <Separator className="my-5" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
              <Calendar size={16} /> Data Oficial do Evento
            </h2>
            <div className="max-w-[250px]">
              <Label className="text-xs mb-1.5 block">
                Data do Casamento (Tranca Estoque) *
              </Label>
              <Input
                type="date"
                value={eventoDate}
                onChange={(e) => setEventoDate(e.target.value)}
                className="h-10 border-primary/30"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Peças Contratadas
            </h2>
            <div className="flex flex-col gap-3">
              {order.items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 rounded-xl border border-border bg-secondary/5"
                >
                  <div className="relative w-12 h-16 rounded-md overflow-hidden shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      SKU: {item.sku} · T{item.size}
                    </p>
                  </div>
                  <p className="font-medium text-sm">
                    R$ {Number(item.price).toLocaleString("pt-BR")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl border border-primary/30 shadow-sm sticky top-24">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
              <DollarSign size={16} /> Acerto Financeiro
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal Peças</span>
                <span className="font-medium">
                  R${" "}
                  {subtotal.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="bg-secondary/10 p-3 rounded-xl border border-border flex flex-col gap-3">
                <Label className="text-xs font-semibold">
                  Taxas e Acréscimos
                </Label>
                {taxas.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm bg-white p-2 rounded border shadow-sm"
                  >
                    <span>{t.nome}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">
                        + R$ {t.valor.toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeTaxa(idx)}
                        className="text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: Frete, Ajuste"
                    value={novaTaxaNome}
                    onChange={(e) => setNovaTaxaNome(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Input
                    type="number"
                    placeholder="Valor"
                    value={novaTaxaValor}
                    onChange={(e) => setNovaTaxaValor(e.target.value)}
                    className="h-8 text-xs w-24"
                  />
                  <Button size="sm" onClick={addTaxa} className="h-8 px-2">
                    <Plus size={14} />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-xs mb-1.5 block text-muted-foreground">
                  Desconto Concedido (R$)
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={desconto}
                  onChange={(e) => setDesconto(Number(e.target.value))}
                  className="h-9"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">
                  Total Final
                </span>
                <span className="font-bold text-lg text-foreground">
                  R${" "}
                  {totalFinal.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="bg-secondary/20 p-4 rounded-xl border border-border mt-2">
                <Label className="text-xs mb-1.5 block text-primary font-semibold">
                  Valor do Sinal Pago Agora (R$)
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={totalFinal}
                  value={sinal}
                  onChange={(e) => setSinal(Number(e.target.value))}
                  className="h-11 font-bold text-lg text-emerald-600 bg-white"
                />
              </div>

              <div className="flex items-center justify-between bg-primary/5 p-3 rounded-lg border border-primary/10 mt-2">
                <span className="text-xs font-semibold text-primary">
                  Restante na Retirada
                </span>
                <span className="font-bold text-primary">
                  R${" "}
                  {restante.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <Button
              onClick={handleGerarContrato}
              disabled={saving || !eventoDate || !cpf || !endereco}
              className="w-full h-14 mt-8 text-base font-semibold shadow-md gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <FileSignature size={18} />{" "}
              {saving ? "A Processar..." : "Confirmar e Gerar Contrato"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
