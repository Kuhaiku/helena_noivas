import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // ── CREDENCIAIS ESTRITAS VIA VARIÁVEIS DE AMBIENTE ──
    const emailCorreto = process.env.ADMIN_EMAIL;
    const senhaCorreta = process.env.ADMIN_PASSWORD;
    const sessionValue = process.env.NEXT_PUBLIC_AUTH_COOKIE_VALUE;
  
    // Verificação de segurança: Se o dono esquecer de configurar o .env, o sistema bloqueia
    if (!emailCorreto || !senhaCorreta || !sessionValue) {
      console.error("CRÍTICO: Variáveis de ambiente de autenticação ausentes!");
      return NextResponse.json({ success: false, message: "Erro de configuração no servidor." }, { status: 500 });
    }

    if (email === emailCorreto && password === senhaCorreta) {
      const response = NextResponse.json({ success: true });
      
      // Cria um cookie criptografado. O TypeScript agora não dá erro porque o 'if' acima garantiu que sessionValue existe.
      response.cookies.set({
        name: "admin_session",
        value: sessionValue,
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