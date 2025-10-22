// Problem Generator Service
import { ProblemTemplate, GeneratedProblem, TestCase } from './problem-templates';
import { TestCaseGenerator } from './test-case-generator';

export class ProblemGenerator {
  private testCaseGenerator: TestCaseGenerator;

  constructor() {
    this.testCaseGenerator = new TestCaseGenerator();
  }

  /**
   * Generate a problem from a template with randomized values
   * @param template The problem template to use
   * @returns A generated problem with test cases
   */
  generateProblem(template: ProblemTemplate): GeneratedProblem {
    // Generate a unique problem ID
    const problemId = `${template.id}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    // Generate variables for the problem (in a real implementation, this would vary the constraints)
    const variables = this.generateVariables(template);
    
    // Generate test cases for the problem
    const testCases = this.testCaseGenerator.generateTestCases(template);
    
    // Create the generated problem
    const generatedProblem: GeneratedProblem = {
      ...template,
      problemId,
      variables,
      testCases
    };
    
    return generatedProblem;
  }

  /**
   * Generate variables for problem customization
   * @param template The problem template
   * @returns Variables for the problem
   */
  private generateVariables(template: ProblemTemplate): Record<string, any> {
    // For now, we'll just return an empty object
    // In a more advanced implementation, this would generate random values for constraints
    return {};
  }

  /**
   * Generate multiple problems from templates
   * @param templates Array of problem templates
   * @param count Number of problems to generate
   * @returns Array of generated problems
   */
  generateMultipleProblems(templates: ProblemTemplate[], count: number): GeneratedProblem[] {
    const problems: GeneratedProblem[] = [];
    
    // If we need more problems than templates, we'll cycle through templates
    for (let i = 0; i < count; i++) {
      const template = templates[i % templates.length];
      problems.push(this.generateProblem(template));
    }
    
    return problems;
  }

  /**
   * Generate problems by category
   * @param category The category of problems to generate
   * @param count Number of problems to generate
   * @returns Array of generated problems
   */
  generateProblemsByCategory(category: string, count: number): GeneratedProblem[] {
    // Import templates here to avoid circular dependencies
    const { PROBLEM_TEMPLATES } = require('./problem-templates');
    
    const categoryTemplates = PROBLEM_TEMPLATES.filter(
      template => template.category.toLowerCase() === category.toLowerCase()
    );
    
    if (categoryTemplates.length === 0) {
      throw new Error(`No templates found for category: ${category}`);
    }
    
    return this.generateMultipleProblems(categoryTemplates, count);
  }

  /**
   * Generate problems by difficulty
   * @param difficulty The difficulty level
   * @param count Number of problems to generate
   * @returns Array of generated problems
   */
  generateProblemsByDifficulty(difficulty: 'easy' | 'medium' | 'hard', count: number): GeneratedProblem[] {
    // Import templates here to avoid circular dependencies
    const { PROBLEM_TEMPLATES } = require('./problem-templates');
    
    const difficultyTemplates = PROBLEM_TEMPLATES.filter(
      template => template.difficulty === difficulty
    );
    
    if (difficultyTemplates.length === 0) {
      throw new Error(`No templates found for difficulty: ${difficulty}`);
    }
    
    return this.generateMultipleProblems(difficultyTemplates, count);
  }

  /**
   * Generate a mixed set of problems with different difficulties
   * @param distribution Distribution of difficulties (e.g., { easy: 3, medium: 4, hard: 2 })
   * @returns Array of generated problems
   */
  generateMixedProblems(distribution: Record<string, number>): GeneratedProblem[] {
    const problems: GeneratedProblem[] = [];
    
    for (const [difficulty, count] of Object.entries(distribution)) {
      if (count > 0) {
        problems.push(...this.generateProblemsByDifficulty(difficulty as 'easy' | 'medium' | 'hard', count));
      }
    }
    
    // Shuffle the problems to mix difficulties
    return this.shuffleArray(problems);
  }

  /**
   * Shuffle an array using Fisher-Yates algorithm
   * @param array Array to shuffle
   * @returns Shuffled array
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

// Export singleton instance
export default new ProblemGenerator();