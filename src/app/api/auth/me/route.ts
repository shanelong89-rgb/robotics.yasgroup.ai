import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('yas_token')?.value ||
    req.headers.get('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  return NextResponse.json({
    email: 'admin@yas.io',
    name: 'Admin',
    role: 'admin',
  })
}
