import { NextResponse } from "next/server"
import { getAdaptiveSheet } from "@/lib/adaptive-store"
import { createClient } from "@/lib/supabase/server"
import { fetchAdaptiveSheetDb } from "@/lib/adaptive-db"
import { cfGetProblems, getAdaptiveProblems, cfGetUserStatus, getSolvedProblems } from "@/lib/codeforces-api"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const baseRating = Number(url.searchParams.get("baseRating") || 1700)
  const handle = url.searchParams.get("handle") // User handle to exclude solved problems
  const tagsParam = (url.searchParams.get("tags") || "").trim()
  const tags = tagsParam
    ? tagsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : []

  // optional per-group limits
  const limitNow = Number(url.searchParams.get("limitNow") || 8)
  const limitSoon = Number(url.searchParams.get("limitSoon") || 8)
  const limitLater = Number(url.searchParams.get("limitLater") || 8)

  // try Supabase if authenticated; else fallback to demo in-memory
  try {
    const supabase = await createClient()
    const { data: userRes } = await supabase.auth.getUser()
    const userId = userRes?.user?.id

    if (!userId) {
      // Use real Codeforces data
      try {        
        // Get problems from Codeforces
        const problemsResponse = await cfGetProblems(tags.length > 0 ? tags : undefined)
        
        if (problemsResponse.status === 'OK' && 'result' in problemsResponse && problemsResponse.result) {
          const problems = problemsResponse.result.problems
          
          // Get solved problems for the user (if handle provided)
          let solvedProblems = new Set<string>()
          if (handle) {
            console.log(`Fetching solved problems for user: ${handle}`)
            const userSubmissionsResponse = await cfGetUserStatus(handle)
            if (userSubmissionsResponse.status === 'OK' && 'result' in userSubmissionsResponse && userSubmissionsResponse.result) {
              solvedProblems = getSolvedProblems(userSubmissionsResponse.result)
              console.log(`User ${handle} has solved ${solvedProblems.size} problems`)
            }
          }
          
          // Get adaptive problems
          const adaptiveProblems = getAdaptiveProblems(problems, baseRating, solvedProblems, limitNow + limitSoon + limitLater)
          
          // Transform to our format
          const cfProblems = adaptiveProblems.map((p: any) => ({
            id: `${p.contestId}${p.index}`,
            problem: {
              id: `${p.contestId}${p.index}`,
              title: p.name,
              url: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
              rating: p.rating || baseRating,
              tags: p.tags || []
            },
            repetitions: 0,
            ease: 2.5,
            intervalDays: 1,
            nextDueAt: new Date().toISOString(),
            lastOutcome: undefined
          }))
          
          // Split into groups
          const groups = {
            dueNow: cfProblems.slice(0, limitNow),
            dueSoon: cfProblems.slice(limitNow, limitNow + limitSoon),
            later: cfProblems.slice(limitNow + limitSoon, limitNow + limitSoon + limitLater)
          }
          
          return NextResponse.json({
            baseRating,
            groups,
            stats: {
              solvedRate: 0,
              streak: 0,
              lastInteractionAt: undefined,
              weakTags: {}
            }
          }, { status: 200 })
        }
      } catch (error) {
        console.error('Error fetching Codeforces data:', error)
      }
      
      // Fallback to demo data
      const data = getAdaptiveSheet("demo", baseRating, tags)
      data.groups.dueNow = data.groups.dueNow.slice(0, limitNow)
      data.groups.dueSoon = data.groups.dueSoon.slice(0, limitSoon)
      data.groups.later = data.groups.later.slice(0, limitLater)
      return NextResponse.json(data, { status: 200 })
    }

    const db = await fetchAdaptiveSheetDb(supabase, userId, baseRating, tags, {
      now: limitNow,
      soon: limitSoon,
      later: limitLater,
    })

    // assemble minimal stats client expects (weakTags/solvedRate come from analytics later)
    const data = {
      baseRating,
      groups: db.groups,
      stats: {
        solvedRate: 0,
        streak: 0,
        lastInteractionAt: undefined,
        weakTags: {},
      },
    }

    return NextResponse.json(data, { status: 200 })
  } catch (e) {
    // fallback on any error
    const data = getAdaptiveSheet("demo", baseRating, tags)
    return NextResponse.json(data, { status: 200 })
  }
}
