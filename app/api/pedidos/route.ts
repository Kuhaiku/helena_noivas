import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// ─── SALVAR UM NOVO PEDIDO (POST) - Chamado pelo Checkout da Noiva ─────────
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, whatsapp, date, time } = data;

    // Insere o agendamento na tabela de pedidos do MySQL com o status 'novo'
    const sql = `
      INSERT INTO pedidos (cliente_nome, cliente_telefone, data_prova, horario_prova, status) 
      VALUES (?, ?, ?, ?, 'novo')
    `;
    
    const result: any = await query(sql, [name, whatsapp, date, time]);

    return NextResponse.json({ success: true, pedidoId: result.insertId });
  } catch (error) {
    console.error("Erro ao salvar pedido:", error);
    return NextResponse.json({ success: false, error: "Falha ao gravar no banco" }, { status: 500 });
  }
}

// ─── LER OS PEDIDOS (GET) - Chamado pelo Painel Admin para montar a Agenda ──
export async function GET() {
  try {
    // Busca os pedidos ordenados pelos mais recentes
    const sql = `SELECT * FROM pedidos ORDER BY criado_em DESC`;
    const resultados: any = await query(sql);
    
    // Traduz do formato do MySQL para o formato que o Zustand (AdminStore) usa
    const pedidosFormatados = resultados.map((p: any) => ({
      id: p.id.toString(),
      clientName: p.cliente_nome,
      clientPhone: p.cliente_telefone,
      clientEmail: "Sem email",
      // Converte a data do banco para o formato "YYYY-MM-DD" que o teu calendário usa
      provaDate: new Date(p.data_prova).toISOString().split('T')[0],
      // Pega apenas as horas e minutos (ex: "14:00")
      provaTime: p.horario_prova ? p.horario_prova.substring(0, 5) : "00:00",
      // Converte "Novo" para "novo" (para a cor da badge funcionar)
      status: p.status.toLowerCase(), 
      items: [], // Na próxima etapa vamos puxar os SKUs dos vestidos aqui dentro!
      totalValue: Number(p.valor_total) || 0,
      signalPaid: Number(p.valor_sinal_pago) || 0,
      createdAt: p.criado_em ? new Date(p.criado_em).toISOString() : new Date().toISOString()
    }));

    return NextResponse.json(pedidosFormatados);
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    return NextResponse.json({ error: "Falha ao buscar no banco" }, { status: 500 });
  }
}