/**
 * AI Layer Types for AlgoRise
 * 
 * Core type definitions for the modular AI system
 */

export interface AIProvider {
  name: string;
  generateCompletion: (
    messages: AIMessage[],
    options?: AIRequestOptions
  ) => Promise<AIResponse>;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRequestOptions {
  maxTokens?: number;
  temperature?: number;
  model?: string;
  stream?: boolean;
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cached?: boolean;
}

export interface HintRequest {
  problemTitle: string;
  problemDescription: string;
  problemTags: string[];
  problemDifficulty?: number;
  userCode?: string;
  hintLevel: 'subtle' | 'medium' | 'detailed';
}

export interface HintResponse {
  hint: string;
  conceptualTips: string[];
  relatedTopics: string[];
  cached?: boolean;
}

export interface CodeAnalysisRequest {
  code: string;
  language: string;
  problemContext?: string;
}

export interface CodeAnalysisResponse {
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  suggestions: string[];
  timeComplexity: string;
  spaceComplexity: string;
  issues: CodeIssue[];
}

export interface CodeIssue {
  line?: number;
  severity: 'info' | 'warning' | 'error';
  message: string;
  suggestion?: string;
}

export interface DebugRequest {
  code: string;
  language: string;
  error?: string;
  expectedOutput?: string;
  actualOutput?: string;
}

export interface DebugResponse {
  diagnosis: string;
  suggestedFix: string;
  explanation: string;
  fixedCode?: string;
}

export interface TutorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: {
    problemId?: string;
    topic?: string;
  };
}

export interface TutorSession {
  id: string;
  userId: string;
  messages: TutorMessage[];
  topic?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExplanationRequest {
  topic: string;
  concept: string;
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  withExamples?: boolean;
}

export interface ExplanationResponse {
  explanation: string;
  examples?: string[];
  visualizationSuggestion?: string;
  practiceProblems?: string[];
}
