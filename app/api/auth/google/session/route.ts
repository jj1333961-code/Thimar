import { NextRequest, NextResponse } from "next/server"
import { session } from "../route"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const user = await session(request)
  return NextResponse.json({ authenticated: Boolean(user), user: user ? { email: user.email, name: user.name } : null }, { headers: { "cache-control": "no-store" } })
}
