import { NextRequest, NextResponse } from 'next/server'
import { callModel } from '../../../lib/model'
import { retrieveContext } from '../../../lib/retrieve'

const SYSTEM = `You are a patient coding tutor. Ask 1–2 clarifying questions, teach step-by-step, and end with a tiny practice challenge.`

export async function POST(req: NextRequest) {
  try {
    const { message = '', code = '', language = 'unknown' } = await req.json().catch(() => ({}))
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Missing message' }, { status: 200 })
    }
    const context = await retrieveContext(message)
    const user = `Question: ${message}\n\nCurrent ${language} code:\n${code || '(none)'}`
    const reply = await callModel({ system: SYSTEM, context, user })
    return NextResponse.json({ reply }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e || 'Unknown server error') }, { status: 200 })
  }
}
