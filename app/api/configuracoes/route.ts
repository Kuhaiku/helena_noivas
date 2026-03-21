import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const resultados: any = await query(`SELECT * FROM configuracoes WHERE id = 1`);
    
    if (resultados.length > 0) {
      const row = resultados[0];
      return NextResponse.json({
        windowBefore: row.window_before,
        windowAfter: row.window_after,
        provadores: row.provadores,
        sinalPercentage: row.sinal_percentage,
        businessHours: typeof row.business_hours === 'string' ? JSON.parse(row.business_hours) : row.business_hours,
        contratoTemplate: row.contratoTemplate // <-- ADICIONADO: Lê o texto do contrato
      });
    }
    
    return NextResponse.json({ error: "Configurações não encontradas" }, { status: 404 });
  } catch (error) {
    console.error("Erro ao buscar configuracoes:", error);
    return NextResponse.json({ error: "Falha ao buscar no banco" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    
    const sql = `
      UPDATE configuracoes 
      SET window_before = ?, window_after = ?, provadores = ?, sinal_percentage = ?, business_hours = ?, contratoTemplate = ? 
      WHERE id = 1
    `; // <-- ADICIONADO: Prepara a atualização do campo contratoTemplate
    
    await query(sql, [
      data.windowBefore,
      data.windowAfter,
      data.provadores,
      data.sinalPercentage,
      JSON.stringify(data.businessHours), // Salva o array de horários como JSON no banco
      data.contratoTemplate // <-- ADICIONADO: Envia o texto escrito para o SQL
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar configuracoes:", error);
    return NextResponse.json({ success: false, error: "Falha ao gravar no banco" }, { status: 500 });
  }
}