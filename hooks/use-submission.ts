// Enhanced submission hook with validation, retries, and progress tracking
// Part 4: Code Execution & Judge0 Integration

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

export interface SubmissionProgress {
  stage: 'validating' | 'compiling' | 'running' | 'complete' | 'error';
  message: string;
  currentTest?: number;
  totalTests?: number;
  progress?: number; // 0-100
}

export interface SubmissionResult {
  success: boolean;
  verdict: 'AC' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE';
  message: string;
  testCase?: number;
  executionTime?: number;
  memoryUsed?: number;
  points?: number;
  expectedOutput?: string;
  actualOutput?: string;
  compileError?: string;
  runtimeError?: string;
}

interface UseSubmissionOptions {
  battleId: string;
  roundId: string;
  onSuccess?: (result: SubmissionResult) => void;
  onError?: (error: string) => void;
  maxRetries?: number;
  retryDelay?: number;
}

const MAX_CODE_SIZE = 10 * 1024; // 10KB
const MIN_CODE_SIZE = 10; // 10 characters minimum
const SUBMISSION_THROTTLE = 10000; // 10 seconds between submissions
const SLOW_SUBMISSION_THRESHOLD = 10000; // 10 seconds
const VERY_SLOW_SUBMISSION_THRESHOLD = 30000; // 30 seconds

