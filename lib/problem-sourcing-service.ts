// Problem sourcing service for fetching problems from competitive programming platforms

export interface Problem {
  id: string;
  title: string;
  difficulty: number;
  rating?: number;
  source: 'codeforces' | 'leetcode' | 'atcoder' | 'codechef' | 'local';
  url: string;
  contestId?: number;
  index?: string;
  tags?: string[];
  timeLimit?: number;
  memoryLimit?: number;
  statement?: string;
  testCases?: Array<{ input: string; output: string }>;
}

export interface ProblemFilter {
  minRating?: number;
  maxRating?: number;
  tags?: string[];
  source?: Problem['source'];
  excludeSolved?: boolean;
  userId?: string;
}

class ProblemSourcingService {
  private static instance: ProblemSourcingService;
  private cfProblemsCache: Problem[] | null = null;
  private lastCfFetch: number = 0;
  private CF_CACHE_TTL = 60 * 60 * 1000; // 1 hour

  private constructor() {}

  static getInstance(): ProblemSourcingService {
    if (!ProblemSourcingService.instance) {
      ProblemSourcingService.instance = new ProblemSourcingService();
    }
    return ProblemSourcingService.instance;
  }

  /**
   * Get a random problem based on filter criteria
   */
  async getRandomProblem(filter: ProblemFilter): Promise<Problem | null> {
    const problems = await this.getProblems(filter);
    if (problems.length === 0) {
      return null;
    }
    return problems[Math.floor(Math.random() * problems.length)];
  }

  /**
   * Get multiple problems based on filter criteria
   */
  async getProblems(filter: ProblemFilter, limit: number = 100): Promise<Problem[]> {
    // For now, focus on Codeforces as the primary source
    const cfProblems = await this.getCodeforcesProblems(filter);
    
    // Shuffle and limit
    const shuffled = cfProblems.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  }

  /**
   * Fetch problems from Codeforces
   */
  private async getCodeforcesProblems(filter: ProblemFilter): Promise<Problem[]> {
    try {
      // Check cache
      if (this.cfProblemsCache && Date.now() - this.lastCfFetch < this.CF_CACHE_TTL) {
        return this.filterProblems(this.cfProblemsCache, filter);
      }

      // Fetch from Codeforces API
      const response = await fetch('https://codeforces.com/api/problemset.problems', {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch Codeforces problems:', response.status);
        return [];
      }

      const data = await response.json();
      
      if (data.status !== 'OK') {
        console.error('Codeforces API error:', data.comment);
        return [];
      }

      // Parse problems
      const problems: Problem[] = data.result.problems
        .filter((p: any) => p.rating) // Only problems with ratings
        .map((p: any) => ({
          id: `CF_${p.contestId}_${p.index}`,
          title: p.name,
          difficulty: this.mapCfRatingToDifficulty(p.rating),
          rating: p.rating,
          source: 'codeforces' as const,
          url: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
          contestId: p.contestId,
          index: p.index,
          tags: p.tags || [],
          timeLimit: p.timeLimit || 2000,
          memoryLimit: p.memoryLimit || 256
        }));

      // Cache the results
      this.cfProblemsCache = problems;
      this.lastCfFetch = Date.now();

      return this.filterProblems(problems, filter);
    } catch (error) {
      console.error('Error fetching Codeforces problems:', error);
      return [];
    }
  }

  /**
   * Filter problems based on criteria
   */
  private filterProblems(problems: Problem[], filter: ProblemFilter): Problem[] {
    let filtered = problems;

    // Filter by rating range
    if (filter.minRating !== undefined) {
      filtered = filtered.filter(p => (p.rating || 0) >= filter.minRating!);
    }
    if (filter.maxRating !== undefined) {
      filtered = filtered.filter(p => (p.rating || 0) <= filter.maxRating!);
    }

    // Filter by tags
    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(p => 
        p.tags && filter.tags!.some(tag => p.tags!.includes(tag))
      );
    }

    // Filter by source
    if (filter.source) {
      filtered = filtered.filter(p => p.source === filter.source);
    }

    return filtered;
  }

  /**
   * Map Codeforces rating to difficulty level (1-5)
   */
  private mapCfRatingToDifficulty(rating: number): number {
    if (rating < 1200) return 1;
    if (rating < 1600) return 2;
    if (rating < 2000) return 3;
    if (rating < 2400) return 4;
    return 5;
  }

