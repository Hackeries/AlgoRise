import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const supabase = await createClient();

  // Get the logged-in user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Error fetching Supabase user:", userError);
    return NextResponse.json(
      { handle: null, verified: false },
      { status: 500 }
    );
  }

  if (!user) {
    return NextResponse.json({ handle: null, verified: false });
  }

  try {
    // Get the latest CF snapshot for the user
    const { data: snapshot, error: snapshotError } = await supabase
      .from("cf_snapshots")
      .select("handle, rating, max_rating, rank, snapshot_at")
      .eq("user_id", user.id)
      .order("snapshot_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (snapshotError) {
      console.error("Error fetching CF snapshot:", snapshotError);
      return NextResponse.json(
        { handle: null, verified: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      handle: snapshot?.handle || null,
      verified: !!snapshot?.handle,
      rating: snapshot?.rating || null,
      maxRating: snapshot?.max_rating || null,
      rank: snapshot?.rank || null,
      lastVerifiedAt: snapshot?.snapshot_at || null,
    });
  } catch (err) {
    console.error("Unexpected error fetching CF handle:", err);
    return NextResponse.json(
      { handle: null, verified: false },
      { status: 500 }
    );
  }
}
