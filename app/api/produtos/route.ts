import { NextResponse } from "next/server";
import { query } from "@/lib/db";

async function uploadImagemParaCloudinary(imagemBase64OuUrl: string) {
  // TODO: FASE 3 - Implementar SDK do Cloudinary aqui.
  return imagemBase64OuUrl;
}

export async function GET() {
  try {
    const sql = `SELECT * FROM produtos ORDER BY criado_em DESC`;
    const resultados: any = await query(sql);
    
    const produtosFormatados = resultados.map((p: any) => ({
      id: p.id.toString(),
      name: p.nome_modelo,
      description: p.descricao || "",
      category: p.categoria || "noiva",
      collection: "", 
      sku: "SKU-TEMP", 
      size: "Único", 
      color: "Branco",
      condition: "nova",
      stock: "livre",
      rentalPrice: Number(p.preco_aluguel),
      salePrice: p.preco_venda ? Number(p.preco_venda) : undefined,
      showPrice: Boolean(p.exibir_valor),
      featured: Boolean(p.destaque),
      hidden: false,
      images: p.foto_principal ? [p.foto_principal] : ["/images/vestido-aurora.jpg"],
      maintenanceNotes: "",
      createdAt: new Date(p.criado_em).toISOString().split('T')[0]
    }));

    return NextResponse.json(produtosFormatados);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return NextResponse.json({ error: "Falha ao buscar no banco" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    let fotoCapaUrl = null;
    if (data.images && data.images.length > 0) {
      fotoCapaUrl = await uploadImagemParaCloudinary(data.images[0]);
    }

    const sql = `
      INSERT INTO produtos (nome_modelo, descricao, categoria, foto_principal, preco_aluguel, exibir_valor, destaque) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result: any = await query(sql, [
      data.name, 
      data.description, 
      data.category, 
      fotoCapaUrl, 
      data.rentalPrice, 
      data.showPrice ? 1 : 0, 
      data.featured ? 1 : 0
    ]);

    return NextResponse.json({ success: true, produtoId: result.insertId });
  } catch (error) {
    console.error("Erro ao salvar produto:", error);
    return NextResponse.json({ success: false, error: "Falha ao gravar no banco" }, { status: 500 });
  }
}

// ─── APAGAR UM PRODUTO (DELETE) ───────────────────────────────────────────────
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: "ID não fornecido" }, { status: 400 });

    const sql = `DELETE FROM produtos WHERE id = ?`;
    await query(sql, [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    return NextResponse.json({ success: false, error: "Falha ao deletar no banco" }, { status: 500 });
  }
}

// ─── ATUALIZAR UM PRODUTO (PUT) ───────────────────────────────────────────────
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: "ID não fornecido" }, { status: 400 });

    let fotoCapaUrl = data.images && data.images.length > 0 ? data.images[0] : null;

    // Apenas faz upload se a imagem for nova (Base64)
    if (fotoCapaUrl && fotoCapaUrl.startsWith('data:image')) {
      fotoCapaUrl = await uploadImagemParaCloudinary(fotoCapaUrl);
    }

    const sql = `
      UPDATE produtos 
      SET nome_modelo = ?, descricao = ?, categoria = ?, foto_principal = ?, 
          preco_aluguel = ?, exibir_valor = ?, destaque = ?
      WHERE id = ?
    `;
    
    await query(sql, [
      data.name, 
      data.description, 
      data.category, 
      fotoCapaUrl, 
      data.rentalPrice, 
      data.showPrice ? 1 : 0, 
      data.featured ? 1 : 0,
      id
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return NextResponse.json({ success: false, error: "Falha ao gravar no banco" }, { status: 500 });
  }
}