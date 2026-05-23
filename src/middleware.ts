import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host');

  // If request is made to the mail subdomain, redirect it to the main canonical domain.
  if (host === 'mail.trohoalac.com') {
    url.host = 'trohoalac.com';
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - favicon.png (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|favicon.png).*)',
  ],
};
