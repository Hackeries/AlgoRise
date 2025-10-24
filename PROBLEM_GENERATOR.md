# Problem Generator & Custom Test Cases

## Overview

The Problem Generator & Custom Test Cases feature enables users to generate unlimited practice problems and comprehensive test cases using algorithmic templates and patterns. This feature provides dynamic problem generation without relying on external AI services.

## Features

### 1. Template-Based Problem Generation
- Pre-defined problem templates for common algorithms
- Variable substitution for dynamic content
- Constraint randomization
- Problem variation engine
- Category-based generation (Arrays, Strings, Graphs, DP, etc.)

### 2. Algorithmic Test Case Generation
- Random test case generation within constraints
- Edge case detection and generation
- Stress test creation (maximum constraints)
- Corner case identification
- Pattern-based test generation

### 3. Problem Builder Interface
- Visual problem constructor
- Constraint configuration
- Example generator
- Solution validator
- Difficulty estimator

### 4. Test Suite Management
- Test case collections
- Coverage analysis
- Batch generation
- Import/Export functionality
- Validation tools

## Implementation Details

### Core Modules

1. **Problem Templates** (`lib/problem-generator/problem-templates.ts`)
   - Defines problem templates with statements, constraints, and examples
   - Includes predefined templates for common algorithms

2. **Problem Generator** (`lib/problem-generator/problem-generator.ts`)
   - Generates problems from templates with randomized values
   - Supports category-based and difficulty-based generation

3. **Test Case Generator** (`lib/problem-generator/test-case-generator.ts`)
   - Generates comprehensive test cases including edge cases and stress tests
   - Creates sample, edge, random, and stress test cases

4. **Problem Judge Service** (`lib/problem-generator/problem-judge-service.ts`)
   - Integrates generated problems with the existing judging system
   - Validates solutions against generated test cases

5. **Test Suite Manager** (`lib/problem-generator/test-suite-manager.ts`)
   - Manages test suite collections
   - Provides coverage analysis and export/import functionality

### UI Components

1. **Problem Generator Page** (`app/problem-generator/page.tsx`)
   - Main interface for generating and viewing problems
   - Problem display with statement, constraints, and examples

2. **Problem Generator Client** (`components/problem-generator/problem-generator-client.tsx`)
   - Interactive component for solving generated problems
   - Test case execution and validation

3. **Test Suite Manager** (`app/test-suites/page.tsx` and `components/problem-generator/test-suite-manager.tsx`)
   - Interface for creating, managing, and organizing test suites
   - Test case management with CRUD operations

## Usage

### Generating Problems
1. Navigate to the Problem Generator page via the sidebar or Training Hub
2. Select a category or difficulty level
3. Click "Generate New Problem"
4. Solve the problem in the provided code editor
5. Run test cases to validate your solution

### Creating Custom Test Cases
1. Go to the Test Suites page
2. Create a new test suite
3. Add custom test cases with input/output pairs
4. Categorize test cases as sample, edge, random, or stress tests
5. Export/import test suites for sharing

### Integration with Existing System
The problem generator integrates with the existing training system through:
- Sidebar navigation entry
- Training Hub section
- Existing judging infrastructure
- User authentication and session management

## Future Enhancements

1. Advanced template system with more algorithm categories
2. AI-assisted problem generation (optional feature)
3. Peer review system for user-generated problems
4. Problem difficulty auto-calibration
5. Integration with competitive programming platforms
6. Automated solution hint generation
7. Performance benchmarking tools

## API

### ProblemGenerator
```typescript
class ProblemGenerator {
  generateProblem(template: ProblemTemplate): GeneratedProblem
  generateProblemsByCategory(category: string, count: number): GeneratedProblem[]
  generateProblemsByDifficulty(difficulty: 'easy' | 'medium' | 'hard', count: number): GeneratedProblem[]
  generateMixedProblems(distribution: Record<string, number>): GeneratedProblem[]
}
```

### TestCaseGenerator
```typescript
class TestCaseGenerator {
  generateTestCases(template: ProblemTemplate): TestCase[]
}
```

### TestSuiteManager
```typescript
class TestSuiteManager {
  createTestSuite(name: string, description: string, testCases: TestCase[]): TestSuite
  getTestSuite(id: string): TestSuite | undefined
  updateTestSuite(id: string, updates: Partial<TestSuite>): TestSuite | undefined
  deleteTestSuite(id: string): boolean
  listTestSuites(filter?: { tags?: string[], isPublic?: boolean }): TestSuite[]
}
```