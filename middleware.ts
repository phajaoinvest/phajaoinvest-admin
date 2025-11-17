import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow login page to be accessed without authentication
  if (pathname === '/login') {
    return NextResponse.next()
  }

  // For dashboard routes, authentication is handled client-side with Zustand
  // In production, you'd validate tokens here
  if (pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.*|apple-icon.*).*)'],
}
