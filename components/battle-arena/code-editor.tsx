'use client';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface CodeEditorProps {
  language: string;
  onLanguageChange: (lang: string) => void;
  code: string;
  onCodeChange: (code: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function CodeEditor({
  language,
  onLanguageChange,
  code,
  onCodeChange,
  onSubmit,
  isSubmitting,
}: CodeEditorProps) {
  return (
    <div className='flex flex-col h-full gap-4'>
      <div className='flex gap-2 items-center'>
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger className='w-32'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='cpp'>C++</SelectItem>
            <SelectItem value='python'>Python</SelectItem>
            <SelectItem value='java'>Java</SelectItem>
            <SelectItem value='javascript'>JavaScript</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || !code}
          className='ml-auto'
        >
          {isSubmitting ? (
            <>
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              Submitting...
            </>
          ) : (
            'Submit'
          )}
        </Button>
      </div>

      <div className='flex-1 bg-muted rounded-lg overflow-hidden border border-border'>
        <textarea
          value={code}
          onChange={e => onCodeChange(e.target.value)}
          placeholder='Write your code here...'
          className='w-full h-full p-4 bg-background text-foreground font-mono text-sm resize-none focus:outline-none'
          spellCheck='false'
        />
      </div>
    </div>
  );
}
