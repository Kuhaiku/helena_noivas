import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Procura o "carimbo" de acesso do administrador
  const session = request.cookies.get('admin_session')
  
  // A fechadura oficial que está no teu .env
  const expectedValue = process.env.NEXT_PUBLIC_AUTH_COOKIE_VALUE

  // Se a pessoa tentar aceder a qualquer página dentro do /admin...
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // ...e não tiver o carimbo, ou o carimbo for diferente do .env, vai para a rua
    if (!session || session.value !== expectedValue) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

// Configura o porteiro para vigiar apenas as rotas de administração
export const config = {
  matcher: ['/admin/:path*'],
}