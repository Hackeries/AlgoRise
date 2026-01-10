// API route for problem generation
import { NextResponse } from 'next/server';
import { ProblemGenerator } from '@/lib/problem-generator/problem-generator';
import { PROBLEM_TEMPLATES } from '@/lib/problem-generator/problem-templates';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const difficulty = searchParams.get('difficulty') as 'easy' | 'medium' | 'hard' | null;
  const count = parseInt(searchParams.get('count') || '1');
  
  try {
    const generator = new ProblemGenerator();
    let problems;
    
    if (category) {
      problems = generator.generateProblemsByCategory(category, count);
    } else if (difficulty) {
      problems = generator.generateProblemsByDifficulty(difficulty, count);
    } else {
      // Generate a random problem
      const randomTemplate = PROBLEM_TEMPLATES[Math.floor(Math.random() * PROBLEM_TEMPLATES.length)];
      problems = [generator.generateProblem(randomTemplate)];
    }
    
    return NextResponse.json({
      success: true,
      problems,
      count: problems.length
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { templateId, customVariables } = body;
    
    const generator = new ProblemGenerator();
    const template = PROBLEM_TEMPLATES.find(t => t.id === templateId);
    
    if (!template) {
      return NextResponse.json({
        success: false,
        error: `Template with ID ${templateId} not found`
      }, { status: 404 });
    }
    
    const problem = generator.generateProblem(template);
    
    return NextResponse.json({
      success: true,
      problem
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}