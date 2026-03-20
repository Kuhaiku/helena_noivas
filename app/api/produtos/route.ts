import { NextResponse } from "next/server";
import { query } from "@/lib/db";

async function uploadImagemParaCloudinary(imagemBase64OuUrl: string) {
  return imagemBase64OuUrl;
}

// ─── FUNÇÃO INTELIGENTE PARA AUTO-CRIAR COLEÇÕES ───
async function gerenciarColecao(
  produtoId: string | number,
  nomeColecao: string,
) {
  const pIdStr = produtoId.toString();

  // 1. Remove o produto de TODAS as coleções que não sejam a atual
  const todasCol: any = await query(
    `SELECT id, nome, produtos_ids FROM colecoes`,
  );
  for (const col of todasCol) {
    if (nomeColecao && col.nome === nomeColecao.trim()) continue;

    let ids = [];
    try {
      ids =
        typeof col.produtos_ids === "string"
          ? JSON.parse(col.produtos_ids)
          : col.produtos_ids;
    } catch (e) {}
    if (!Array.isArray(ids)) ids = [];

    if (ids.includes(pIdStr)) {
      const novasIds = ids.filter((id: string) => id !== pIdStr);
      await query(`UPDATE colecoes SET produtos_ids = ? WHERE id = ?`, [
        JSON.stringify(novasIds),
        col.id,
      ]);
    }
  }

  if (!nomeColecao || nomeColecao.trim() === "") return;
  const nomeLimpo = nomeColecao.trim();

  // 3. Procura se a coleção já existe
  const colRes: any = await query(
    `SELECT id, produtos_ids FROM colecoes WHERE nome = ?`,
    [nomeLimpo],
  );

  if (colRes.length > 0) {
    const colId = colRes[0].id;
    let ids = [];
    try {
      ids =
        typeof colRes[0].produtos_ids === "string"
          ? JSON.parse(colRes[0].produtos_ids)
          : colRes[0].produtos_ids;
    } catch (e) {}
    if (!Array.isArray(ids)) ids = [];

    if (!ids.includes(pIdStr)) {
      ids.push(pIdStr);
      await query(`UPDATE colecoes SET produtos_ids = ? WHERE id = ?`, [
        JSON.stringify(ids),
        colId,
      ]);
    }
  } else {
    await query(
      `INSERT INTO colecoes (nome, descricao, produtos_ids, ativa) VALUES (?, ?, ?, ?)`,
      [nomeLimpo, "", JSON.stringify([pIdStr]), 0],
    );
  }
}

