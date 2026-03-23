import { NextRequest, NextResponse } from 'next/server'

const TESLA_FLEET_API = 'https://fleet-api.prd.na.vn.cloud.tesla.com/api/1/vehicles'

interface TeslaVehicle {
  id: number
  vehicle_id: number
  vin: string
  display_name: string
  state: string
  in_service: boolean
}

interface TeslaVehiclesResponse {
  response: TeslaVehicle[]
  count: number
}

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get('tesla_access_token')?.value

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated with Tesla' }, { status: 401 })
  }

  try {
    const res = await fetch(TESLA_FLEET_API, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('[Tesla Vehicles] API error:', errText)
      return NextResponse.json({ error: 'Tesla API error', detail: errText }, { status: res.status })
    }

    const data = await res.json() as TeslaVehiclesResponse

    const vehicles = (data.response || []).map((v) => ({
      id: v.id,
      vin: v.vin,
      display_name: v.display_name,
      state: v.state,
    }))

    return NextResponse.json({ vehicles, count: vehicles.length })
  } catch (err) {
    console.error('[Tesla Vehicles] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
