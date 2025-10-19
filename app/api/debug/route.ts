import { NextResponse } from 'next/server'

export async function GET() {
  const hasKey = !!process.env.OPENROUTER_API_KEY
  const model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free'
  const env = process.env.VERCEL_ENV || 'local'
  return NextResponse.json({ hasKey, model, env })
}