export async function GET() {
  try {
    const sqlProdutos = `SELECT * FROM produtos ORDER BY criado_em DESC`;
    const produtos: any = await query(sqlProdutos);

    const sqlImagens = `SELECT * FROM produto_imagens`;
    const imagens: any = await query(sqlImagens);

    const produtosFormatados = produtos.map((p: any) => {
      const fotosDoProduto = imagens
        .filter((img: any) => img.produto_id === p.id)
        .map((img: any) => img.url);

      const placeholder = "/images/placeholder.png";

      return {
        id: p.id.toString(),
        name: p.nome_modelo,
        description: p.descricao || "",
        category: p.categoria || "noiva",
        collection: p.colecao || "",
        sku: p.sku || "",
        size: p.tamanho || "",
        color: p.cor || "",
        condition: p.condicao || "nova",
        stock: p.status_estoque || "livre",
        quantity: Number(p.quantidade) || 1,
        rentalPrice: Number(p.preco_aluguel) || 0,
        salePrice: p.preco_venda ? Number(p.preco_venda) : undefined,
        showPrice: Boolean(p.exibir_valor),
        featured: Boolean(p.destaque),
        hidden: Boolean(p.oculto),
        images: fotosDoProduto.length > 0 ? fotosDoProduto : [placeholder],
        maintenanceNotes: p.notas_manutencao || "",
        createdAt: p.criado_em
          ? new Date(p.criado_em).toISOString().split("T")[0]
          : "",
      };
    });

    return NextResponse.json(produtosFormatados);
  } catch (error) {
    return NextResponse.json(
      { error: "Falha ao buscar no banco" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const sql = `
      INSERT INTO produtos (
        nome_modelo, descricao, categoria, colecao, sku, tamanho, cor, condicao, status_estoque,
        quantidade, preco_aluguel, preco_venda, exibir_valor, destaque, oculto, notas_manutencao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result: any = await query(sql, [
      data.name ?? null,
      data.description ?? null,
      data.category || "noiva",
      data.collection ?? null,
      data.sku ?? null,
      data.size ?? null,
      data.color ?? null,
      data.condition || "nova",
      data.stock || "livre",
      data.quantity || 1,
      data.rentalPrice || 0,
      data.salePrice ?? null,
      data.showPrice ? 1 : 0,
      data.featured ? 1 : 0,
      data.hidden ? 1 : 0,
      data.maintenanceNotes ?? null,
    ]);

    const produtoId = result.insertId;

    if (data.images && data.images.length > 0) {
      for (const imgUrl of data.images) {
        let finalUrl = imgUrl;
        if (imgUrl.startsWith("data:image"))
          finalUrl = await uploadImagemParaCloudinary(imgUrl);
        await query(
          `INSERT INTO produto_imagens (produto_id, url) VALUES (?, ?)`,
          [produtoId, finalUrl],
        );
      }
    }

    await gerenciarColecao(produtoId, data.collection);

    return NextResponse.json({ success: true, produtoId: produtoId });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });

    // BUSCA O PRODUTO EXISTENTE PARA NÃO APAGAR INFORMAÇÕES NÃO ENVIADAS (Atualização Parcial)
    const produtosExistentes: any = await query(
      `SELECT * FROM produtos WHERE id = ?`,
      [id],
    );
    if (produtosExistentes.length === 0)
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 },
      );
    const p = produtosExistentes[0];

    const sql = `
      UPDATE produtos SET 
        nome_modelo = ?, descricao = ?, categoria = ?, colecao = ?, sku = ?, tamanho = ?, cor = ?, condicao = ?, status_estoque = ?,
        quantidade = ?, preco_aluguel = ?, preco_venda = ?, exibir_valor = ?, destaque = ?, oculto = ?, notas_manutencao = ?
      WHERE id = ?
    `;

    await query(sql, [
      data.name !== undefined ? data.name : p.nome_modelo,
      data.description !== undefined ? data.description : p.descricao,
      data.category !== undefined ? data.category : p.categoria,
      data.collection !== undefined ? data.collection : p.colecao,
      data.sku !== undefined ? data.sku : p.sku,
      data.size !== undefined ? data.size : p.tamanho,
      data.color !== undefined ? data.color : p.cor,
      data.condition !== undefined ? data.condition : p.condicao,
      data.stock !== undefined ? data.stock : p.status_estoque,
      data.quantity !== undefined ? data.quantity : p.quantidade,
      data.rentalPrice !== undefined ? data.rentalPrice : p.preco_aluguel,
      data.salePrice !== undefined ? data.salePrice : p.preco_venda,
      data.showPrice !== undefined ? (data.showPrice ? 1 : 0) : p.exibir_valor,
      data.featured !== undefined ? (data.featured ? 1 : 0) : p.destaque,
      data.hidden !== undefined ? (data.hidden ? 1 : 0) : p.oculto,
      data.maintenanceNotes !== undefined
        ? data.maintenanceNotes
        : p.notas_manutencao,
      id,
    ]);

    // SÓ ATUALIZA AS IMAGENS SE ELAS FOREM ENVIADAS NO PEDIDO
    if (data.images !== undefined) {
      await query(`DELETE FROM produto_imagens WHERE produto_id = ?`, [id]);

      if (data.images.length > 0) {
        for (const imgUrl of data.images) {
          // Ignora o salvamento caso a imagem enviada seja apenas o placeholder temporário
          if (imgUrl && !imgUrl.includes("placeholder")) {
            let finalUrl = imgUrl;
            if (imgUrl.startsWith("data:image"))
              finalUrl = await uploadImagemParaCloudinary(imgUrl);
            await query(
              `INSERT INTO produto_imagens (produto_id, url) VALUES (?, ?)`,
              [id, finalUrl],
            );
          }
        }
      }
    }

    // Só atualiza a coleção se o campo tiver sido enviado
    if (data.collection !== undefined) {
      await gerenciarColecao(id as string, data.collection);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro no PUT Produtos: ", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    await query(`DELETE FROM produtos WHERE id = ?`, [id]);

    await gerenciarColecao(id as string, "");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
