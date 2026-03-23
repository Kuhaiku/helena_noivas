import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // 1. Busca todos os pedidos (sem ORDER BY para evitar o erro de memória)
    const sql = `SELECT * FROM pedidos`;
    const resultados: any = await query(sql);

    // 2. Ordena os pedidos com JavaScript
    resultados.sort((a: any, b: any) => {
      const dataA = a.criado_em ? new Date(a.criado_em).getTime() : 0;
      const dataB = b.criado_em ? new Date(b.criado_em).getTime() : 0;
      return dataB - dataA;
    });

    // 3. Busca os produtos e as imagens usando os nomes reais das tabelas e colunas
    const produtosRaw: any = await query("SELECT id, preco_aluguel FROM produtos");
    const imagensRaw: any = await query("SELECT produto_id, url FROM produto_imagens");

    // 4. Cria o mapa cruzando os produtos com as suas imagens
    const produtosMap = new Map();
    produtosRaw.forEach((p: any) => {
      const fotosDoProduto = imagensRaw
        .filter((img: any) => img.produto_id === p.id)
        .map((img: any) => img.url);

      produtosMap.set(p.id.toString(), {
        rentalPrice: Number(p.preco_aluguel) || 0,
        images: fotosDoProduto.length > 0 ? fotosDoProduto : ["/placeholder.jpg"]
      });
    });

    const pedidosFormatados = resultados.map((p: any) => {
      const itensRaw = p.itens ? (typeof p.itens === "string" ? JSON.parse(p.itens) : p.itens) : [];
      
      const itemsCompletos = itensRaw.map((item: any) => {
        const infoEstoque = produtosMap.get(item.id.toString());
        
        return {
          ...item,
          image: item.image || infoEstoque?.images[0] || "/placeholder.jpg",
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
    
    // Armazenamos o JSON simplificado para manter o banco leve
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

    // Usamos LAST_INSERT_ID() para pegar o ID correto da inserção no MySQL
    const lastId: any = await query("SELECT LAST_INSERT_ID() as id");
    return NextResponse.json({ success: true, id: lastId[0].id.toString() });
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