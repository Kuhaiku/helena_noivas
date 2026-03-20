import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const sql = `SELECT * FROM pedidos ORDER BY criado_em DESC`;
    const resultados: any = await query(sql);

    const pedidosFormatados = resultados.map((p: any) => ({
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
      items: p.itens
        ? typeof p.itens === "string"
          ? JSON.parse(p.itens)
          : p.itens
        : [],
      taxas: p.taxas
        ? typeof p.taxas === "string"
          ? JSON.parse(p.taxas)
          : p.taxas
        : [],
      contratoTexto: p.contrato_texto || "",
      totalValue: Number(p.totalValue) || 0,
      signalPaid: Number(p.signalPaid) || 0,
      createdAt: p.criado_em ? new Date(p.criado_em).toISOString() : "",
    }));
    return NextResponse.json(pedidosFormatados);
  } catch (error) {
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
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const sql = `UPDATE pedidos SET clientName = ?, clientPhone = ?, clientEmail = ?, cpf = ?, rg = ?, endereco = ?, provaDate = ?, provaTime = ?, eventoDate = ?, status = ?, totalValue = ?, signalPaid = ?, itens = ?, taxas = ?, contrato_texto = ? WHERE id = ?`;

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
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
  