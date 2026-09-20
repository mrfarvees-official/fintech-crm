import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login"];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get("session")?.value);
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  if (!isPublic && !hasSession)
    return NextResponse.redirect(new URL("/login", request.url));
  if (isPublic && hasSession)
    return NextResponse.redirect(new URL("/", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
