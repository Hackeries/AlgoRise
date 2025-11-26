/**
 * AI Services for AlgoRise
 * 
 * High-level AI service functions that combine providers, prompts, and caching
 */

import { getAIProvider } from './providers';
import { withCache } from './cache';
import { 
  SYSTEM_PROMPTS, 
  buildHintPrompt, 
  buildCodeAnalysisPrompt, 
  buildDebugPrompt,
  buildExplanationPrompt 
} from './prompts';
import type { 
  HintRequest, 
  HintResponse, 
  CodeAnalysisRequest, 
  CodeAnalysisResponse,
  DebugRequest,
  DebugResponse,
  ExplanationRequest,
  ExplanationResponse,
  AIMessage
} from './types';

/**
 * Generate a hint for a problem
 */
export async function generateHint(request: HintRequest): Promise<HintResponse> {
  const provider = getAIProvider();
  
  const cacheParams = {
    problemTitle: request.problemTitle,
    hintLevel: request.hintLevel,
    userCode: request.userCode?.substring(0, 200), // Limit for cache key
  };

  return withCache('hint', cacheParams, async () => {
    const messages: AIMessage[] = [
      { role: 'system', content: SYSTEM_PROMPTS.hintGenerator },
      { role: 'user', content: buildHintPrompt(request) },
    ];

    const response = await provider.generateCompletion(messages, {
      maxTokens: 800,
      temperature: 0.7,
    });

    // Parse the response into structured format
    const hint = response.content;
    const conceptualTips = extractBulletPoints(hint, 'concepts');
    const relatedTopics = extractBulletPoints(hint, 'topics');

    return {
      hint,
      conceptualTips,
      relatedTopics,
    };
  }, { ttl: 3600 * 6 }); // Cache for 6 hours
}

/**
 * Analyze code quality
 */
export async function analyzeCode(request: CodeAnalysisRequest): Promise<CodeAnalysisResponse> {
  const provider = getAIProvider();

  const messages: AIMessage[] = [
    { role: 'system', content: SYSTEM_PROMPTS.codeAnalyzer },
    { role: 'user', content: buildCodeAnalysisPrompt(request) },
  ];

  const response = await provider.generateCompletion(messages, {
    maxTokens: 1200,
    temperature: 0.5,
  });

  // Parse the response
  const content = response.content;
  
  return {
    quality: extractQuality(content),
    suggestions: extractBulletPoints(content, 'suggestions'),
    timeComplexity: extractComplexity(content, 'time'),
    spaceComplexity: extractComplexity(content, 'space'),
    issues: extractIssues(content),
  };
}

/**
 * Debug code and suggest fixes
 */
export async function debugCode(request: DebugRequest): Promise<DebugResponse> {
  const provider = getAIProvider();

  const messages: AIMessage[] = [
    { role: 'system', content: SYSTEM_PROMPTS.debugger },
    { role: 'user', content: buildDebugPrompt(request) },
  ];

  const response = await provider.generateCompletion(messages, {
    maxTokens: 1500,
    temperature: 0.5,
  });

  const content = response.content;

  return {
    diagnosis: extractSection(content, 'diagnosis') || content,
    suggestedFix: extractSection(content, 'fix') || '',
    explanation: extractSection(content, 'explanation') || '',
    fixedCode: extractCodeBlock(content),
  };
}

/**
 * Explain a concept
 */
export async function explainConcept(request: ExplanationRequest): Promise<ExplanationResponse> {
  const provider = getAIProvider();

  const cacheParams = {
    topic: request.topic,
    concept: request.concept,
    userLevel: request.userLevel,
  };

  return withCache('explanation', cacheParams, async () => {
    const messages: AIMessage[] = [
      { role: 'system', content: SYSTEM_PROMPTS.conceptExplainer },
      { role: 'user', content: buildExplanationPrompt(request) },
    ];

    const response = await provider.generateCompletion(messages, {
      maxTokens: 1500,
      temperature: 0.6,
    });

    const content = response.content;

    return {
      explanation: content,
      examples: request.withExamples ? extractCodeBlocks(content) : undefined,
      visualizationSuggestion: extractSection(content, 'visualization'),
      practiceProblems: extractBulletPoints(content, 'practice'),
    };
  }, { ttl: 3600 * 24 }); // Cache for 24 hours
}

/**
 * Chat with AI tutor
 */
export async function chatWithTutor(
  messages: AIMessage[],
  context?: { topic?: string; problemId?: string }
): Promise<string> {
  const provider = getAIProvider();

  let systemPrompt = SYSTEM_PROMPTS.tutor;
  if (context?.topic) {
    systemPrompt += `\n\nCurrent topic: ${context.topic}`;
  }
  if (context?.problemId) {
    systemPrompt += `\nUser is working on problem: ${context.problemId}`;
  }

  const allMessages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  const response = await provider.generateCompletion(allMessages, {
    maxTokens: 1024,
    temperature: 0.7,
  });

  return response.content;
}

// Helper functions for parsing responses

function extractBulletPoints(text: string, _section: string): string[] {
  const lines = text.split('\n');
  const bullets: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.match(/^\d+\./)) {
      bullets.push(trimmed.replace(/^[-•]\s*|\d+\.\s*/, '').trim());
    }
  }
  
  return bullets.slice(0, 5); // Limit to 5 items
}

function extractQuality(text: string): 'poor' | 'fair' | 'good' | 'excellent' {
  const lower = text.toLowerCase();
  if (lower.includes('excellent')) return 'excellent';
  if (lower.includes('good')) return 'good';
  if (lower.includes('fair')) return 'fair';
  return 'poor';
}

function extractComplexity(text: string, type: 'time' | 'space'): string {
  const regex = new RegExp(`${type}\\s*complexity[:\\s]*([Oo]\\([^)]+\\))`, 'i');
  const match = text.match(regex);
  return match?.[1] || 'Unknown';
}

function extractIssues(text: string): { severity: 'info' | 'warning' | 'error'; message: string }[] {
  const issues: { severity: 'info' | 'warning' | 'error'; message: string }[] = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes('error') || lower.includes('bug')) {
      issues.push({ severity: 'error', message: line.trim() });
    } else if (lower.includes('warning') || lower.includes('caution')) {
      issues.push({ severity: 'warning', message: line.trim() });
    } else if (lower.includes('note') || lower.includes('tip')) {
      issues.push({ severity: 'info', message: line.trim() });
    }
  }
  
  return issues.slice(0, 10);
}

function extractSection(text: string, section: string): string | undefined {
  const regex = new RegExp(`${section}[:\\s]*([^\\n]+(?:\\n(?![A-Z][a-z]+:)[^\\n]+)*)`, 'i');
  const match = text.match(regex);
  return match?.[1]?.trim();
}

function extractCodeBlock(text: string): string | undefined {
  const match = text.match(/```[\w]*\n([\s\S]*?)```/);
  return match?.[1]?.trim();
}

function extractCodeBlocks(text: string): string[] {
  const regex = /```[\w]*\n([\s\S]*?)```/g;
  const blocks: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    blocks.push(match[1].trim());
  }
  return blocks;
}
