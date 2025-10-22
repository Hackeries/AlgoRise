import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, stack, url, timestamp, userAgent } = body

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("[Client Error]", {
        message,
        stack,
        url,
        timestamp,
      })
    }

    // In production, you could send to an error tracking service like Sentry
    // Example: await sendToSentry({ message, stack, url, timestamp });

    return NextResponse.json({ success: true, message: "Error logged" }, { status: 200 })
  } catch (error) {
    console.error("Error logging failed:", error)
    return NextResponse.json({ success: false, error: "Failed to log error" }, { status: 500 })
  }
}
