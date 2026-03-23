import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

const API_BASE = process.env.NEXT_PUBLIC_API_URL

const DEMO_USERS: Record<string, { password: string; name: string; role: string }> = {
  'admin@yas.io': { password: 'demo1234', name: 'Admin', role: 'admin' },
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body as { email?: string; password?: string }

    if (API_BASE) {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        return NextResponse.json(data, { status: res.status })
      }
      return NextResponse.json(data, { status: 200 })
    }

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const user = DEMO_USERS[email.toLowerCase()]
    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = randomBytes(32).toString('hex')

    return NextResponse.json({
      accessToken: token,
      user: { email: email.toLowerCase(), name: user.name, role: user.role },
    }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Auth service unavailable' }, { status: 503 })
  }
}
