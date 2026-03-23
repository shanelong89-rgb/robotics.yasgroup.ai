import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('Authorization') || ''
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: auth },
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Auth service unavailable' }, { status: 503 })
  }
}
