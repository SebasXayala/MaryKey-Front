import { NextResponse, type NextRequest } from "next/server";

/** Rutas que exigen sesión activa. */
const PROTECTED_ROUTES = ["/cuenta", "/pedidos", "/admin"];

/** Rutas que un usuario ya autenticado no debería volver a ver. */
const GUEST_ONLY_ROUTES = ["/login", "/registro"];

const SESSION_COOKIE = process.env.NEXT_PUBLIC_SESSION_COOKIE ?? "mk_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  if (GUEST_ONLY_ROUTES.some((route) => pathname.startsWith(route)) && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/cuenta";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico).*)"],
};
