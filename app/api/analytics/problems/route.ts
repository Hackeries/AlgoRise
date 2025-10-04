import { NextResponse } from 'next/server';

export async function GET() {
  const mockTopicSuggestions = [
    { id: '1', topic: 'Dynamic Programming', difficulty: 'Hard', count: 15 },
    { id: '2', topic: 'Graph Theory', difficulty: 'Medium', count: 20 },
    { id: '3', topic: 'Data Structures', difficulty: 'Medium', count: 25 },
    { id: '4', topic: 'Greedy Algorithms', difficulty: 'Easy', count: 30 },
    { id: '5', topic: 'Number Theory', difficulty: 'Hard', count: 10 },
  ];

  return NextResponse.json(mockTopicSuggestions);
}
