// Database query optimization utilities
export const DB_INDEXES = {
  // Leaderboard queries
  leaderboard_rating: "CREATE INDEX idx_users_rating ON users(rating DESC)",

  // User stats queries
  user_stats: "CREATE INDEX idx_user_stats_user_id ON user_stats(user_id)",
  user_problems: "CREATE INDEX idx_solved_problems_user_id ON solved_problems(user_id)",

  // Contest queries
  contest_active: "CREATE INDEX idx_contests_status ON contests(status, start_time DESC)",
  contest_user: "CREATE INDEX idx_contest_participants_contest_id ON contest_participants(contest_id)",

  // Group queries
  group_members: "CREATE INDEX idx_group_members_group_id ON group_members(group_id)",
  group_user: "CREATE INDEX idx_group_members_user_id ON group_members(user_id)",
} as const

// Query optimization patterns
export const QUERY_PATTERNS = {
  // Use pagination for large result sets
  paginate: (page: number, pageSize = 20) => ({
    limit: pageSize,
    offset: (page - 1) * pageSize,
  }),

  // Select only needed columns
  selectColumns: (columns: string[]) => ({
    select: columns.join(", "),
  }),

  // Batch queries to reduce round trips
  batchSize: 100,

  // Cache frequently accessed data
  cacheTTL: {
    leaderboard: 300, // 5 minutes
    userStats: 600, // 10 minutes
    contests: 60, // 1 minute
  },
} as const
