import Link from "next/link";
import { Button } from "@/components/ui/button";


export default function Page() {
  return (
    <main className="mx-auto max-w-3xl py-24 px-4 text-center">
      <h1 className="text-4xl font-bold">RealGrind</h1>
      <p className="mt-3 text-muted-foreground">Real-time Codeforces powered dashboard, contests, and recommendations.</p>
      <div className="mt-6 flex gap-3 justify-center">
        <Button asChild><Link href="/api/auth/signin">Sign in with Google</Link></Button>
        <Button variant="secondary" asChild><Link href="/dashboard">Open Dashboard</Link></Button>
      </div>
    </main>
  );
}