export function useSubmission({
  battleId,
  roundId,
  onSuccess,
  onError,
  maxRetries = 3,
  retryDelay = 3000
}: UseSubmissionOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState<SubmissionProgress | null>(null);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const lastSubmissionTime = useRef<number>(0);
  const abortController = useRef<AbortController | null>(null);
  const slowWarningTimer = useRef<NodeJS.Timeout | null>(null);
  const verySlowWarningTimer = useRef<NodeJS.Timeout | null>(null);

  // Client-side validation
  const validateCode = useCallback((code: string, language: string): { valid: boolean; error?: string } => {
    // Check if code is empty
    if (!code || code.trim().length === 0) {
      return {
        valid: false,
        error: '❌ Your code is empty! Please write a solution before submitting.'
      };
    }

    // Check minimum code length
    if (code.trim().length < MIN_CODE_SIZE) {
      return {
        valid: false,
        error: '❌ Your code is too short. Please provide a complete solution.'
      };
    }

    // Check maximum code size
    if (code.length > MAX_CODE_SIZE) {
      return {
        valid: false,
        error: `⚠️ Your code is too long (${(code.length / 1024).toFixed(2)}KB). Maximum allowed: 10KB.`
      };
    }

    // Check for submission throttling
    const now = Date.now();
    const timeSinceLastSubmission = now - lastSubmissionTime.current;
    if (timeSinceLastSubmission < SUBMISSION_THROTTLE && lastSubmissionTime.current > 0) {
      const waitTime = Math.ceil((SUBMISSION_THROTTLE - timeSinceLastSubmission) / 1000);
      return {
        valid: false,
        error: `⏱️ Please wait ${waitTime} seconds before submitting again.`
      };
    }

    return { valid: true };
  }, []);

  // Submit with retry logic
  const submitWithRetry = useCallback(async (
    code: string,
    language: string,
    retryCount: number = 0
  ): Promise<SubmissionResult> => {
    try {
      abortController.current = new AbortController();

      const response = await fetch(`/api/battles/${battleId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roundId,
          codeText: code,
          language
        }),
        signal: abortController.current.signal
      });

      // Handle different HTTP status codes
      if (response.status === 401) {
        throw new Error('You must be logged in to submit code.');
      }

      if (response.status === 403) {
        throw new Error('You are not authorized to submit code for this battle.');
      }

      if (response.status === 429) {
        throw new Error('Too many submissions. Please slow down.');
      }

      if (!response.ok) {
        // Try to get error message from response
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Submission failed with status ${response.status}`);
      }

      const data = await response.json();

      // Poll for submission result
      return await pollSubmissionResult(data.submissionId);

    } catch (error: any) {
      // Don't retry if request was aborted
      if (error.name === 'AbortError') {
        throw new Error('Submission cancelled');
      }

      // Retry on network errors
      if (retryCount < maxRetries && isNetworkError(error)) {
        setProgress({
          stage: 'error',
          message: `Network error. Retrying in ${retryDelay / 1000}s... (Attempt ${retryCount + 1}/${maxRetries})`,
          progress: 0
        });

        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, retryCount)));
        return submitWithRetry(code, language, retryCount + 1);
      }

      throw error;
    }
  }, [battleId, roundId, maxRetries, retryDelay]);

  // Poll for submission result
  const pollSubmissionResult = async (submissionId: string): Promise<SubmissionResult> => {
    const maxPolls = 60; // 60 seconds max
    let polls = 0;

    while (polls < maxPolls) {
      try {
        const response = await fetch(`/api/battles/${battleId}/submissions/${submissionId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch submission result');
        }

        const data = await response.json();

        // Update progress based on status
        if (data.status === 'pending' || data.status === 'compiling') {
          setProgress({
            stage: 'compiling',
            message: '⚙️ Compiling your code...',
            progress: 25
          });
        } else if (data.status === 'running') {
          setProgress({
            stage: 'running',
            message: '🏃 Running test cases...',
            currentTest: data.currentTest || 1,
            totalTests: data.totalTests || 5,
            progress: 50 + (((data.currentTest || 1) / (data.totalTests || 5)) * 40)
          });
        } else if (data.status === 'solved' || data.status === 'wrong_answer' || 
                   data.status === 'time_limit_exceeded' || data.status === 'memory_limit_exceeded' ||
                   data.status === 'runtime_error' || data.status === 'compilation_error') {
          // Submission complete
          return mapSubmissionResult(data);
        }

        polls++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        throw new Error('Failed to check submission status');
      }
    }

    throw new Error('Submission timed out. Please try again.');
  };

  // Map backend result to our result format
  const mapSubmissionResult = (data: any): SubmissionResult => {
    let verdict: SubmissionResult['verdict'] = 'AC';
    let message = '';

    switch (data.status) {
      case 'solved':
        verdict = 'AC';
        message = '✓ Accepted! Great job!';
        break;
      case 'wrong_answer':
        verdict = 'WA';
        message = data.failedTestCase 
          ? `✗ Wrong Answer on Test ${data.failedTestCase}`
          : '✗ Wrong Answer';
        break;
      case 'time_limit_exceeded':
        verdict = 'TLE';
        message = data.failedTestCase
          ? `⏱ Time Limit Exceeded on Test ${data.failedTestCase}`
          : '⏱ Time Limit Exceeded';
        break;
      case 'memory_limit_exceeded':
        verdict = 'MLE';
        message = '💾 Memory Limit Exceeded';
        break;
      case 'runtime_error':
        verdict = 'RE';
        message = '💥 Runtime Error';
        break;
      case 'compilation_error':
        verdict = 'CE';
        message = '❌ Compilation Error';
        break;
    }

    return {
      success: verdict === 'AC',
      verdict,
      message,
      testCase: data.failedTestCase,
      executionTime: data.executionTimeMs,
      memoryUsed: data.memoryUsedKb,
      points: data.points,
      expectedOutput: data.expectedOutput,
      actualOutput: data.actualOutput,
      compileError: data.compileOutput,
      runtimeError: data.stderr
    };
  };

  // Check if error is a network error
  const isNetworkError = (error: any): boolean => {
    return error.message?.includes('fetch') || 
           error.message?.includes('network') ||
           error.message?.includes('Failed to fetch') ||
           error.name === 'NetworkError';
  };

  // Play success sound
  const playSuccessSound = useCallback(() => {
    try {
      const audio = new Audio('/sounds/success.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore errors if sound fails to play
      });
    } catch (error) {
      // Ignore sound errors
    }
  }, []);

  // Main submit function
  const submit = useCallback(async (code: string, language: string) => {
    // Validate code
    const validation = validateCode(code, language);
    if (!validation.valid) {
      toast.error(validation.error);
      if (onError) {
        onError(validation.error!);
      }
      return;
    }

    setIsSubmitting(true);
    setResult(null);
    setProgress({
      stage: 'validating',
      message: '📝 Validating your code...',
      progress: 10
    });

    // Set up slow submission warnings
    slowWarningTimer.current = setTimeout(() => {
      setProgress(prev => ({
        ...prev!,
        message: '⏳ This is taking longer than usual...'
      }));
      toast.warning('This is taking longer than usual...', {
        action: {
          label: 'Cancel',
          onClick: () => cancel()
        }
      });
    }, SLOW_SUBMISSION_THRESHOLD);

    verySlowWarningTimer.current = setTimeout(() => {
      setProgress(prev => ({
        ...prev!,
        message: '⚠️ Judge0 is experiencing delays. Please be patient...'
      }));
      toast.error('Judge0 is experiencing delays.', {
        action: {
          label: 'Refresh',
          onClick: () => window.location.reload()
        }
      });
    }, VERY_SLOW_SUBMISSION_THRESHOLD);

    try {
      lastSubmissionTime.current = Date.now();
      const submissionResult = await submitWithRetry(code, language);

      // Clear timers
      if (slowWarningTimer.current) {
        clearTimeout(slowWarningTimer.current);
      }
      if (verySlowWarningTimer.current) {
        clearTimeout(verySlowWarningTimer.current);
      }

      setProgress({
        stage: 'complete',
        message: submissionResult.message,
        progress: 100
      });

      setResult(submissionResult);

      if (submissionResult.success) {
        playSuccessSound();
        toast.success(submissionResult.message);
        if (onSuccess) {
          onSuccess(submissionResult);
        }
      } else {
        toast.error(submissionResult.message);
      }

    } catch (error: any) {
      // Clear timers
      if (slowWarningTimer.current) {
        clearTimeout(slowWarningTimer.current);
      }
      if (verySlowWarningTimer.current) {
        clearTimeout(verySlowWarningTimer.current);
      }

      const errorMessage = error.message || 'Failed to submit. Please try again.';
      
      setProgress({
        stage: 'error',
        message: errorMessage,
        progress: 0
      });

      // Show user-friendly error message (not technical details)
      const userMessage = getUserFriendlyError(error);
      toast.error(userMessage, {
        action: {
          label: 'Contact Support',
          onClick: () => window.open('/support', '_blank')
        }
      });

      if (onError) {
        onError(userMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [validateCode, submitWithRetry, playSuccessSound, onSuccess, onError]);

  // Get user-friendly error message
  const getUserFriendlyError = (error: any): string => {
    const message = error.message || '';

    if (message.includes('logged in')) {
      return 'Please log in to submit your code.';
    }
    if (message.includes('authorized') || message.includes('403')) {
      return 'You are not authorized to submit for this battle.';
    }
    if (message.includes('Too many')) {
      return 'Too many submissions. Please slow down.';
    }
    if (message.includes('timed out')) {
      return 'Submission timed out. Please try again.';
    }
    if (message.includes('cancelled')) {
      return 'Submission cancelled.';
    }

    // Don't show technical errors like "HTTP 500"
    return 'Failed to submit. Please try again or contact support.';
  };

  // Cancel submission
  const cancel = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
    }
    if (slowWarningTimer.current) {
      clearTimeout(slowWarningTimer.current);
    }
    if (verySlowWarningTimer.current) {
      clearTimeout(verySlowWarningTimer.current);
    }
    setIsSubmitting(false);
    setProgress(null);
    toast.info('Submission cancelled');
  }, []);

  return {
    submit,
    cancel,
    isSubmitting,
    progress,
    result,
    validateCode
  };
}
