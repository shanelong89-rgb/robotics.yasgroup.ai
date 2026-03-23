import { NextResponse } from 'next/server'

const TESLA_CLIENT_ID = '1ff02721-df22-42c3-a7c6-c50a6acf9aea'
const TESLA_REDIRECT_URI = 'https://robotics.yasgroup.ai/api/auth/tesla/callback'
const TESLA_AUTH_URL = 'https://fleet-auth.prd.vn.cloud.tesla.com/oauth2/v3/authorize'

export async function GET() {
  const state = crypto.randomUUID()

  const params = new URLSearchParams({
    client_id: TESLA_CLIENT_ID,
    redirect_uri: TESLA_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid vehicle_device_data vehicle_location offline_access',
    state,
  })

  const url = `${TESLA_AUTH_URL}?${params.toString()}`
  return NextResponse.redirect(url)
}
