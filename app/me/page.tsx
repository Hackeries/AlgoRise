import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions"; // optional if you split
import { linkHandleAction } from "@/app/actions/cf";

export default async function MePage() {
  const session = await getServerSession();
  async function action(formData: FormData) {
    "use server";
    const handle = String(formData.get("handle") || "");
    await linkHandleAction(handle);
    revalidatePath("/dashboard");
  }
  return (
    <div className="mx-auto max-w-xl p-6">
      <h2 className="text-xl font-semibold">Link Codeforces handle</h2>
      <form action={action} className="mt-4 flex gap-2">
        <input name="handle" placeholder="e.g. tourist" className="flex-1 border rounded px-3 py-2" />
        <button type="submit" className="px-4 py-2 rounded bg-primary text-primary-foreground">Link</button>
      </form>
      <p className="mt-3 text-sm text-muted-foreground">We’ll verify via Codeforces API and sync your profile.</p>
    </div>
  );
}
