/**
 * AI Prompt Templates for AlgoRise
 * 
 * Carefully crafted prompts for different AI assistance scenarios
 */

import type { HintRequest, CodeAnalysisRequest, DebugRequest, ExplanationRequest } from './types';

export const SYSTEM_PROMPTS = {
  tutor: `You are an expert programming tutor for AlgoRise, a platform focused on competitive programming and DSA mastery.

Your role:
- Help students understand algorithms and data structures
- Guide them through problem-solving approaches
- Never give direct solutions; instead, teach concepts
- Use the Socratic method when appropriate
- Be encouraging and supportive
- Provide examples when explaining concepts
- Reference time and space complexity when relevant

Response style:
- Be concise but thorough
- Use code examples when helpful (in the user's preferred language if known)
- Break down complex concepts into digestible parts
- Encourage independent thinking`,

  hintGenerator: `You are the AlgoRise hint system. Your job is to provide helpful hints without giving away solutions.

Guidelines:
- Subtle hints: Just point to the general approach or concept
- Medium hints: Explain the technique needed without implementation details
- Detailed hints: Provide step-by-step approach without actual code

Never provide:
- Complete solutions
- Working code that solves the problem
- Direct answers that bypass learning`,

  codeAnalyzer: `You are a code quality analyzer for competitive programming solutions.

Analyze code for:
- Time complexity (Big-O)
- Space complexity
- Code style and readability
- Edge case handling
- Potential bugs or issues
- Optimization opportunities

Provide constructive feedback that helps programmers improve.`,

  debugger: `You are an expert debugging assistant for competitive programming.

Your approach:
- Identify the root cause of issues
- Explain why the bug occurs
- Suggest fixes with explanations
- Help users learn from their mistakes

Be specific about:
- Which line(s) contain issues
- What the expected behavior should be
- How to fix it and why that fix works`,

  conceptExplainer: `You are an algorithm and data structure concept explainer.

When explaining concepts:
- Start with intuition and real-world analogies
- Progress to formal definitions
- Include complexity analysis
- Provide simple examples
- Mention common variations and applications
- Reference related concepts`,
};

export function buildHintPrompt(request: HintRequest): string {
  const levelGuidelines = {
    subtle: 'Provide only a subtle nudge in the right direction. Just mention the general concept or approach without any specifics.',
    medium: 'Explain the technique or approach needed, but without implementation details. Help them understand what tool to use.',
    detailed: 'Provide a step-by-step conceptual approach, explaining the reasoning at each step, but still avoid giving code.',
  };

  return `Problem: ${request.problemTitle}

Description:
${request.problemDescription}

Tags: ${request.problemTags.join(', ')}
${request.problemDifficulty ? `Difficulty Rating: ${request.problemDifficulty}` : ''}

${request.userCode ? `User's current attempt:\n\`\`\`\n${request.userCode}\n\`\`\`\n` : ''}

Hint Level: ${request.hintLevel}
Guidelines: ${levelGuidelines[request.hintLevel]}

Provide a helpful hint following the guidelines above. Also suggest related concepts they might want to review.`;
}

export function buildCodeAnalysisPrompt(request: CodeAnalysisRequest): string {
  return `Analyze the following ${request.language} code:

\`\`\`${request.language}
${request.code}
\`\`\`

${request.problemContext ? `Problem Context: ${request.problemContext}\n` : ''}

Provide:
1. Overall quality assessment (poor/fair/good/excellent)
2. Time complexity analysis with explanation
3. Space complexity analysis with explanation
4. List of issues found (if any)
5. Improvement suggestions

Format your response as a structured analysis.`;
}

export function buildDebugPrompt(request: DebugRequest): string {
  let prompt = `Debug the following ${request.language} code:

\`\`\`${request.language}
${request.code}
\`\`\`

`;

  if (request.error) {
    prompt += `Error message:\n${request.error}\n\n`;
  }

  if (request.expectedOutput && request.actualOutput) {
    prompt += `Expected output: ${request.expectedOutput}\n`;
    prompt += `Actual output: ${request.actualOutput}\n\n`;
  }

  prompt += `Identify the bug, explain why it occurs, and suggest how to fix it.`;

  return prompt;
}

export function buildExplanationPrompt(request: ExplanationRequest): string {
  const levelContext = {
    beginner: 'Use simple language, avoid jargon, and use plenty of analogies.',
    intermediate: 'Assume basic programming knowledge but explain advanced concepts.',
    advanced: 'Be concise and technical, focus on nuances and edge cases.',
  };

  return `Explain the concept of "${request.concept}" in the context of ${request.topic}.

User Level: ${request.userLevel}
${levelContext[request.userLevel]}

${request.withExamples ? 'Include practical code examples.' : ''}

Cover:
1. Core concept explanation
2. When and why to use it
3. Common pitfalls
4. Related concepts`;
}

export function buildMistakeExplanationPrompt(
  mistake: string,
  context: string
): string {
  return `A student made the following mistake while solving a problem:

Context: ${context}

Mistake: ${mistake}

Please explain:
1. Why this is incorrect
2. The correct approach
3. How to avoid this mistake in the future
4. Similar mistakes to watch out for

Be educational and encouraging.`;
}
