import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const resultados: any = await query(`SELECT * FROM categorias ORDER BY id ASC`);
    const categorias = resultados.map((c: any) => ({
      id: c.id.toString(),
      name: c.nome,
      slug: c.slug
    }));
    return NextResponse.json(categorias);
  } catch (error) {
    return NextResponse.json({ error: "Falha ao buscar no banco" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const result: any = await query(`INSERT INTO categorias (nome, slug) VALUES (?, ?)`, [data.name, slug]);
    return NextResponse.json({ success: true, id: result.insertId.toString(), slug });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    await query(`UPDATE categorias SET nome = ?, slug = ? WHERE id = ?`, [data.name, slug, id]);
    return NextResponse.json({ success: true, slug });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await query(`DELETE FROM categorias WHERE id = ?`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}