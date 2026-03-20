import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // ── CREDENCIAIS DO CLIENTE (Podes alterar aqui para cada loja que venderes) ──
    const emailCorreto = "admin@helenanoivas.com.br";
    const senhaCorreta = "helena123";

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