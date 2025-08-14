import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { baseSystemPrompt, buildUserPrompt } from '@/lib/prompt'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { channel, incoming, sender, company, style } = body || {}
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 400 })
    }
    if (!incoming || !channel) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const sys = baseSystemPrompt(company || {})
    const user = buildUserPrompt({ channel, incoming, sender, style })
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'

    const completion = await client.chat.completions.create({
      model,
      temperature: 0.4,
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: user }
      ]
    })
    const raw = completion.choices?.[0]?.message?.content?.trim() || ''
    // Try parse JSON; fall back to simple object
    let parsed: any = null
    try { parsed = JSON.parse(raw) } catch { parsed = { body: raw, subject: 'Re: Your message', message: raw } }

    return NextResponse.json({ ok: true, data: parsed })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}
