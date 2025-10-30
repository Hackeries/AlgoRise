'use client';

import { useState, useRef, useEffect } from 'react';

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
}

export default function CodeEditor({ language, value, onChange }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lineCount, setLineCount] = useState(15);

  // Update line count when value changes
  useEffect(() => {
    if (textareaRef.current) {
      const lines = value.split('\n').length;
      setLineCount(Math.max(15, lines + 5));
    }
  }, [value]);

  // Handle scroll synchronization between textarea and line numbers
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    if (target) {
      const lineNumberContainer = target.previousElementSibling as HTMLDivElement;
      if (lineNumberContainer) {
        lineNumberContainer.scrollTop = target.scrollTop;
      }
    }
  };

  // Get language-specific syntax highlighting (simplified)
  const getSyntaxHighlighting = (line: string) => {
    // This is a very basic syntax highlighting implementation
    // In a real application, you would use a library like Prism or Monaco
    
    // Keywords for different languages
    const keywords: Record<string, string[]> = {
      cpp: ['int', 'char', 'void', 'return', 'if', 'else', 'for', 'while', 'include', 'using', 'namespace', 'std'],
      c: ['int', 'char', 'void', 'return', 'if', 'else', 'for', 'while', 'include'],
      java: ['public', 'private', 'class', 'static', 'void', 'int', 'String', 'return', 'if', 'else', 'for', 'while'],
      python: ['def', 'class', 'import', 'from', 'return', 'if', 'else', 'for', 'while', 'in', 'and', 'or', 'not'],
      javascript: ['function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'import', 'export']
    };

    const langKeywords = keywords[language] || [];
    
    // Simple tokenization
    const tokens = line.split(/(\s+|[{}()\[\];,])/);
    
    return tokens.map((token, index) => {
      if (langKeywords.includes(token)) {
        return <span key={index} className="text-purple-400 font-medium">{token}</span>;
      }
      if (/^\d+$/.test(token)) {
        return <span key={index} className="text-yellow-400">{token}</span>;
      }
      if (/^["'].*["']$/.test(token)) {
        return <span key={index} className="text-green-400">{token}</span>;
      }
      if (token === '#include' || token.startsWith('#')) {
        return <span key={index} className="text-blue-400">{token}</span>;
      }
      return <span key={index}>{token}</span>;
    });
  };

  // Generate line numbers
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="h-full flex bg-slate-900/50 font-mono text-[14px] sm:text-sm">
      {/* Line Numbers */}
      <div className="bg-slate-900/80 text-slate-500 p-4 pt-3 text-right select-none overflow-hidden">
        {lineNumbers.map((num) => (
          <div key={num} className="leading-6">
            {num}
          </div>
        ))}
      </div>
      
      {/* Code Editor */}
      <div className="flex-1 relative">
        {/* Hidden pre element for measuring text width */}
        <pre className="absolute top-0 left-0 invisible whitespace-pre-wrap break-words p-4 pt-3">
          {value}
        </pre>
        
        {/* Textarea for editing */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          className="absolute inset-0 w-full h-full bg-transparent text-blue-100 p-4 pt-3 resize-none outline-none leading-6 text-[14px] sm:text-sm"
          style={{ tabSize: 4 }}
          spellCheck={false}
        />
        
        {/* Syntax highlighting overlay */}
        <div 
          className="absolute inset-0 pointer-events-none p-4 pt-3 overflow-hidden text-[14px] sm:text-sm"
          style={{ 
            background: 'transparent',
            color: 'transparent',
            lineHeight: '1.5'
          }}
        >
          {value.split('\n').map((line, index) => (
            <div key={index} className="leading-6">
              {getSyntaxHighlighting(line)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Example usage
export function CodeEditorDemo() {
  const [code, setCode] = useState(`#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}`);

  return (
    <div className="h-96 w-full">
      <CodeEditor 
        language="cpp" 
        value={code} 
        onChange={setCode} 
      />
    </div>
  );
}