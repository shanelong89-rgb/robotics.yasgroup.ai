import { NextRequest, NextResponse } from 'next/server'

const TESLA_CLIENT_ID = process.env.TESLA_CLIENT_ID || '1ff02721-df22-42c3-a7c6-c50a6acf9aea'
const TESLA_CLIENT_SECRET = process.env.TESLA_CLIENT_SECRET || ''
const TESLA_REDIRECT_URI = process.env.TESLA_REDIRECT_URI || `${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/auth/tesla/callback`
const TESLA_TOKEN_URL = 'https://fleet-auth.prd.vn.cloud.tesla.com/oauth2/v3/token'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/connect/tesla?error=${encodeURIComponent(error || 'no_code')}`, req.url)
    )
  }

  try {
    const tokenRes = await fetch(TESLA_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: TESLA_CLIENT_ID,
        client_secret: TESLA_CLIENT_SECRET,
        code,
        redirect_uri: TESLA_REDIRECT_URI,
      }),
    })

    if (!tokenRes.ok) {
      const errText = await tokenRes.text()
      console.error('[Tesla OAuth] Token exchange failed:', errText)
      return NextResponse.redirect(new URL('/connect/tesla?error=token_exchange_failed', req.url))
    }

    const tokens = await tokenRes.json() as {
      access_token: string
      refresh_token: string
      expires_in?: number
    }

    const response = NextResponse.redirect(new URL('/connect/tesla?connected=1', req.url))

    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    }

    response.cookies.set('tesla_access_token', tokens.access_token, {
      ...cookieOpts,
      maxAge: tokens.expires_in || 3600,
    })

    response.cookies.set('tesla_refresh_token', tokens.refresh_token, {
      ...cookieOpts,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return response
  } catch (err) {
    console.error('[Tesla OAuth] Callback error:', err)
    return NextResponse.redirect(new URL('/connect/tesla?error=server_error', req.url))
  }
}
