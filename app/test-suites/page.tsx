// Test Suites Page
'use client';

import { TestSuiteManagerComponent } from '@/components/problem-generator/test-suite-manager';

export default function TestSuitesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <TestSuiteManagerComponent />
      </div>
    </div>
  );
}