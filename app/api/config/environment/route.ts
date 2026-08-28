import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const REQUIRED_SERVER_VARS = [
  "DATABASE_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GEMINI_API_KEY",
  "GROQ_API_KEY",
  "GITHUB_TOKEN",
  "GITHUB_OWNER",
  "GITHUB_REPO",
  "GITHUB_BRANCH",
  "DEV_ASSISTANT_AUTO_APPLY",
] as const

const OPTIONAL_SERVER_VARS = [
  "BLOB_READ_WRITE_TOKEN",
  "SPEAKER_VERIFICATION_API_KEY",
  "SPEAKER_VERIFICATION_URL",
  "VERCEL_DEPLOY_HOOK_URL",
] as const

function status(name: string) {
  return { name, status: process.env[name]?.trim() ? "Configured" : "Missing" }
}

export async function GET() {
  const required = REQUIRED_SERVER_VARS.map(status)
  const optional = OPTIONAL_SERVER_VARS.map(status)

  return NextResponse.json(
    {
      serverSide: true,
      required,
      optional,
      secretsNeverReturned: true,
    },
    { headers: { "Cache-Control": "no-store" } },
  )
}
