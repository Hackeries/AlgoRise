import { NextResponse } from "next/server"
import fs from 'fs'
import path from 'path'

// File path for persistent storage
const CONTESTS_FILE = path.join(process.cwd(), 'data', 'contests.json')

// Ensure data directory exists
function ensureDataDirectory() {
  const dataDir = path.dirname(CONTESTS_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Load contests from file
function loadContests() {
  try {
    ensureDataDirectory()
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

// Save contests to file
function saveContests(contests: any[]) {
  try {
    ensureDataDirectory()
    fs.writeFileSync(CONTESTS_FILE, JSON.stringify(contests, null, 2))
  } catch (error) {
    console.error('Error saving contests:', error)
  }
}

// Initialize contests from file
let contests: any[] = loadContests()

// Generate sample problems based on rating range
function generateProblems(count: number, minRating: number, maxRating: number) {
  const problems = []
  const problemTypes = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
  
  for (let i = 0; i < count; i++) {
    const rating = Math.floor(Math.random() * (maxRating - minRating + 1)) + minRating
    const contestId = Math.floor(Math.random() * 1000) + 1000
    const problemLetter = problemTypes[i % problemTypes.length]
    
    problems.push({
      id: `${contestId}${problemLetter}`,
      contestId: contestId,
      index: problemLetter,
      name: `Problem ${problemLetter}`, // Hidden: actual problem name
      rating: rating,
      // Hidden metadata - not included in response
      hiddenTags: ['implementation', 'math', 'greedy'], // These won't be shown
      hiddenDifficulty: Math.floor(rating / 100) // Hidden difficulty level
    })
  }
  
  return problems
}

export async function GET() {
  try {
    // Reload contests from file to ensure we have the latest data
    contests = loadContests()
    
    // Return all contests sorted by creation time (newest first)
    const sortedContests = contests.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    
    return NextResponse.json({ contests: sortedContests })
  } catch (error) {
    console.error('Error in contests API:', error)
    return NextResponse.json({ contests: [] })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const {
      name,
      description,
      start_time,
      end_time,
      duration_minutes,
      problem_count,
      rating_min,
      rating_max,
      max_participants,
      allow_late_join
    } = body

    // Validation
    if (!name?.trim()) {
      return NextResponse.json({ error: "Contest name is required" }, { status: 400 })
    }

    if (!start_time) {
      return NextResponse.json({ error: "Start time is required" }, { status: 400 })
    }

    // Validate problem count
    if (!problem_count || problem_count < 5 || problem_count > 7) {
      return NextResponse.json({ error: "Problem count must be between 5 and 7" }, { status: 400 })
    }

    // Validate rating range
    if (!rating_min || !rating_max || rating_min >= rating_max) {
      return NextResponse.json({ error: "Invalid rating range. Minimum must be less than maximum" }, { status: 400 })
    }

    // Validate start time is in the future
    const startTime = new Date(start_time)
    if (startTime <= new Date()) {
      return NextResponse.json({ error: "Start time must be in the future" }, { status: 400 })
    }

    // Validate end time is after start time
    if (end_time) {
      const endTime = new Date(end_time)
      if (endTime <= startTime) {
        return NextResponse.json({ error: "End time must be after start time" }, { status: 400 })
      }
    }

    // Generate a unique ID for the contest
    const contestId = 'contest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    
    // Generate problems for the contest
    const problems = generateProblems(problem_count, rating_min, rating_max)
    
    // Create contest data
    const contestData = {
      id: contestId,
      name: name.trim(),
      description: description?.trim() || "",
      start_time: start_time,
      end_time: end_time,
      duration_minutes: duration_minutes || 120,
      problem_count: problem_count,
      rating_min: rating_min,
      rating_max: rating_max,
      problems: problems.map(p => ({
        id: p.id,
        contestId: p.contestId,
        index: p.index,
        name: p.name,
        rating: p.rating
        // Note: hiddenTags and hiddenDifficulty are not included to keep them secret
      })),
      max_participants: max_participants || null,
      allow_late_join: allow_late_join || false,
      status: "upcoming",
      created_by: "user_" + Date.now(), // Mock user ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Add to in-memory storage and save to file
    contests.push(contestData)
    saveContests(contests)
    
    console.log('Contest created successfully:', contestData)
    console.log('Total contests now:', contests.length)
    
    return NextResponse.json({ 
      ok: true, 
      contest: contestData,
      message: "Contest created successfully!"
    })
  } catch (error) {
    console.error("Error in contest creation:", error)
    return NextResponse.json({ 
      error: "Failed to create contest" 
    }, { status: 500 })
  }
}
