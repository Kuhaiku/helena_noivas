import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const sql = `SELECT * FROM financeiro ORDER BY data_pagamento DESC, id DESC`;
    const resultados: any = await query(sql);
    
    const transacoes = resultados.map((t: any) => ({
      id: t.id.toString(),
      type: t.tipo,
      description: t.descricao,
      amount: Number(t.valor),
      date: t.data_pagamento ? new Date(t.data_pagamento).toISOString().split('T')[0] : "",
      category: t.categoria || "",
      orderId: t.pedido_id || undefined,
      createdAt: t.criado_em ? new Date(t.criado_em).toISOString() : ""
    }));
    return NextResponse.json(transacoes);
  } catch (error) {
    return NextResponse.json({ error: "Falha ao buscar financeiro" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const sql = `
      INSERT INTO financeiro (tipo, descricao, valor, data_pagamento, categoria, pedido_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result: any = await query(sql, [
      data.type, data.description, data.amount, data.date, data.category || 'Geral', data.orderId || null
    ]);
    
    return NextResponse.json({ success: true, id: result.insertId.toString() });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await query(`DELETE FROM financeiro WHERE id = ?`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}