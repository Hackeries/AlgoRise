// Test Suite Manager for Problem Generator
import { TestCase } from './problem-templates';

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  testCases: TestCase[];
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  isPublic: boolean;
  authorId?: string;
}

export interface TestSuiteCollection {
  id: string;
  name: string;
  description: string;
  testSuites: TestSuite[];
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  isPublic: boolean;
  authorId?: string;
}

export class TestSuiteManager {
  private testSuites: Map<string, TestSuite> = new Map();
  private collections: Map<string, TestSuiteCollection> = new Map();

  /**
   * Create a new test suite
   * @param name Name of the test suite
   * @param description Description of the test suite
   * @param testCases Test cases to include
   * @param tags Tags for categorization
   * @param isPublic Whether the test suite is public
   * @param authorId Author ID (optional)
   * @returns Created test suite
   */
  createTestSuite(
    name: string,
    description: string,
    testCases: TestCase[],
    tags: string[] = [],
    isPublic: boolean = false,
    authorId?: string
  ): TestSuite {
    const id = `ts-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const now = new Date();
    
    const testSuite: TestSuite = {
      id,
      name,
      description,
      testCases,
      createdAt: now,
      updatedAt: now,
      tags,
      isPublic,
      authorId
    };
    
    this.testSuites.set(id, testSuite);
    return testSuite;
  }

  /**
   * Get a test suite by ID
   * @param id Test suite ID
   * @returns Test suite or undefined if not found
   */
  getTestSuite(id: string): TestSuite | undefined {
    return this.testSuites.get(id);
  }

  /**
   * Update a test suite
   * @param id Test suite ID
   * @param updates Partial updates to apply
   * @returns Updated test suite or undefined if not found
   */
  updateTestSuite(id: string, updates: Partial<TestSuite>): TestSuite | undefined {
    const existing = this.testSuites.get(id);
    if (!existing) return undefined;
    
    const updated: TestSuite = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    
    this.testSuites.set(id, updated);
    return updated;
  }

  /**
   * Delete a test suite
   * @param id Test suite ID
   * @returns True if deleted, false if not found
   */
  deleteTestSuite(id: string): boolean {
    return this.testSuites.delete(id);
  }

  /**
   * List test suites with optional filtering
   * @param filter Optional filter criteria
   * @returns Array of matching test suites
   */
  listTestSuites(filter?: {
    tags?: string[];
    isPublic?: boolean;
    authorId?: string;
  }): TestSuite[] {
    let suites = Array.from(this.testSuites.values());
    
    if (filter) {
      if (filter.tags && filter.tags.length > 0) {
        suites = suites.filter(suite => 
          filter.tags!.every(tag => suite.tags.includes(tag))
        );
      }
      
      if (filter.isPublic !== undefined) {
        suites = suites.filter(suite => suite.isPublic === filter.isPublic);
      }
      
      if (filter.authorId) {
        suites = suites.filter(suite => suite.authorId === filter.authorId);
      }
    }
    
    return suites;
  }

  /**
   * Create a test suite collection
   * @param name Name of the collection
   * @param description Description of the collection
   * @param testSuites Initial test suites to include
   * @param tags Tags for categorization
   * @param isPublic Whether the collection is public
   * @param authorId Author ID (optional)
   * @returns Created test suite collection
   */
  createTestSuiteCollection(
    name: string,
    description: string,
    testSuites: TestSuite[] = [],
    tags: string[] = [],
    isPublic: boolean = false,
    authorId?: string
  ): TestSuiteCollection {
    const id = `tsc-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const now = new Date();
    
    const collection: TestSuiteCollection = {
      id,
      name,
      description,
      testSuites,
      createdAt: now,
      updatedAt: now,
      tags,
      isPublic,
      authorId
    };
    
    this.collections.set(id, collection);
    return collection;
  }

  /**
   * Get a test suite collection by ID
   * @param id Collection ID
   * @returns Test suite collection or undefined if not found
   */
  getTestSuiteCollection(id: string): TestSuiteCollection | undefined {
    return this.collections.get(id);
  }

