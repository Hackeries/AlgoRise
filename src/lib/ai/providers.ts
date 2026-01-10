/**
 * AI Provider Interface for AlgoRise
 * 
 * Modular provider system supporting multiple AI backends
 */

import type { AIMessage, AIRequestOptions, AIResponse, AIProvider } from './types';

/**
 * OpenAI-compatible provider
 * Can be used with OpenAI, Azure OpenAI, or compatible APIs
 */
export class OpenAIProvider implements AIProvider {
  name = 'openai';
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor(config?: {
    apiKey?: string;
    baseUrl?: string;
    model?: string;
  }) {
    this.apiKey = config?.apiKey || process.env.OPENAI_API_KEY || '';
    this.baseUrl = config?.baseUrl || 'https://api.openai.com/v1';
    this.defaultModel = config?.model || 'gpt-4o-mini';
  }

  async generateCompletion(
    messages: AIMessage[],
    options?: AIRequestOptions
  ): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options?.model || this.defaultModel,
        messages,
        max_tokens: options?.maxTokens || 1024,
        temperature: options?.temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices[0]?.message?.content || '',
      model: data.model,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined,
    };
  }
}

/**
 * Google Gemini provider
 */
export class GeminiProvider implements AIProvider {
  name = 'gemini';
  private apiKey: string;
  private defaultModel: string;

  constructor(config?: { apiKey?: string; model?: string }) {
    this.apiKey = config?.apiKey || process.env.GOOGLE_AI_API_KEY || '';
    this.defaultModel = config?.model || 'gemini-pro';
  }

  async generateCompletion(
    messages: AIMessage[],
    options?: AIRequestOptions
  ): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('Google AI API key not configured');
    }

    // Convert messages to Gemini format
    const contents = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    // Prepend system message to first user message if present
    const systemMsg = messages.find(m => m.role === 'system');
    if (systemMsg && contents.length > 0 && contents[0].role === 'user') {
      contents[0].parts[0].text = `${systemMsg.content}\n\n${contents[0].parts[0].text}`;
    }

    const model = options?.model || this.defaultModel;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            maxOutputTokens: options?.maxTokens || 1024,
            temperature: options?.temperature ?? 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();
    
    return {
      content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
      model,
      usage: data.usageMetadata ? {
        promptTokens: data.usageMetadata.promptTokenCount || 0,
        completionTokens: data.usageMetadata.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata.totalTokenCount || 0,
      } : undefined,
    };
  }
}

/**
 * Mock provider for development/testing
 */
export class MockAIProvider implements AIProvider {
  name = 'mock';

  async generateCompletion(
    messages: AIMessage[],
    _options?: AIRequestOptions
  ): Promise<AIResponse> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const lastMessage = messages[messages.length - 1];
    const content = lastMessage?.content || '';

    // Generate contextual mock responses
    if (content.toLowerCase().includes('hint')) {
      return {
        content: 'Here\'s a hint: Consider the problem from a different angle. Think about edge cases and try to break down the problem into smaller subproblems.',
        model: 'mock-v1',
        cached: false,
      };
    }

    if (content.toLowerCase().includes('debug')) {
      return {
        content: 'I notice a potential issue in your code. Check your loop bounds and make sure you\'re handling all edge cases correctly.',
        model: 'mock-v1',
        cached: false,
      };
    }

    return {
      content: 'I\'m here to help you with your coding journey! Feel free to ask about algorithms, data structures, or any programming concepts.',
      model: 'mock-v1',
      cached: false,
    };
  }
}

/**
 * Get the configured AI provider
 */
export function getAIProvider(): AIProvider {
  const providerName = process.env.AI_PROVIDER || 'mock';

  switch (providerName.toLowerCase()) {
    case 'openai':
      return new OpenAIProvider();
    case 'gemini':
    case 'google':
      return new GeminiProvider();
    case 'mock':
    default:
      return new MockAIProvider();
  }
}
