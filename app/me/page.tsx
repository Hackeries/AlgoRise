// app/me/page.tsx
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { syncNow } from "@/app/actions/cf";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { SubmitButton } from "@/components/submit-button";
import { LinkForm } from "@/components/link-form";

export default async function MePage() {
  const session = await getSession();

  // Not logged in → show sign-in prompt
  if (!session?.user) {
    return (
      <Card className="m-8">
        <CardHeader>
          <CardTitle>Please sign in</CardTitle>
          <CardDescription>Log in to view your profile</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Fetch user data
  const me = await db.user.findUnique({
    where: { id: (session.user as any).id },
    select: {
      cfHandle: true,
      rating: true,
      maxRating: true,
      lastSyncAt: true,
      name: true,
      email: true,
    },
  });

  // No user found in DB → show link prompt
  if (!me) {
    return (
      <Card className="m-8">
        <CardHeader>
          <CardTitle>No profile found</CardTitle>
          <CardDescription>Link your Codeforces handle to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <LinkForm />
        </CardContent>
      </Card>
    );
  }

  // Profile card
  return (
    <Card className="m-8">
      <CardHeader>
        <CardTitle>{me.name}</CardTitle>
        <CardDescription>{me.email}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {me.cfHandle ? (
          <Badge variant="outline">CF: {me.cfHandle}</Badge>
        ) : (
          <div className="space-y-2">
            <Badge variant="destructive">CF: Not linked</Badge>
            <LinkForm />
          </div>
        )}

        <div>Rating: {me.rating ?? "—"} (Max: {me.maxRating ?? "—"})</div>
        <div>
          Last synced:{" "}
          {me.lastSyncAt
            ? formatDistanceToNow(new Date(me.lastSyncAt), { addSuffix: true })
            : "Never"}
        </div>

        {me.cfHandle && (
          <form action={syncNow}>
            <SubmitButton idle="Sync now" submitting="Syncing..." />
          </form>
        )}
      </CardContent>
    </Card>
  );
}
