import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logger, getRequestContext } from "@/lib/error/logger"
import { checkRateLimit, RATE_LIMITS, addRateLimitHeaders } from "@/lib/security/rate-limit"
import { calculateProfileCompletion } from "@/lib/profile/completion"

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()

    if (userErr || !user) {
      const context = getRequestContext(req)
      logger.logUnauthorizedAccess(context, 'profile.get')
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    // Apply rate limiting
    const rateLimitResponse = await checkRateLimit(
      req,
      'profile_read',
      RATE_LIMITS.PROFILE_READ,
      user.id
    )
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const context = getRequestContext(req)
    logger.logProfileView({ ...context, userId: user.id })

    // Get CF handle verification status
    const { data: cfHandle } = await supabase
      .from("cf_handles")
      .select("handle, verified")
      .eq("user_id", user.id)
      .single()

    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "name, status, degree_type, college_id, year, company_id, custom_company, colleges(name), companies(name), leetcode_handle, codechef_handle, atcoder_handle, gfg_handle",
      )
      .eq("id", user.id)
      .single()

    // Normalize related names
    const collegeName = Array.isArray((profile as any)?.colleges)
      ? (profile as any)?.colleges?.[0]?.name
      : (profile as any)?.colleges?.name
    const companyName = Array.isArray((profile as any)?.companies)
      ? (profile as any)?.companies?.[0]?.name
      : (profile as any)?.companies?.name

    const profileData = {
      name: profile?.name || "",
      full_name: profile?.name || "",
      cf_verified: cfHandle?.verified || false,
      cf_handle: cfHandle?.handle || "",
      status: profile?.status || null,
      degree_type: profile?.degree_type || "",
      college_id: profile?.college_id || "",
      college_name: collegeName || "",
      year: profile?.year || "",
      company_id: profile?.company_id || "",
      company_name: companyName || "",
      custom_company: profile?.custom_company || "",
      leetcode_handle: (profile as any)?.leetcode_handle || "",
      codechef_handle: (profile as any)?.codechef_handle || "",
      atcoder_handle: (profile as any)?.atcoder_handle || "",
      gfg_handle: (profile as any)?.gfg_handle || "",
    }

    // Calculate profile completion
    const completion = calculateProfileCompletion({
      cf_verified: cfHandle?.verified || false,
      cf_handle: cfHandle?.handle || "",
      status: profile?.status || null,
      degree_type: profile?.degree_type || null,
      college_id: profile?.college_id || null,
      year: profile?.year || null,
      company_id: profile?.company_id || null,
      custom_company: profile?.custom_company || null,
      leetcode_handle: (profile as any)?.leetcode_handle || null,
      codechef_handle: (profile as any)?.codechef_handle || null,
      atcoder_handle: (profile as any)?.atcoder_handle || null,
      gfg_handle: (profile as any)?.gfg_handle || null,
    })

    return NextResponse.json({
      ...profileData,
      completion: {
        percentage: completion.percentage,
        completed: completion.completed,
        missing: completion.missing,
        isComplete: completion.isComplete,
      },
    })
  } catch (e: any) {
    const context = getRequestContext(req)
    logger.logError("profile.get.error", context, e)
    return NextResponse.json({ error: e?.message || "unknown error" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()

    if (userErr || !user) {
      const context = getRequestContext(req)
      logger.logUnauthorizedAccess(context, 'profile.update')
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    // Apply rate limiting
    const rateLimitResponse = await checkRateLimit(
      req,
      'profile_update',
      RATE_LIMITS.PROFILE_UPDATE,
      user.id
    )
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const body = await req.json()
    const {
      name,
      status,
      degree_type,
      college_id,
      year,
      company_id,
      custom_company,
      leetcode_handle,
      codechef_handle,
      atcoder_handle,
      gfg_handle,
    } = body

    const context = getRequestContext(req)
    const updatedFields: string[] = []

    const isPartialUpdate =
      !status &&
      (leetcode_handle !== undefined ||
        codechef_handle !== undefined ||
        atcoder_handle !== undefined ||
        gfg_handle !== undefined)

    if (isPartialUpdate) {
      const updateData: any = {
        id: user.id,
        updated_at: new Date().toISOString(),
      }

      if (leetcode_handle !== undefined) {
        updateData.leetcode_handle = leetcode_handle || null
        updatedFields.push('leetcode_handle')
      }
      if (codechef_handle !== undefined) {
        updateData.codechef_handle = codechef_handle || null
        updatedFields.push('codechef_handle')
      }
      if (atcoder_handle !== undefined) {
        updateData.atcoder_handle = atcoder_handle || null
        updatedFields.push('atcoder_handle')
      }
      if (gfg_handle !== undefined) {
        updateData.gfg_handle = gfg_handle || null
        updatedFields.push('gfg_handle')
      }

      const { error: upsertErr } = await supabase.from("profiles").upsert(updateData, { onConflict: "id" })

      if (upsertErr) {
        logger.logProfileUpdate({ ...context, userId: user.id }, updatedFields, false, upsertErr)
        return NextResponse.json({ error: upsertErr.message }, { status: 500 })
      }

      logger.logProfileUpdate({ ...context, userId: user.id }, updatedFields, true)
      return NextResponse.json({ success: true })
    }

    if (!status || !["student", "working"].includes(status)) {
      logger.logValidationError({ ...context, userId: user.id }, 'status', 'Invalid status value')
      return NextResponse.json({ error: 'Invalid status. Must be "student" or "working"' }, { status: 400 })
    }

    if (status === "student" && (!degree_type || !college_id || !year)) {
      logger.logValidationError({ ...context, userId: user.id }, 'student_fields', 'Missing required fields for student')
      return NextResponse.json({ error: "Degree type, college, and year are required for students" }, { status: 400 })
    }

    if (status === "working" && !company_id) {
      logger.logValidationError({ ...context, userId: user.id }, 'company_id', 'Missing company for working professional')
      return NextResponse.json({ error: "Company is required for working professionals" }, { status: 400 })
    }

    // Track updated fields
    updatedFields.push('status')
    if (status === "student") {
      updatedFields.push('degree_type', 'college_id', 'year')
    } else {
      updatedFields.push('company_id')
      if (custom_company) updatedFields.push('custom_company')
    }

    // Upsert profile
    const { error: upsertErr } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        name: name ?? null,
        status,
        degree_type: status === "student" ? degree_type : null,
        college_id: status === "student" ? college_id : null,
        year: status === "student" ? year : null,
        company_id: status === "working" ? company_id : null,
        custom_company: status === "working" ? custom_company : null,
        leetcode_handle: leetcode_handle ?? null,
        codechef_handle: codechef_handle ?? null,
        atcoder_handle: atcoder_handle ?? null,
        gfg_handle: gfg_handle ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )

    if (upsertErr) {
      logger.logProfileUpdate({ ...context, userId: user.id }, updatedFields, false, upsertErr)
      return NextResponse.json({ error: upsertErr.message }, { status: 500 })
    }

    logger.logProfileUpdate({ ...context, userId: user.id }, updatedFields, true)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    const context = getRequestContext(req)
    logger.logError("profile.update.error", context, e)
    return NextResponse.json({ error: e?.message || "unknown error" }, { status: 500 })
  }
}
