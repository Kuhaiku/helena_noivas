import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Procura o "carimbo" de acesso do administrador
  const session = request.cookies.get('admin_session')

  // Se a pessoa tentar aceder a qualquer página dentro do /admin...
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // ...e não tiver o carimbo, é enviada para o /login
    if (!session || session.value !== 'autenticado_helena_erp') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

// Configura o porteiro para vigiar apenas as rotas de administração
export const config = {
  matcher: ['/admin/:path*'],
}