import { NextRequest, NextResponse } from 'next/server'
import { callModel } from '@/lib/model'
import { retrieveContext } from '@/lib/retrieve'

const SYSTEM = `You are a patient coding tutor. Ask 1–2 clarifying questions, teach step-by-step, and end with an optional challenge.`

export async function POST(req: NextRequest) {
  try {
    const { message, code, language } = await req.json()
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 })
    }
    const context = await retrieveContext(message)
    const user = `Question: ${message}\n\nCurrent ${language || 'unknown'} code:\n${code || '(none)'}`
    const reply = await callModel({ system: SYSTEM, context, user })
    return NextResponse.json({ reply })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 })
  }
}
