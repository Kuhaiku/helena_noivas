import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// Interface para garantir a tipagem correta dos dados do produto no estoque
interface ProdutoEstoque {
  id: number;
  images: string;
  rentalPrice: number;
}

export async function GET() {
  try {
    // O índice idx_criado_em já existe no banco (conforme o erro 1061), 
    // o que resolve o problema de sort memory.
    const sql = `SELECT * FROM pedidos ORDER BY criado_em DESC`;
    const resultados: any = await query(sql);

    // Buscamos dados básicos dos produtos para completar as informações dos itens (como imagens)
    const produtosRaw: any = await query("SELECT id, images, rentalPrice FROM produtos");
    
    // Mapa tipado para busca rápida por ID
    const produtosMap = new Map<string, ProdutoEstoque>(
      produtosRaw.map((p: ProdutoEstoque) => [p.id.toString(), p])
    );

    const pedidosFormatados = resultados.map((p: any) => {
      const itensRaw = p.itens ? (typeof p.itens === "string" ? JSON.parse(p.itens) : p.itens) : [];
      
      // Recheia os itens com dados do estoque atual (evita salvar imagens pesadas no pedido)
      const itemsCompletos = itensRaw.map((item: any) => {
        const infoEstoque = produtosMap.get(item.id.toString());
        
        let imagens: string[] = [];
        try {
          if (infoEstoque?.images) {
            imagens = typeof infoEstoque.images === 'string' 
              ? JSON.parse(infoEstoque.images) 
              : infoEstoque.images;
          }
        } catch (e) { 
          imagens = []; 
        }

        return {
          ...item,
          image: item.image || imagens[0] || "/placeholder.jpg",
          price: item.price || infoEstoque?.rentalPrice || 0
        };
      });

      return {
        id: p.id.toString(),
        clientName: p.clientName,
        clientPhone: p.clientPhone,
        clientEmail: p.clientEmail,
        cpf: p.cpf || "",
        rg: p.rg || "",
        endereco: p.endereco || "",
        provaDate: p.provaDate,
        provaTime: p.provaTime,
        eventoDate: p.eventoDate || "",
        status: p.status,
        items: itemsCompletos,
        taxas: p.taxas ? (typeof p.taxas === "string" ? JSON.parse(p.taxas) : p.taxas) : [],
        contratoTexto: p.contrato_texto || "",
        totalValue: Number(p.totalValue) || 0,
        signalPaid: Number(p.signalPaid) || 0,
        createdAt: p.criado_em ? new Date(p.criado_em).toISOString() : "",
      };
    });

    return NextResponse.json(pedidosFormatados);
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    return NextResponse.json(
      { error: "Falha ao buscar pedidos" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const sql = `INSERT INTO pedidos (clientName, clientPhone, clientEmail, provaDate, provaTime, eventoDate, status, totalValue, itens) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    // Armazenamos o JSON simplificado (sem imagens base64) para manter a tabela leve
    const result: any = await query(sql, [
      data.clientName,
      data.clientPhone,
      data.clientEmail,
      data.provaDate,
      data.provaTime,
      data.eventoDate || "",
      "novo",
      data.totalValue || 0,
      JSON.stringify(data.items || []),
    ]);

    return NextResponse.json({ success: true, id: result.insertId.toString() });
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ success: false, message: "ID ausente" }, { status: 400 });

    const sql = `UPDATE pedidos SET 
      clientName = ?, clientPhone = ?, clientEmail = ?, cpf = ?, rg = ?, 
      endereco = ?, provaDate = ?, provaTime = ?, eventoDate = ?, 
      status = ?, totalValue = ?, signalPaid = ?, itens = ?, 
      taxas = ?, contrato_texto = ? 
      WHERE id = ?`;

    await query(sql, [
      data.clientName,
      data.clientPhone,
      data.clientEmail,
      data.cpf || "",
      data.rg || "",
      data.endereco || "",
      data.provaDate,
      data.provaTime,
      data.eventoDate || "",
      data.status,
      data.totalValue || 0,
      data.signalPaid || 0,
      JSON.stringify(data.items || []),
      JSON.stringify(data.taxas || []),
      data.contratoTexto || "",
      id,
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar pedido:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}