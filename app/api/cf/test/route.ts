import { NextResponse } from "next/server"
import { cfTestConnection, cfGetUserInfo } from "@/lib/codeforces-api"

export async function GET() {
  try {
    // Test connection with API credentials
    const isConnected = await cfTestConnection()
    
    if (!isConnected) {
      return NextResponse.json({
        status: 'error',
        message: 'Failed to connect to Codeforces API',
        credentials: {
          hasApiKey: !!process.env.CODEFORCES_API_KEY,
          hasApiSecret: !!process.env.CODEFORCES_API_SECRET
        }
      }, { status: 500 })
    }

    // Test with a specific user to verify API is working
    const testResponse = await cfGetUserInfo('tourist')
    
    return NextResponse.json({
      status: 'success',
      message: 'Codeforces API connection successful',
      credentials: {
        hasApiKey: !!process.env.CODEFORCES_API_KEY,
        hasApiSecret: !!process.env.CODEFORCES_API_SECRET,
        authenticated: true
      },
      testUser: testResponse.status === 'OK' && 'result' in testResponse ? testResponse.result?.[0]?.handle : null
    })

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Error testing Codeforces API',
      error: error instanceof Error ? error.message : 'Unknown error',
      credentials: {
        hasApiKey: !!process.env.CODEFORCES_API_KEY,
        hasApiSecret: !!process.env.CODEFORCES_API_SECRET
      }
    }, { status: 500 })
  }
}
