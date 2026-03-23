import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// ISTO É A PEÇA CHAVE: Impede o Next.js de usar cache nesta API!
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const produtoId = searchParams.get("produtoId");

    if (!produtoId) {
      return NextResponse.json({ error: "Produto ID é obrigatório" }, { status: 400 });
    }

    // 1. Busca configurações com proteção contra erros
    let windowBefore = 3;
    let windowAfter = 3;
    try {
      const configRes: any = await query("SELECT * FROM configuracoes LIMIT 1");
      if (configRes && configRes.length > 0) {
        windowBefore = configRes[0].windowBefore !== undefined ? Number(configRes[0].windowBefore) : 3;
        windowAfter = configRes[0].windowAfter !== undefined ? Number(configRes[0].windowAfter) : 3;
      }
    } catch (e) {
      console.warn("Tabela de configurações não encontrada ou vazia. Usando padrão 3 dias.");
    }

    // 2. Busca quantidade física com proteção
    let quantidadeFisica = 1;
    try {
      const prodRes: any = await query("SELECT quantidade FROM produtos WHERE id = ?", [produtoId]);
      if (prodRes && prodRes.length > 0) {
        quantidadeFisica = Number(prodRes[0].quantidade) || 1;
      }
    } catch (e) {
      console.warn("Erro ao buscar quantidade física. Assumindo 1.");
    }

    // 3. Busca os contratos ativos (confirmado ou em_uso)
    const pedidosRes: any = await query(
      "SELECT id, eventoDate, itens FROM pedidos WHERE status IN ('confirmado', 'em_uso')"
    );

    const ocupacaoPorDia: Record<string, number> = {};

    pedidosRes.forEach((pedido: any) => {
      if (!pedido.eventoDate) return;
      
      let itens = [];
      try {
        itens = typeof pedido.itens === "string" ? JSON.parse(pedido.itens) : pedido.itens;
      } catch (e) { return; }

      // Garante que compara os IDs como texto para não haver falhas
      const qtdNestePedido = itens.filter((item: any) => String(item.id) === String(produtoId)).length;
      if (qtdNestePedido === 0) return;

      const dataEvento = new Date(pedido.eventoDate + "T12:00:00");
      
      const dataInicio = new Date(dataEvento);
      dataInicio.setDate(dataInicio.getDate() - windowBefore);
      
      const dataFim = new Date(dataEvento);
      dataFim.setDate(dataFim.getDate() + windowAfter);

      // Preenche dias (Formato YYYY-MM-DD forçado para evitar bugs de fuso horário)
      for (let d = new Date(dataInicio); d <= dataFim; d.setDate(d.getDate() + 1)) {
        const ano = d.getFullYear();
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const dia = String(d.getDate()).padStart(2, '0');
        const dateStr = `${ano}-${mes}-${dia}`;
        
        if (!ocupacaoPorDia[dateStr]) ocupacaoPorDia[dateStr] = 0;
        ocupacaoPorDia[dateStr] += qtdNestePedido;
      }
    });

    // 4. Retorna as datas bloqueadas
    const blockedDates = Object.keys(ocupacaoPorDia).filter(
      (date) => ocupacaoPorDia[date] >= quantidadeFisica
    );

    return NextResponse.json({ blockedDates, success: true });
  } catch (error: any) {
    console.error("Erro na API de Disponibilidade:", error);
    return NextResponse.json({ error: "Falha interna ao calcular datas.", det: error.message }, { status: 500 });
  }
}