  /**
   * Fetch problem details from Codeforces (including test cases if available)
   */
  async getCodeforcesProblemDetails(contestId: number, index: string): Promise<Problem | null> {
    try {
      // For getting test cases, we'd need to scrape the problem page
      // or use a custom database. For now, return basic problem info
      const problems = await this.getCodeforcesProblems({});
      return problems.find(p => p.contestId === contestId && p.index === index) || null;
    } catch (error) {
      console.error('Error fetching Codeforces problem details:', error);
      return null;
    }
  }

  /**
   * Get problem set for a battle (multiple problems with balanced difficulty)
   */
  async getBattleProblemSet(
    count: number,
    avgRating: number,
    mode: '1v1' | '3v3'
  ): Promise<Problem[]> {
    const problems: Problem[] = [];
    
    // For 1v1: short, speed-focused problems
    // For 3v3: ICPC-style, more varied difficulty
    
    if (mode === '1v1') {
      // Get problems close to the average rating
      const ratingRange = 200;
      
      for (let i = 0; i < count; i++) {
        const problem = await this.getRandomProblem({
          minRating: avgRating - ratingRange,
          maxRating: avgRating + ratingRange
        });
        
        if (problem) {
          problems.push(problem);
        }
      }
    } else {
      // 3v3: ICPC-style with progressive difficulty
      // Easy (2 problems), Medium (2-3 problems), Hard (1-2 problems)
      const distribution = [
        { count: 2, rating: avgRating - 400 },  // Easy
        { count: 2, rating: avgRating },         // Medium
        { count: count - 4, rating: avgRating + 400 }  // Hard
      ];
      
      for (const { count: problemCount, rating } of distribution) {
        for (let i = 0; i < problemCount; i++) {
          const problem = await this.getRandomProblem({
            minRating: rating - 100,
            maxRating: rating + 100
          });
          
          if (problem) {
            problems.push(problem);
          }
        }
      }
    }
    
    return problems;
  }

  /**
   * Get trending/popular problems
   */
  async getTrendingProblems(limit: number = 10): Promise<Problem[]> {
    // Get problems from Codeforces that are recent and popular
    const problems = await this.getCodeforcesProblems({});
    
    // Sort by rating (as a proxy for quality/popularity)
    return problems
      .sort((a, b) => {
        // Sort by rating count and recency
        const scoreA = (a.rating || 0);
        const scoreB = (b.rating || 0);
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }

  /**
   * Get problems suitable for practice based on user skill level
   */
  async getPracticeProblems(
    userRating: number,
    difficulty: 'easy' | 'medium' | 'hard',
    limit: number = 5
  ): Promise<Problem[]> {
    let minRating: number;
    let maxRating: number;
    
    switch (difficulty) {
      case 'easy':
        minRating = userRating - 400;
        maxRating = userRating - 200;
        break;
      case 'medium':
        minRating = userRating - 200;
        maxRating = userRating + 200;
        break;
      case 'hard':
        minRating = userRating + 200;
        maxRating = userRating + 600;
        break;
    }
    
    const problems = await this.getProblems(
      { minRating, maxRating },
      limit * 2 // Get more to account for filtering
    );
    
    return problems.slice(0, limit);
  }

  /**
   * Get LeetCode problems (placeholder for future implementation)
   */
  private async getLeetCodeProblems(filter: ProblemFilter): Promise<Problem[]> {
    // LeetCode doesn't have a public API, so this would require:
    // 1. Web scraping (not recommended)
    // 2. Using LeetCode GraphQL API (requires authentication)
    // 3. Maintaining a local database of problems
    
    // For now, return empty array
    console.warn('LeetCode integration not yet implemented');
    return [];
  }

  /**
   * Get AtCoder problems (placeholder for future implementation)
   */
  private async getAtCoderProblems(filter: ProblemFilter): Promise<Problem[]> {
    // AtCoder has an unofficial API
    // This could be implemented by:
    // 1. Using kenkoooo's AtCoder Problems API
    // 2. Scraping AtCoder website
    
    // For now, return empty array
    console.warn('AtCoder integration not yet implemented');
    return [];
  }

  /**
   * Get CodeChef problems (placeholder for future implementation)
   */
  private async getCodeChefProblems(filter: ProblemFilter): Promise<Problem[]> {
    // CodeChef doesn't have a comprehensive public API
    // Would require scraping or local database
    
    // For now, return empty array
    console.warn('CodeChef integration not yet implemented');
    return [];
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.cfProblemsCache = null;
    this.lastCfFetch = 0;
  }
}

export default ProblemSourcingService;
