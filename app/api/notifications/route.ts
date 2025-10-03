// /app/api/notifications/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // Example JSON response
  const notifications = [
    { id: 1, message: "Welcome to the app!" },
    { id: 2, message: "You have 3 new messages." },
  ];

  return NextResponse.json(notifications);
}
