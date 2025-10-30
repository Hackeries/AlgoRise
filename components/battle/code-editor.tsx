'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Play, Send } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CodeEditorProps {
  battleId?: string;
  roundId?: string;
  onSubmit?: (code: string, language: string) => Promise<void>;
  readOnly?: boolean;
  initialCode?: string;
  initialLanguage?: string;
  showSubmitButton?: boolean;
}

const LANGUAGE_TEMPLATES: Record<string, string> = {
  cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    // Your code here
    
    return 0;
}`,
  python: `# Your code here

def solve():
    pass

if __name__ == '__main__':
    solve()`,
  java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // Your code here
        
        sc.close();
    }
}`,
  javascript: `// Your code here

function solve() {
    
}

solve();`,
  c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Your code here
    
    return 0;
}`,
  go: `package main

import "fmt"

func main() {
    // Your code here
    
}`,
  rust: `fn main() {
    // Your code here
    
}`,
};

const LANGUAGES = [
  { id: 'cpp', name: 'C++', ext: 'cpp' },
  { id: 'python', name: 'Python', ext: 'py' },
  { id: 'java', name: 'Java', ext: 'java' },
  { id: 'javascript', name: 'JavaScript', ext: 'js' },
  { id: 'c', name: 'C', ext: 'c' },
  { id: 'go', name: 'Go', ext: 'go' },
  { id: 'rust', name: 'Rust', ext: 'rs' },
];

export default function CodeEditor({
  battleId,
  roundId,
  onSubmit,
  readOnly = false,
  initialCode,
  initialLanguage = 'cpp',
  showSubmitButton = true
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode || LANGUAGE_TEMPLATES[initialLanguage]);
  const [language, setLanguage] = useState(initialLanguage);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Update code when language changes (only if using template)
    if (!initialCode && LANGUAGE_TEMPLATES[language]) {
      setCode(LANGUAGE_TEMPLATES[language]);
    }
  }, [language, initialCode]);

  const handleSubmit = async () => {
    if (!onSubmit || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(code, language);
    } catch (error) {
      console.error('Error submitting code:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab key handling
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      
      // Set cursor position after the tab
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }

    // Ctrl+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="flex flex-col h-full bg-slate-900 border-slate-700">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center gap-3">
          <Select value={language} onValueChange={setLanguage} disabled={readOnly}>
            <SelectTrigger className="w-[140px] bg-slate-700 border-slate-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.id} value={lang.id}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={fontSize.toString()} onValueChange={(v) => setFontSize(parseInt(v))}>
            <SelectTrigger className="w-[100px] bg-slate-700 border-slate-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">12px</SelectItem>
              <SelectItem value="14">14px</SelectItem>
              <SelectItem value="16">16px</SelectItem>
              <SelectItem value="18">18px</SelectItem>
              <SelectItem value="20">20px</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showSubmitButton && (
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || readOnly}
            className="bg-green-600 hover:bg-green-700"
            size="sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit (Ctrl+Enter)
              </>
            )}
          </Button>
        )}
      </div>

      {/* Code Editor */}
      <div className="flex-1 overflow-hidden relative">
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={readOnly}
          className="w-full h-full p-4 bg-slate-900 text-slate-100 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ 
            fontSize: `${fontSize}px`,
            lineHeight: '1.5',
            tabSize: 4
          }}
          spellCheck={false}
          placeholder="// Write your code here..."
        />
        
        {/* Line numbers overlay could be added here */}
      </div>

      {/* Editor Footer */}
      <div className="p-2 border-t border-slate-700 bg-slate-800 text-xs text-slate-400">
        <div className="flex justify-between items-center">
          <span>
            Lines: {code.split('\n').length} | 
            Characters: {code.length}
          </span>
          {readOnly && (
            <span className="text-amber-400">
              Read-only mode
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
