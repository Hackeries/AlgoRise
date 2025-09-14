import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    status: 'OK',
    message: 'Test endpoint working',
    timestamp: new Date().toISOString()
  })
}
