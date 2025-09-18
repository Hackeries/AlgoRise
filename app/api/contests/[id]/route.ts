import { NextResponse } from "next/server"
import fs from 'fs'
import path from 'path'

// File path for persistent storage
const CONTESTS_FILE = path.join(process.cwd(), 'data', 'contests.json')

// Load contests from file
function loadContests() {
  try {
    if (fs.existsSync(CONTESTS_FILE)) {
      const data = fs.readFileSync(CONTESTS_FILE, 'utf8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Error loading contests:', error)
    return []
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const contests = loadContests()
    const contest = contests.find((c: any) => c.id === params.id)
    
    if (!contest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 })
    }

    // Add computed status based on current time
    const now = new Date()
    const startTime = new Date(contest.start_time)
    const endTime = contest.end_time ? new Date(contest.end_time) : 
      new Date(startTime.getTime() + (contest.duration_minutes || 120) * 60 * 1000)

    let status = 'upcoming'
    if (now >= startTime && now < endTime) {
      status = 'live'
    } else if (now >= endTime) {
      status = 'ended'
    }

    // Calculate time remaining
    const timeRemaining = status === 'live' ? 
      Math.max(0, endTime.getTime() - now.getTime()) : 
      (status === 'upcoming' ? startTime.getTime() - now.getTime() : 0)

    return NextResponse.json({
      contest: {
        ...contest,
        status,
        timeRemaining,
        shareUrl: `${req.headers.get('origin')}/contests/${contest.id}/participate`
      }
    })
  } catch (error) {
    console.error('Error getting contest:', error)
    return NextResponse.json({ error: "Failed to get contest" }, { status: 500 })
  }
}