// Type definitions for the problem sourcing system
// These types match the database schema and API responses

export type ProblemPlatform = 
  | 'codeforces' 
  | 'atcoder' 
  | 'leetcode' 
  | 'codechef' 
  | 'usaco' 
  | 'cses' 
  | 'custom';

export type HintType = 
  | 'restatement'   // Level 1: Simplified problem explanation
  | 'algorithm'     // Level 2: Algorithm/data structure hint
  | 'pseudocode'    // Level 3: Pseudocode solution
  | 'solution';     // Level 4: Full working solution

export interface TestCase {
  input: string;
  output: string;
  explanation?: string;
}

export interface ProblemHint {
  id: string;
  problem_id: string;
  level: 1 | 2 | 3 | 4;
  hint_type: HintType;
  content: string;
  created_at?: string;
}

export interface Problem {
  id: string;
  
  // Identification
  platform: ProblemPlatform;
  external_id: string;  // e.g., "1234A" for Codeforces
  title: string;
  
  // Difficulty and categorization
  difficulty_rating: number;  // 800-3500 (Codeforces style)
  topic?: string[];  // ["dp", "graph", "greedy", etc.]
  tags?: string[];   // Additional tags for filtering
  
  // Constraints
  time_limit: number;    // in milliseconds
  memory_limit: number;  // in MB
  
  // Content
  problem_statement: string;  // HTML/Markdown
  input_format?: string;
  output_format?: string;
  constraints?: string;
  editorial?: string;  // Solution explanation
  
  // Test cases
  test_cases: TestCase[];
  hidden_test_cases?: TestCase[];
  
  // Judge0 compatibility
  judge0_language_id?: number;
  reference_solution?: string;
  
  // Statistics
  solved_count?: number;
  attempt_count?: number;
  successful_submission_rate?: number;  // 0-100
  average_solve_time?: number;  // in minutes
  
  // Metadata
  source_url?: string;
  author?: string;
  contest_name?: string;
  is_active?: boolean;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
  
  // Relations (populated when needed)
  hints?: ProblemHint[];
  userHistory?: ProblemHistory;
}

export interface ProblemHistory {
  id: string;
  user_id: string;
  problem_id: string;
  
  // Tracking
  first_seen_at: string;
  last_attempted_at?: string;
  solved_at?: string;
  
  // Statistics
  view_count: number;
  attempt_count: number;
  time_spent_seconds: number;
  
  // Battle context
  battle_id?: string;
  battle_round_id?: string;
}

export interface ProblemFetchOptions {
  targetRating: number;
  ratingRange?: number;      // Default: 200
  count?: number;            // Default: 2
  daysThreshold?: number;    // Default: 7 (don't repeat in last N days)
  excludeTopics?: string[];  // Topics to exclude
  requireTopics?: string[];  // Topics to require
}

export interface MatchmakingResponse {
  problems: Problem[];
  message?: string;  // e.g., "Expanded search range to find suitable problems"
}

export interface ProblemDetailResponse {
  problem: Problem & {
    hints: ProblemHint[];
    userHistory: ProblemHistory | null;
  };
}

export interface ProblemInteractionUpdate {
  action: 'attempt' | 'solve';
  timeSpentSeconds?: number;
  battleId?: string;
  battleRoundId?: string;
}

export interface ProblemInteractionResponse {
  success: boolean;
  history: ProblemHistory;
}

// Helper type for creating new problems
export type CreateProblemInput = Omit<
  Problem,
  'id' | 'created_at' | 'updated_at' | 'solved_count' | 'attempt_count' | 'successful_submission_rate' | 'average_solve_time'
>;

// Helper type for updating problems
export type UpdateProblemInput = Partial<
  Omit<Problem, 'id' | 'created_at'>
>;

// Difficulty categorization helper
export interface DifficultyInfo {
  label: string;
  color: string;
  minRating: number;
  maxRating: number;
}

export const DIFFICULTY_LEVELS: DifficultyInfo[] = [
  { label: 'Beginner', color: 'bg-green-500/20 text-green-700', minRating: 800, maxRating: 999 },
  { label: 'Easy', color: 'bg-emerald-500/20 text-emerald-700', minRating: 1000, maxRating: 1399 },
  { label: 'Medium', color: 'bg-yellow-500/20 text-yellow-700', minRating: 1400, maxRating: 1899 },
  { label: 'Hard', color: 'bg-orange-500/20 text-orange-700', minRating: 1900, maxRating: 2399 },
  { label: 'Expert', color: 'bg-red-500/20 text-red-700', minRating: 2400, maxRating: 3500 },
];

export function getDifficultyInfo(rating: number): DifficultyInfo {
  return DIFFICULTY_LEVELS.find(
    (level) => rating >= level.minRating && rating <= level.maxRating
  ) || DIFFICULTY_LEVELS[0];
}

// Topic/Tag constants (common ones from Codeforces, etc.)
export const COMMON_TOPICS = [
  'implementation',
  'math',
  'greedy',
  'dp',
  'data-structures',
  'brute-force',
  'constructive-algorithms',
  'graphs',
  'sorting',
  'binary-search',
  'dfs-and-similar',
  'trees',
  'strings',
  'number-theory',
  'combinatorics',
  'geometry',
  'bitmasks',
  'two-pointers',
  'dsu',
  'shortest-paths',
  'probabilities',
  'divide-and-conquer',
  'hashing',
  'games',
  'flows',
  'interactive',
  'matrices',
  'string-suffix-structures',
  'fft',
  'graph-matchings',
  'ternary-search',
  'expression-parsing',
  'meet-in-the-middle',
  '2-sat',
  'chinese-remainder-theorem',
  'schedules',
] as const;

export type CommonTopic = typeof COMMON_TOPICS[number];
