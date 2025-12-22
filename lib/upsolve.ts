export type Box = 1 | 2 | 3 | 4 | 5;

const INTERVALS: Record<Box, number> = {
  1: 1,
  2: 3,
  3: 7,
  4: 21,
  5: 90,
};

export function nextBox(box: Box, success: boolean): Box {
  if (success) return Math.min(5, box + 1) as Box;
  return Math.max(1, box - 1) as Box;
}

export function nextDue(box: Box, from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() + INTERVALS[box]);
  return d.toISOString();
}

export async function enqueueUpsolve(
  supabase: any,
  userId: string,
  problemId: string,
  source: "contest" | "daily" | "manual"
) {
  const { data: existing } = await supabase
    .from("upsolve_queue")
    .select("box")
    .eq("user_id", userId)
    .eq("problem_id", problemId)
    .single();

  // Already exists → do nothing
  if (existing) return;

  await supabase.from("upsolve_queue").insert({
    user_id: userId,
    problem_id: problemId,
    box: 1,
    next_due_at: nextDue(1),
    source,
    last_result: "fail",
  });
}

export async function resolveUpsolve(
  supabase: any,
  userId: string,
  problemId: string,
  success: boolean
) {
  const { data } = await supabase
    .from("upsolve_queue")
    .select("box")
    .eq("user_id", userId)
    .eq("problem_id", problemId)
    .single();

  if (!data) return;

  const newBox = nextBox(data.box, success);

  await supabase
    .from("upsolve_queue")
    .update({
      box: newBox,
      next_due_at: nextDue(newBox),
      last_result: success ? "success" : "fail",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("problem_id", problemId);
}