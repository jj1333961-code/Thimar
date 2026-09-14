import { NextRequest, NextResponse } from "next/server"

const OLD_HOST = "teacher.vercel.app"
const CANONICAL_ORIGIN = "https://teacher-three-ashen.vercel.app"

export function proxy(request: NextRequest) {
  if (request.nextUrl.hostname !== OLD_HOST) return NextResponse.next()

  const target = new URL(request.nextUrl.pathname + request.nextUrl.search, CANONICAL_ORIGIN)
  return NextResponse.redirect(target, 308)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
