/**
 * Learning Path Service
 * Manages structured learning paths with levels and tracks user progress
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { UserMetricsService } from './user-metrics-service';

// ==================== TYPES ====================

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  difficulty_range_min: number;
  difficulty_range_max: number;
  level_number: number;
  prerequisites: string[];
  topics: string[];
  estimated_problems: number;
  is_active: boolean;
}

export interface LearningPathProgress {
  path: LearningPath;
  problems_completed: number;
  total_problems: number;
  completion_percentage: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  started_at?: string;
  completed_at?: string;
  last_activity_at?: string;
}

export interface LearningPathModule {
  name: string;
  topics: string[];
  estimatedProblems: number;
  problemsCompleted: number;
}

export interface StructuredPath {
  level: LearningPath;
  modules: LearningPathModule[];
  progress: LearningPathProgress;
  nextRecommendedProblem?: string;
}

// ==================== LEARNING PATH SERVICE ====================

export class LearningPathService {
  constructor(
    private supabase: SupabaseClient,
    private metricsService: UserMetricsService
  ) {}

  /**
   * Get all available learning paths
   */
  async getAllPaths(): Promise<LearningPath[]> {
    try {
      const { data, error } = await this.supabase
        .from('learning_paths')
        .select('*')
        .eq('is_active', true)
        .order('level_number', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting learning paths:', error);
      return [];
    }
  }

  /**
   * Get recommended learning path for user based on skill level
   */
  async getRecommendedPath(userId: string): Promise<LearningPath | null> {
    try {
      const skillProfile = await this.metricsService.getUserSkillProfile(userId);
      if (!skillProfile) {
        // Return Level 1 for new users
        const { data } = await this.supabase
          .from('learning_paths')
          .select('*')
          .eq('level_number', 1)
          .single();
        return data;
      }

      const skillLevel = skillProfile.current_skill_level;

      // Find path matching skill level
      const { data, error } = await this.supabase
        .from('learning_paths')
        .select('*')
        .lte('difficulty_range_min', skillLevel)
        .gte('difficulty_range_max', skillLevel)
        .single();

      if (error || !data) {
        // Find closest path
        const { data: allPaths } = await this.supabase
          .from('learning_paths')
          .select('*')
          .order('level_number', { ascending: true });

        if (!allPaths || allPaths.length === 0) return null;

        // Find path with closest difficulty range
        return allPaths.reduce((closest, path) => {
          const midpoint = (path.difficulty_range_min + path.difficulty_range_max) / 2;
          const closestMidpoint = (closest.difficulty_range_min + closest.difficulty_range_max) / 2;
          return Math.abs(midpoint - skillLevel) < Math.abs(closestMidpoint - skillLevel)
            ? path
            : closest;
        });
      }

      return data;
    } catch (error) {
      console.error('Error getting recommended path:', error);
      return null;
    }
  }

  /**
   * Get user's progress for a specific path
   */
  async getPathProgress(userId: string, pathId: string): Promise<LearningPathProgress | null> {
    try {
      // Get the path
      const { data: path, error: pathError } = await this.supabase
        .from('learning_paths')
        .select('*')
        .eq('id', pathId)
        .single();

      if (pathError || !path) return null;

      // Get user's progress
      const { data: progress, error: progressError } = await this.supabase
        .from('user_learning_path_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('learning_path_id', pathId)
        .single();

      if (progressError && progressError.code !== 'PGRST116') throw progressError;

      if (!progress) {
        // Create initial progress entry
        const initialProgress = {
          user_id: userId,
          learning_path_id: pathId,
          problems_completed: 0,
          total_problems: path.estimated_problems,
          completion_percentage: 0,
          status: 'not_started' as const,
        };

        const { data: newProgress, error: createError } = await this.supabase
          .from('user_learning_path_progress')
          .insert(initialProgress)
          .select()
          .single();

        if (createError) throw createError;

        return {
          path,
          ...newProgress,
        };
      }

      return {
        path,
        ...progress,
      };
    } catch (error) {
      console.error('Error getting path progress:', error);
      return null;
    }
  }

  /**
   * Get all user's path progress
   */
  async getAllUserProgress(userId: string): Promise<LearningPathProgress[]> {
    try {
      const paths = await this.getAllPaths();
      const progressList: LearningPathProgress[] = [];

      for (const path of paths) {
        const progress = await this.getPathProgress(userId, path.id);
        if (progress) {
          progressList.push(progress);
        }
      }

      return progressList;
    } catch (error) {
      console.error('Error getting all user progress:', error);
      return [];
    }
  }

  /**
   * Get structured path with modules for display
   */
  async getStructuredPath(userId: string, pathId: string): Promise<StructuredPath | null> {
    try {
      const progress = await this.getPathProgress(userId, pathId);
      if (!progress) return null;

      const path = progress.path;

      // Create modules by grouping topics
      const modules = this.createModules(path.topics, path.estimated_problems);

      // Calculate problems completed per module
      const problemsPerModule = Math.floor(
        progress.problems_completed / modules.length
      );

      const modulesWithProgress = modules.map(module => ({
        ...module,
        problemsCompleted: Math.min(problemsPerModule, module.estimatedProblems),
      }));

      return {
        level: path,
        modules: modulesWithProgress,
        progress,
      };
    } catch (error) {
      console.error('Error getting structured path:', error);
      return null;
    }
  }

  /**
   * Create modules from topics
   */
  private createModules(topics: string[], totalProblems: number): LearningPathModule[] {
    const problemsPerTopic = Math.floor(totalProblems / topics.length);

    // Group related topics into modules
    const modules: LearningPathModule[] = [];
    
    // Data Structure topics
    const dsTopics = topics.filter(t => 
      ['data-structures', 'sorting', 'binary-search', 'two-pointers', 'dsu'].includes(t)
    );
    if (dsTopics.length > 0) {
      modules.push({
        name: 'Data Structures',
        topics: dsTopics,
        estimatedProblems: problemsPerTopic * dsTopics.length,
        problemsCompleted: 0,
      });
    }

    // Algorithm topics
    const algoTopics = topics.filter(t => 
      ['greedy', 'dp', 'divide-and-conquer', 'brute-force'].includes(t)
    );
    if (algoTopics.length > 0) {
      modules.push({
        name: 'Algorithms',
        topics: algoTopics,
        estimatedProblems: problemsPerTopic * algoTopics.length,
        problemsCompleted: 0,
      });
    }

    // Graph topics
    const graphTopics = topics.filter(t => 
      ['graphs', 'trees', 'dfs-and-similar', 'shortest-paths'].includes(t)
    );
    if (graphTopics.length > 0) {
      modules.push({
        name: 'Graphs & Trees',
        topics: graphTopics,
        estimatedProblems: problemsPerTopic * graphTopics.length,
        problemsCompleted: 0,
      });
    }

    // Math topics
    const mathTopics = topics.filter(t => 
      ['math', 'number-theory', 'combinatorics', 'geometry'].includes(t)
    );
    if (mathTopics.length > 0) {
      modules.push({
        name: 'Mathematics',
        topics: mathTopics,
        estimatedProblems: problemsPerTopic * mathTopics.length,
        problemsCompleted: 0,
      });
    }

    // String topics
    const stringTopics = topics.filter(t => 
      ['strings', 'hashing', 'string-suffix-structures'].includes(t)
    );
    if (stringTopics.length > 0) {
      modules.push({
        name: 'Strings',
        topics: stringTopics,
        estimatedProblems: problemsPerTopic * stringTopics.length,
        problemsCompleted: 0,
      });
    }

    // Other topics
    const otherTopics = topics.filter(t => 
      !dsTopics.includes(t) && 
      !algoTopics.includes(t) && 
      !graphTopics.includes(t) && 
      !mathTopics.includes(t) &&
      !stringTopics.includes(t)
    );
    if (otherTopics.length > 0) {
      modules.push({
        name: 'Advanced Topics',
        topics: otherTopics,
        estimatedProblems: problemsPerTopic * otherTopics.length,
        problemsCompleted: 0,
      });
    }

    return modules;
  }

  /**
   * Update path progress after problem completion
   */
  async updateProgress(
    userId: string,
    pathId: string,
    problemCompleted: boolean = true
  ): Promise<void> {
    try {
      const progress = await this.getPathProgress(userId, pathId);
      if (!progress) return;

      const newCompleted = problemCompleted 
        ? progress.problems_completed + 1 
        : progress.problems_completed;
      
      const newPercentage = (newCompleted / progress.total_problems) * 100;
      const newStatus = newPercentage >= 100 ? 'completed' : 'in_progress';

      const updateData: any = {
        problems_completed: newCompleted,
        completion_percentage: newPercentage,
        status: newStatus,
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (progress.status === 'not_started') {
        updateData.started_at = new Date().toISOString();
      }

      if (newStatus === 'completed' && !progress.completed_at) {
        updateData.completed_at = new Date().toISOString();
      }

      await this.supabase
        .from('user_learning_path_progress')
        .update(updateData)
        .eq('user_id', userId)
        .eq('learning_path_id', pathId);
    } catch (error) {
      console.error('Error updating path progress:', error);
    }
  }

  /**
   * Get learning path overview for dashboard
   */
  async getDashboardOverview(userId: string): Promise<{
    currentPath: StructuredPath | null;
    allPaths: LearningPathProgress[];
    recommendation: string;
  }> {
    try {
      const allPaths = await this.getAllUserProgress(userId);
      
      // Find current active path or recommend one
      let currentPath = allPaths.find(p => p.status === 'in_progress');
      
      if (!currentPath) {
        const recommendedPath = await this.getRecommendedPath(userId);
        if (recommendedPath) {
          currentPath = await this.getPathProgress(userId, recommendedPath.id);
        }
      }

      const structured = currentPath 
        ? await this.getStructuredPath(userId, currentPath.path.id)
        : null;

      const recommendation = this.generateRecommendation(currentPath, allPaths);

      return {
        currentPath: structured,
        allPaths,
        recommendation,
      };
    } catch (error) {
      console.error('Error getting dashboard overview:', error);
      return {
        currentPath: null,
        allPaths: [],
        recommendation: 'Start with Level 1: Basics to build your foundation',
      };
    }
  }

  /**
   * Generate recommendation message
   */
  private generateRecommendation(
    currentPath: LearningPathProgress | undefined,
    allPaths: LearningPathProgress[]
  ): string {
    if (!currentPath) {
      return 'Start your learning journey with Level 1: Basics';
    }

    const completedCount = allPaths.filter(p => p.status === 'completed').length;
    const percentage = currentPath.completion_percentage;

    if (percentage >= 80) {
      return `Almost done with ${currentPath.path.name}! ${Math.round(100 - percentage)}% remaining`;
    }

    if (percentage >= 50) {
      return `You're halfway through ${currentPath.path.name}. Keep going!`;
    }

    if (completedCount > 0) {
      return `Continue your progress in ${currentPath.path.name} (${Math.round(percentage)}% complete)`;
    }

    return `Focus on ${currentPath.path.name} to build a strong foundation`;
  }
}
