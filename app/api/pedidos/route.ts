import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// ─── ESTRUTURA FUTURA: CLOUDINARY ─────────────────────────────────────────────
// No futuro, quando instalares a biblioteca do Cloudinary, vais substituir o interior 
// desta função para receber a imagem em Base64 e devolver o URL seguro gerado por eles.
async function uploadImagemParaCloudinary(imagemBase64OuUrl: string) {
  // TODO: FASE 3 - Implementar SDK do Cloudinary aqui.
  // Exemplo de como ficará o teu código no futuro:
  //
  // const uploadResponse = await cloudinary.uploader.upload(imagemBase64OuUrl, { 
  //   folder: 'helena_noivas_catalogo' 
  // });
  // return uploadResponse.secure_url;

  // Por enquanto, como ainda estamos na Fase 2, apenas retornamos a string 
  // original (que no teu teste agora será aquele caminho '/images/vestido-aurora.jpg')
  return imagemBase64OuUrl;
}

// ─── LER OS PRODUTOS (GET) ────────────────────────────────────────────────────
export async function GET() {
  try {
    const sql = `SELECT * FROM produtos ORDER BY criado_em DESC`;
    const resultados: any = await query(sql);
    
    // Formata para o padrão exato que o teu Zustand (AdminStore) usa
    const produtosFormatados = resultados.map((p: any) => ({
      id: p.id.toString(),
      name: p.nome_modelo,
      description: p.descricao || "",
      category: p.categoria || "noiva",
      collection: "", 
      sku: "SKU-TEMP", // Na próxima fase vamos fazer o JOIN com a tabela de SKUs
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

// ─── SALVAR UM NOVO PRODUTO (POST) ────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // 1. Processa a imagem (Passando pela nossa função estruturada para o Cloudinary)
    let fotoCapaUrl = null;
    if (data.images && data.images.length > 0) {
      // Pega a primeira foto do array que o painel enviou
      fotoCapaUrl = await uploadImagemParaCloudinary(data.images[0]);
    }

    // 2. Insere os dados de texto e o URL da imagem na tabela de produtos
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