import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = body?.name as string | undefined;
  if (!name?.trim())
    return NextResponse.json({ error: "Group name required" }, { status: 400 });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: await cookies() }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check if user has college set
  const { data: profile } = await supabase
    .from("profiles")
    .select("college_id")
    .eq("id", user.id)
    .single();

  if (!profile?.college_id)
    return NextResponse.json({ error: "College not set" }, { status: 400 });

  // Create group
  const { data, error } = await supabase
    .from("groups")
    .insert({
      name: name.trim(),
      type: "college",
      college_id: profile.college_id,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Add creator as admin
  const { error: memErr } = await supabase.from("group_memberships").insert({
    group_id: data.id,
    user_id: user.id,
    role: "admin",
  });

  if (memErr)
    return NextResponse.json({ error: memErr.message }, { status: 500 });

  return NextResponse.json({ id: data.id });
}
