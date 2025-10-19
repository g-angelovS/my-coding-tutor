import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { message } = await req.json().catch(()=>({}))
  return NextResponse.json({
    reply: `✅ Server OK. I received: ${typeof message === 'string' ? message : '(no message)'}`
  }, { status: 200 })
}
