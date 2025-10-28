'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Terminal, FileCode2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => null,
});

interface CodeEditorProps {
  language: string;
  onLanguageChange: (lang: string) => void;
  code: string;
  onCodeChange: (code: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  readOnly?: boolean;
}

export function CodeEditor({
  language,
  onLanguageChange,
  code,
  onCodeChange,
  onSubmit,
  isSubmitting,
  readOnly = false,
}: CodeEditorProps) {
  const monacoLanguage = useMemo(() => {
    switch (language) {
      case 'cpp':
        return 'cpp';
      case 'python':
        return 'python';
      case 'java':
        return 'java';
      case 'javascript':
        return 'javascript';
      default:
        return 'plaintext';
    }
  }, [language]);

  return (
    <motion.div
      className='flex flex-col h-full gap-4 bg-gradient-to-br from-[#0e0e10] via-[#1a1a1d] to-[#0f0f12] rounded-xl border border-[#222]'
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Top Bar (File + Controls) */}
      <div className='flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 border-b border-[#222] bg-[#141414]/80 rounded-t-xl backdrop-blur-md'>
        <div className='flex items-center gap-2'>
          <motion.div
            className='w-3 h-3 bg-red-500 rounded-full'
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <div className='w-3 h-3 bg-yellow-400 rounded-full' />
          <div className='w-3 h-3 bg-green-500 rounded-full' />
          <div className='ml-3 flex items-center gap-2 text-gray-300'>
            <FileCode2 className='w-4 h-4 text-sky-400' />
            <span className='text-sm font-mono'>main.{language}</span>
          </div>
        </div>

        <div className='flex gap-2 items-center'>
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger className='w-28 md:w-32 border-[#333] bg-[#111] text-gray-300'>
              <SelectValue placeholder='Language' />
            </SelectTrigger>
            <SelectContent className='bg-[#111] border-[#333] text-gray-200'>
              <SelectItem value='cpp'>C++</SelectItem>
              <SelectItem value='python'>Python</SelectItem>
              <SelectItem value='java'>Java</SelectItem>
              <SelectItem value='javascript'>JavaScript</SelectItem>
            </SelectContent>
          </Select>

          <motion.div whileHover={{ scale: 1.05 }}>
            <Button
              onClick={onSubmit}
              disabled={isSubmitting || !code}
              className='bg-sky-600 hover:bg-sky-700 border border-sky-500/40 shadow-sm shadow-sky-800/40'
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Submitting...
                </>
              ) : (
                'Run Code'
              )}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Editor Area */}
      <div className='flex-1 relative font-mono text-sm text-gray-200 overflow-hidden rounded-b-xl'>
        <MonacoEditor
          value={code}
          onChange={(val) => onCodeChange(val || '')}
          language={monacoLanguage}
          theme='vs-dark'
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            tabSize: 2,
            readOnly,
          }}
          height='100%'
        />
      </div>

      {/* Bottom Status Bar */}
      <div className='px-3 md:px-4 py-2 border-t border-[#222] bg-[#141414]/70 text-xs text-gray-400 flex items-center justify-between rounded-b-xl'>
        <div className='flex items-center gap-2'>
          <Terminal className='w-3.5 h-3.5 text-sky-400' />
          <span>Ready</span>
        </div>
        <span>{code.length} chars</span>
      </div>
    </motion.div>
  );
}