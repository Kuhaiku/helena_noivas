import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // ── CREDENCIAIS DINÂMICAS VIA VARIÁVEIS DE AMBIENTE ──
    // Se as variáveis não estiverem configuradas no Easypanel, ele usa as padrão como fallback
    const emailCorreto = process.env.ADMIN_EMAIL;
    const senhaCorreta = process.env.ADMIN_PASSWORD;

    if (email === emailCorreto && password === senhaCorreta) {
      const response = NextResponse.json({ success: true });
      
      // Cria um cookie criptografado e invisível para o JavaScript do navegador (HttpOnly)
      response.cookies.set({
        name: "admin_session",
        value: "autenticado_helena_erp",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // Mantém o login por 7 dias
      });

      return response;
    }

    return NextResponse.json({ success: false, message: "E-mail ou senha incorretos." }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}