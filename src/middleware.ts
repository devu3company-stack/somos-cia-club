import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    // Public routes - no auth required
    const publicRoutes = ['/login', '/cadastro', '/cadastro-parceiro', '/recuperar-senha', '/api/auth']
    const isPublic = publicRoutes.some(route => pathname.startsWith(route))
    const isApi = pathname.startsWith('/api/')
    const isRoot = pathname === '/'

    if (isPublic || isRoot || (isApi && !pathname.startsWith('/api/protected'))) {
        return NextResponse.next()
    }

    const session = await getSessionFromRequest(req)

    if (!session) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    // Role-based access control
    if (pathname.startsWith('/admin') && session.role !== 'admin') {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    if (pathname.startsWith('/partner') && session.role !== 'partner') {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    if (pathname.startsWith('/dashboard') || pathname.startsWith('/carteira') || pathname.startsWith('/cupons') || pathname.startsWith('/premios') || pathname.startsWith('/perfil')) {
        if (session.role !== 'resident') {
            return NextResponse.redirect(new URL('/login', req.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth|api/seed|api/webhook).*)',
    ],
}
