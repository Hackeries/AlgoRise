/**
 * Anti-Cheat and Plagiarism Detection Module
 * Uses AST-based code analysis and behavioral patterns
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface PlagiarismResult {
  similarity: number; // 0-100%
  method: 'ast_diff' | 'token_similarity' | 'structure_match' | 'behavioral';
  suspicious: boolean;
  details: {
    matchingPatterns?: string[];
    structuralSimilarity?: number;
    tokenSimilarity?: number;
    suspiciousSegments?: Array<{ line: number; content: string }>;
  };
}

export interface BehavioralAnomaly {
  type: 'unrealistic_solve_speed' | 'rating_mismatch' | 'identical_code_pattern' | 
        'language_switching' | 'performance_spike' | 'copy_paste_detected';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  userId: string;
  matchId?: string;
}

export class AntiCheatSystem {
  private static instance: AntiCheatSystem;
  
  // Thresholds
  private readonly SIMILARITY_THRESHOLD = 85; // 85% similarity is suspicious
  private readonly SOLVE_SPEED_THRESHOLD = 60; // 60 seconds for hard problem is suspicious
  private readonly RATING_DEVIATION_THRESHOLD = 500; // 500 rating points deviation is suspicious
  
  private constructor() {}
  
  static getInstance(): AntiCheatSystem {
    if (!AntiCheatSystem.instance) {
      AntiCheatSystem.instance = new AntiCheatSystem();
    }
    return AntiCheatSystem.instance;
  }

  /**
   * Check submission for plagiarism against other submissions
   */
  async checkPlagiarism(
    submissionId: string,
    code: string,
    language: string,
    matchId: string,
    problemId: string
  ): Promise<PlagiarismResult[]> {
    // Get other submissions for the same problem in this match
    const { data: otherSubmissions } = await supabase
      .from('battle_submissions')
      .select('*')
      .eq('match_id', matchId)
      .eq('problem_id', problemId)
      .neq('id', submissionId);

    if (!otherSubmissions || otherSubmissions.length === 0) {
      return [];
    }

    const results: PlagiarismResult[] = [];

    for (const other of otherSubmissions) {
      // Skip if different language (harder to compare)
      if (other.language !== language) continue;

      // Calculate token similarity
      const tokenSim = this.calculateTokenSimilarity(code, other.code);
      
      // Calculate structural similarity
      const structuralSim = this.calculateStructuralSimilarity(code, other.code);
      
      // Calculate AST hash similarity
      const astSim = this.calculateASTSimilarity(code, other.code, language);
      
      // Overall similarity (weighted average)
      const similarity = (tokenSim * 0.3) + (structuralSim * 0.4) + (astSim * 0.3);
      
      if (similarity >= this.SIMILARITY_THRESHOLD) {
        const result: PlagiarismResult = {
          similarity,
          method: 'ast_diff',
          suspicious: true,
          details: {
            tokenSimilarity: tokenSim,
            structuralSimilarity: structuralSim,
            matchingPatterns: this.findMatchingPatterns(code, other.code)
          }
        };
        
        results.push(result);
        
        // Log to database
        await this.logPlagiarism(submissionId, other.id, similarity);
      }
    }

    return results;
  }

  /**
   * Calculate token-based similarity (simple tokenization)
   */
  private calculateTokenSimilarity(code1: string, code2: string): number {
    const tokens1 = this.tokenize(code1);
    const tokens2 = this.tokenize(code2);
    
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return (intersection.size / union.size) * 100;
  }

  /**
   * Tokenize code (remove whitespace, normalize)
   */
  private tokenize(code: string): string[] {
    // Remove comments
    code = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
    
    // Normalize whitespace
    code = code.replace(/\s+/g, ' ');
    
    // Split into tokens
    return code
      .split(/[^a-zA-Z0-9_]+/)
      .filter(t => t.length > 0);
  }

  /**
   * Calculate structural similarity (control flow patterns)
   */
  private calculateStructuralSimilarity(code1: string, code2: string): number {
    const structure1 = this.extractStructure(code1);
    const structure2 = this.extractStructure(code2);
    
    if (structure1.length === 0 || structure2.length === 0) return 0;
    
    // Count matching structural elements
    let matches = 0;
    const maxLength = Math.max(structure1.length, structure2.length);
    
    for (let i = 0; i < Math.min(structure1.length, structure2.length); i++) {
      if (structure1[i] === structure2[i]) {
        matches++;
      }
    }
    
    return (matches / maxLength) * 100;
  }

  /**
   * Extract code structure (control flow)
   */
  private extractStructure(code: string): string[] {
    const structure: string[] = [];
    
    // Find control structures
    const patterns = [
      /\bif\b/g,
      /\belse\b/g,
      /\bfor\b/g,
      /\bwhile\b/g,
      /\bswitch\b/g,
      /\breturn\b/g,
      /\bfunction\b/g,
      /\bclass\b/g
    ];
    
    for (const pattern of patterns) {
      const matches = code.match(pattern);
      if (matches) {
        structure.push(...matches);
      }
    }
    
    return structure;
  }

  /**
   * Calculate AST-based similarity
   */
  private calculateASTSimilarity(code1: string, code2: string, language: string): number {
    // Simplified AST hash - in production, use proper AST parsers
    const hash1 = this.generateCodeFingerprint(code1);
    const hash2 = this.generateCodeFingerprint(code2);
    
    // Calculate Levenshtein distance between hashes
    const distance = this.levenshteinDistance(hash1, hash2);
    const maxLength = Math.max(hash1.length, hash2.length);
    
    return ((maxLength - distance) / maxLength) * 100;
  }

  /**
   * Generate code fingerprint for plagiarism detection
   */
  generateCodeFingerprint(code: string): string {
    // Normalize code
    const normalized = code
      .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '') // Remove comments
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[a-zA-Z_][a-zA-Z0-9_]*/g, 'VAR') // Replace variable names
      .trim();
    
    // Generate hash
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  /**
   * Generate AST hash (simplified)
   */
  generateASTHash(code: string, language: string): string {
    // In production, use proper AST parsers like:
    // - @babel/parser for JavaScript/TypeScript
    // - tree-sitter for multiple languages
    // - clang for C/C++
    
    // For now, use structural fingerprint
    const structure = this.extractStructure(code);
    const structureStr = structure.join(',');
    
    return crypto.createHash('md5').update(structureStr).digest('hex');
  }

  /**
   * Find matching code patterns
   */
  private findMatchingPatterns(code1: string, code2: string): string[] {
    const patterns: string[] = [];
    
    // Split into lines
    const lines1 = code1.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const lines2 = code2.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // Find consecutive matching lines
    for (let i = 0; i < lines1.length; i++) {
      for (let j = 0; j < lines2.length; j++) {
        if (lines1[i] === lines2[j]) {
          let matchLength = 1;
          while (
            i + matchLength < lines1.length &&
            j + matchLength < lines2.length &&
            lines1[i + matchLength] === lines2[j + matchLength]
          ) {
            matchLength++;
          }
          
          if (matchLength >= 3) {
            patterns.push(lines1.slice(i, i + matchLength).join('\n'));
          }
        }
      }
    }
    
    return patterns;
  }

  /**
   * Levenshtein distance
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Check for behavioral anomalies
   */
  async checkBehavioralAnomalies(
    userId: string,
    matchId: string,
    problemDifficulty: string,
    solveTime: number, // seconds
    userRating: number
  ): Promise<BehavioralAnomaly[]> {
    const anomalies: BehavioralAnomaly[] = [];
    
    // Check unrealistic solve speed
    const expectedTime = this.getExpectedSolveTime(problemDifficulty, userRating);
    if (solveTime < expectedTime * 0.3) {
      anomalies.push({
        type: 'unrealistic_solve_speed',
        severity: 'high',
        details: {
          solveTime,
          expectedTime,
          problemDifficulty,
          userRating
        },
        userId,
        matchId
      });
      
      await this.logBehavioralAnomaly(userId, matchId, 'unrealistic_solve_speed', 'high', {
        solveTime,
        expectedTime
      });
    }
    
    // Check rating vs performance mismatch
    const { data: recentMatches } = await supabase
      .from('match_players')
      .select('score, rating_before')
      .eq('user_id', userId)
      .order('joined_at', { ascending: false })
      .limit(10);
    
    if (recentMatches && recentMatches.length > 0) {
      const avgScore = recentMatches.reduce((sum, m) => sum + (m.score || 0), 0) / recentMatches.length;
      const avgRating = recentMatches.reduce((sum, m) => sum + (m.rating_before || 1200), 0) / recentMatches.length;
      
      if (Math.abs(userRating - avgRating) > this.RATING_DEVIATION_THRESHOLD) {
        anomalies.push({
          type: 'performance_spike',
          severity: 'medium',
          details: {
            currentRating: userRating,
            averageRating: avgRating,
            deviation: Math.abs(userRating - avgRating)
          },
          userId,
          matchId
        });
      }
    }
    
    return anomalies;
  }

  /**
   * Get expected solve time based on difficulty and rating
   */
  private getExpectedSolveTime(difficulty: string, rating: number): number {
    const baseTime: Record<string, number> = {
      'easy': 300,    // 5 minutes
      'medium': 600,  // 10 minutes
      'hard': 1200    // 20 minutes
    };
    
    const base = baseTime[difficulty] || 600;
    
    // Adjust based on rating
    const ratingFactor = Math.max(0.5, Math.min(2, 1 - (rating - 1200) / 1000));
    
    return base * ratingFactor;
  }

  /**
   * Log plagiarism to database
   */
  private async logPlagiarism(
    submissionId1: string,
    submissionId2: string,
    similarity: number
  ): Promise<void> {
    await supabase.from('plagiarism_logs').insert({
      submission_id_1: submissionId1,
      submission_id_2: submissionId2,
      similarity_score: similarity,
      detection_method: 'ast_diff',
      status: 'flagged',
      metadata: {
        detectedAt: new Date().toISOString()
      }
    });
  }

  /**
   * Log behavioral anomaly
   */
  private async logBehavioralAnomaly(
    userId: string,
    matchId: string,
    type: string,
    severity: string,
    details: Record<string, any>
  ): Promise<void> {
    await supabase.from('behavioral_logs').insert({
      user_id: userId,
      match_id: matchId,
      anomaly_type: type,
      severity,
      details,
      status: 'flagged'
    });
  }

  /**
   * Get flagged submissions for review
   */
  async getFlaggedSubmissions(limit: number = 50): Promise<any[]> {
    const { data } = await supabase
      .from('plagiarism_logs')
      .select('*, battle_submissions!submission_id_1(*), battle_submissions!submission_id_2(*)')
      .eq('status', 'flagged')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    return data || [];
  }

  /**
   * Get behavioral anomalies for review
   */
  async getBehavioralAnomalies(limit: number = 50): Promise<any[]> {
    const { data } = await supabase
      .from('behavioral_logs')
      .select('*')
      .in('status', ['flagged', 'investigating'])
      .order('created_at', { ascending: false })
      .limit(limit);
    
    return data || [];
  }
}

export default AntiCheatSystem.getInstance();
