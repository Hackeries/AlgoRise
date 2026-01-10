/**
 * AI Layer Index
 * 
 * Export all AI-related functionality
 */

export * from './types';
export * from './providers';
export * from './prompts';
export * from './cache';
export * from './services';

// Default export for common use cases
export { getAIProvider } from './providers';
export { 
  generateHint, 
  analyzeCode, 
  debugCode, 
  explainConcept, 
  chatWithTutor 
} from './services';
