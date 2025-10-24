export default function SheetAuthoringGuidelinesPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-balance">Practice Sheet Authoring Guidelines</h1>
        <p className="text-muted-foreground mt-2">
          How we curate complete, high‑quality sheets mapped to Codeforces ratings, with hints and editorials.
        </p>
      </header>

      <article className="prose prose-invert max-w-none">
        <p>You are an expert competitive programming coach and sheet curator.</p>
        <p>
          Your task is to generate a complete practice sheet that is ready to sell. Follow these requirements strictly:
        </p>

        <h2 id="rating">1. Rating Range Alignment (Codeforces‑based)</h2>
        <ul>
          <li>Newbie (&lt;1000)</li>
          <li>Pupil (1000–1200)</li>
          <li>Specialist (1200–1400)</li>
          <li>Expert (1400–1600)</li>
          <li>Candidate Master (1600–1900)</li>
          <li>Master (1900–2200+)</li>
        </ul>
        <p>
          If problems are from other platforms (LeetCode, CodeChef, AtCoder, USACO, C++ STL/algorithms), map them to
          their CF‑equivalent rating.
        </p>

        <h2 id="counts">2. Problem Count</h2>
        <ul>
          <li>Newbie, Pupil, Specialist sheets → 70–100 problems.</li>
          <li>Expert, Candidate Master, Master sheets → 150–200 problems.</li>
        </ul>

        <h2 id="topics">3. Topic Coverage</h2>
        <h3>Newbie (&lt;1000)</h3>
        <p>
          Basics, Arrays, Strings, Prefix Sum, STL basics, Two Pointers (easy), Simple Greedy, Basic Math, Pattern
          problems.
        </p>
        <h3>Pupil (1000–1200)</h3>
        <p>
          Sorting, Binary Search, Hashing, Stack/Queue, Basic Recursion, Simple Graph BFS/DFS, Sliding Window (easy),
          Modular arithmetic basics.
        </p>
        <h3>Specialist (1200–1400)</h3>
        <p>
          Constructive algorithms, Graph BFS/DFS, Sliding Window (medium), Two Pointers (medium), Recursion +
          Backtracking, Bit Manipulation basics, Simple DP.
        </p>
        <h3>Expert (1400–1600)</h3>
        <p>
          DP basics (knapsack, LIS, coin change), Trees (DFS, diameter, LCA basics), Graph shortest paths (Dijkstra,
          Bellman‑Ford), Backtracking (N‑Queens, Sudoku), Binary Search on Answer, Greedy with proofs, Math (mod exp,
          combinatorics basics), DSU.
        </p>
        <h3>Candidate Master (1600–1900)</h3>
        <p>
          Advanced DP (digit DP, bitmask DP, DP on trees), Graphs (0‑1 BFS, Floyd‑Warshall, flows intro), Combinatorics
          (nCr mod p, inclusion‑exclusion), Binary Lifting, Segment Tree basics, String algorithms (KMP, Z‑function),
          Probability/expected value, Hard constructive.
        </p>
        <h3>Master (1900–2200+)</h3>
        <p>
          Advanced DP (profile DP, SOS DP, optimizations), Segment Trees (lazy, persistent), HLD, Advanced Graphs (max
          flow, min cut, matching, SCC, bridges), Number Theory (NTT/FFT, CRT), Geometry (convex hull, line sweep),
          Advanced Combinatorics (Burnside’s/Polya), Hard Constructive.
        </p>

        <h2 id="leetcode">4. LeetCode Integration</h2>
        <p>
          Only include classical timeless problems: Two Sum, LRU Cache, Median of Two Sorted Arrays, Trapping Rain
          Water, Word Break, Course Schedule, Edit Distance, N‑Queens, Serialize/Deserialize Binary Tree.
        </p>

        <h2 id="structure">5. Sheet Structure</h2>
        <ul>
          <li>Problem Title + Link</li>
          <li>Platform (CF/LC/CC/AtCoder/USACO)</li>
          <li>CF‑equivalent Rating</li>
          <li>Tags</li>
          <li>1–2 Hints (progressive)</li>
          <li>Editorial Summary (2–3 lines)</li>
          <li>Similar Problems (1–2 links)</li>
        </ul>

        <h2 id="presentation">6. Presentation</h2>
        <ul>
          <li>Organize problems by increasing difficulty within the rating range.</li>
          <li>Start with an intro paragraph; end with a closing note and next steps.</li>
          <li>Use clean, structured Markdown (tables/bullets).</li>
        </ul>

        <h2 id="tone">7. Tone</h2>
        <p>Professional, encouraging, and learner‑friendly – a guided ladder, not a dump of links.</p>

        <hr />
        <h2>🪜 Full Topic Roadmap (Newbie → Master)</h2>
        <p>
          Includes where to bring in classical LeetCode problems. Use this as the backbone for each sheet’s curation.
        </p>
        <h3>Newbie</h3>
        <p>Goal: fundamentals, syntax fluency, stamina. Include Two Sum, Valid Parentheses, Merge Two Sorted Lists.</p>
        <h3>Pupil</h3>
        <p>
          Goal: standard techniques beyond brute force. Include Binary Search, Best Time to Buy/Sell I, Valid Anagram.
        </p>
        <h3>Specialist</h3>
        <p>
          Goal: Div2 B/C transition. Include Subarray Sum Equals K, Longest Substring Without Repeating Characters,
          Combination Sum.
        </p>
        <h3>Expert</h3>
        <p>Goal: Div2 C/D. Include LRU Cache, Word Break, Course Schedule.</p>
        <h3>Candidate Master</h3>
        <p>
          Goal: Div2 D/E, Div1 A/B. Include Median of Two Sorted Arrays, Trapping Rain Water, Regular Expression
          Matching.
        </p>
        <h3>Master</h3>
        <p>Goal: Div1 C/D/E. Include Edit Distance, N‑Queens II, Serialize/Deserialize Binary Tree.</p>

        <h2>📦 Problem Counts per Sheet</h2>
        <ul>
          <li>Newbie → Specialist: 70–100 each</li>
          <li>Expert → Master: 150–200 each</li>
        </ul>

        <h2>🔑 Differentiation from CP‑31</h2>
        <p>
          CP‑31: 31 problems per rating (mostly CF). Ours: 70–200 per sheet, cross‑platform, guided with
          hints/editorials, covering the full ladder up to Master, with classical LC only.
        </p>
      </article>
    </main>
  )
}