  /**
   * Add a test suite to a collection
   * @param collectionId Collection ID
   * @param testSuite Test suite to add
   * @returns Updated collection or undefined if not found
   */
  addTestSuiteToCollection(collectionId: string, testSuite: TestSuite): TestSuiteCollection | undefined {
    const collection = this.collections.get(collectionId);
    if (!collection) return undefined;
    
    // Check if test suite is already in collection
    const exists = collection.testSuites.some(ts => ts.id === testSuite.id);
    if (!exists) {
      collection.testSuites.push(testSuite);
      collection.updatedAt = new Date();
      this.collections.set(collectionId, collection);
    }
    
    return collection;
  }

  /**
   * Remove a test suite from a collection
   * @param collectionId Collection ID
   * @param testSuiteId Test suite ID to remove
   * @returns Updated collection or undefined if not found
   */
  removeTestSuiteFromCollection(collectionId: string, testSuiteId: string): TestSuiteCollection | undefined {
    const collection = this.collections.get(collectionId);
    if (!collection) return undefined;
    
    collection.testSuites = collection.testSuites.filter(ts => ts.id !== testSuiteId);
    collection.updatedAt = new Date();
    this.collections.set(collectionId, collection);
    
    return collection;
  }

  /**
   * Analyze test suite coverage
   * @param testSuite Test suite to analyze
   * @returns Coverage analysis results
   */
  analyzeCoverage(testSuite: TestSuite): {
    totalTests: number;
    sampleTests: number;
    edgeTests: number;
    randomTests: number;
    stressTests: number;
    coveragePercentage: number;
  } {
    const total = testSuite.testCases.length;
    const sample = testSuite.testCases.filter(tc => tc.type === 'sample').length;
    const edge = testSuite.testCases.filter(tc => tc.type === 'edge').length;
    const random = testSuite.testCases.filter(tc => tc.type === 'random').length;
    const stress = testSuite.testCases.filter(tc => tc.type === 'stress').length;
    
    // Simple coverage calculation based on having all test types
    const hasAllTypes = sample > 0 && edge > 0 && random > 0 && stress > 0;
    const coveragePercentage = hasAllTypes ? 100 : Math.min(90, (sample + edge + random + stress) * 25);
    
    return {
      totalTests: total,
      sampleTests: sample,
      edgeTests: edge,
      randomTests: random,
      stressTests: stress,
      coveragePercentage
    };
  }

  /**
   * Export test suite to JSON
   * @param testSuite Test suite to export
   * @returns JSON string representation
   */
  exportTestSuite(testSuite: TestSuite): string {
    return JSON.stringify(testSuite, null, 2);
  }

  /**
   * Import test suite from JSON
   * @param json JSON string representation
   * @returns Imported test suite
   */
  importTestSuite(json: string): TestSuite {
    const parsed = JSON.parse(json);
    const now = new Date();
    
    // Validate required fields
    if (!parsed.name || !parsed.testCases) {
      throw new Error('Invalid test suite format');
    }
    
    const testSuite: TestSuite = {
      ...parsed,
      createdAt: parsed.createdAt ? new Date(parsed.createdAt) : now,
      updatedAt: now,
      testCases: parsed.testCases.map((tc: any) => ({
        ...tc,
        constraints: tc.constraints || {}
      }))
    };
    
    this.testSuites.set(testSuite.id, testSuite);
    return testSuite;
  }

  /**
   * Generate a comprehensive test suite for a problem category
   * @param category Problem category
   * @param count Number of test suites to generate
   * @returns Array of generated test suites
   */
  generateCategoryTestSuites(category: string, count: number = 5): TestSuite[] {
    const testSuites: TestSuite[] = [];
    
    // In a real implementation, this would generate test suites based on the category
    // For now, we'll create some example test suites
    
    for (let i = 0; i < count; i++) {
      const testCases: TestCase[] = [
        {
          input: `input-${i}-1`,
          output: `output-${i}-1`,
          type: 'sample'
        },
        {
          input: `input-${i}-2`,
          output: `output-${i}-2`,
          type: 'edge'
        },
        {
          input: `input-${i}-3`,
          output: `output-${i}-3`,
          type: 'random'
        }
      ];
      
      const testSuite = this.createTestSuite(
        `${category} Test Suite ${i + 1}`,
        `Comprehensive test suite for ${category} problems`,
        testCases,
        [category.toLowerCase(), 'generated'],
        true
      );
      
      testSuites.push(testSuite);
    }
    
    return testSuites;
  }
}

// Export singleton instance
export default new TestSuiteManager();