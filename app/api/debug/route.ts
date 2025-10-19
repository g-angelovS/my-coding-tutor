import { NextResponse } from 'next/server'
export async function GET() {
  return NextResponse.json({
    hasKey: !!process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free',
    env: process.env.VERCEL_ENV || 'local'
  })
}
