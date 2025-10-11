export default function SheetCurationPage() {
  const steps = [
    { title: "Collect CF Data", desc: "Analyze recent rounds and tags to capture fresh difficulty and topic signals." },
    { title: "Difficulty Bucketing", desc: "Map problems to levels using rating bands and solver distribution." },
    { title: "Signal Scoring", desc: "Weight acceptance ratio, editorial clarity, uniqueness, and topic coverage." },
    { title: "Playtest & Iterate", desc: "Pilot with learners, prune duplicates, add bridging tasks where needed." },
  ]

  const topics = [
    { level: "Intro Pack", items: ["Basics", "I/O", "Math-1", "Arrays", "STL", "Two Pointers", "Prefix Sum"] },
    {
      level: "Level 1",
      items: ["Sorting/Greedy", "Binary Search", "Hashing", "Stacks/Queues", "Brute-Force Patterns"],
    },
    {
      level: "Level 2",
      items: ["Graphs (BFS/DFS)", "Shortest Paths", "Intro DP", "Number Theory-1", "Implementation"],
    },
    { level: "Level 3", items: ["Advanced DP", "Combinatorics", "Trees/LCA", "Bitmasking", "Math-2", "Segment Trees"] },
    {
      level: "Level 4",
      items: ["Hard Graphs", "Flows/Matching", "Advanced DP Mix", "Interactive & Constructive", "Tricks"],
    },
    { level: "Subscription", items: ["20–30 fresh weekly picks", "Contest digestion", "Weakness-based tilting"] },
  ]

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-pretty">How we curate Codeforces sheets</h1>
        <p className="text-muted-foreground mt-2">
          A repeatable pipeline converting real contest signal into structured learning—no fluff, just progress.
        </p>
      </header>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">The Curation Pipeline</h2>
        <ol className="grid gap-4 md:grid-cols-2">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-lg border p-4 bg-card text-card-foreground">
              <div className="text-sm font-mono opacity-70">Step {i + 1}</div>
              <div className="mt-1 font-semibold">{s.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Topics by Level</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {topics.map((t) => (
            <div key={t.level} className="rounded-lg border p-4 bg-card text-card-foreground">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{t.level}</h3>
                <span className="text-xs rounded-full px-2 py-0.5 bg-primary text-primary-foreground">Curated</span>
              </div>
              <ul className="mt-2 text-sm leading-relaxed list-disc pl-5">
                {t.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">What always stays</h2>
        <ul className="list-disc pl-5 leading-relaxed text-sm">
          <li>Weekly cadence with consistent difficulty ramp.</li>
          <li>Real contest tasks—no synthetic toy problems.</li>
          <li>Editorial-first picks to ensure learnability.</li>
          <li>Coverage breadth with spaced revisits via revisions.</li>
        </ul>
      </section>

      <footer className="flex items-center justify-between border-t pt-6 mt-6">
        <p className="text-sm text-muted-foreground">
          Want personalized sets? Subscription adds weekly picks tuned to your recent performance.
        </p>
        <a href="/pricing" className="text-sm underline underline-offset-4">
          Explore plans
        </a>
      </footer>
    </main>
  )
}
