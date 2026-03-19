import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const resultados: any = await query(`SELECT * FROM colecoes ORDER BY id DESC`);
    const colecoes = resultados.map((c: any) => {
      
      // Proteção garantida para o Array de Produtos
      let parsedIds = [];
      try {
        if (typeof c.produtos_ids === 'string') {
          parsedIds = JSON.parse(c.produtos_ids || "[]");
        } else if (Array.isArray(c.produtos_ids)) {
          parsedIds = c.produtos_ids;
        }
      } catch (e) {
        parsedIds = [];
      }

      return {
        id: c.id.toString(),
        name: c.nome,
        description: c.descricao || "",
        productIds: Array.isArray(parsedIds) ? parsedIds : [],
        active: Boolean(c.ativa),
        createdAt: ""
      };
    });
    return NextResponse.json(colecoes);
  } catch (error) {
    return NextResponse.json({ error: "Falha ao buscar colecoes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const result: any = await query(
      `INSERT INTO colecoes (nome, descricao, produtos_ids, ativa) VALUES (?, ?, ?, ?)`,
      [data.name, data.description, JSON.stringify(data.productIds || []), data.active ? 1 : 0]
    );
    return NextResponse.json({ success: true, id: result.insertId.toString() });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (data.active) {
      await query(`UPDATE colecoes SET ativa = 0`);
      await query(`UPDATE colecoes SET ativa = 1 WHERE id = ?`, [id]);
    } else {
      await query(
        `UPDATE colecoes SET nome = ?, descricao = ?, produtos_ids = ? WHERE id = ?`,
        [data.name, data.description, JSON.stringify(data.productIds || []), id]
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await query(`DELETE FROM colecoes WHERE id = ?`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}