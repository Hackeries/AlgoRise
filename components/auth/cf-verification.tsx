'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface Problem {
  contestId: number;
  index: string;
  name: string;
  rating: number;
  tags: string[];
}

export interface CFVerificationContextType {
  cfHandle: string | null;
  cfRating: number | null;
  cfMethod: 'oauth' | 'manual' | null;
  cfProblems: Problem[];
  verifyCF: (handle: string, method?: 'oauth' | 'manual') => Promise<void>;
  resetVerificationUI: () => void;
}

const CFVerificationContext = createContext<CFVerificationContextType>({
  cfHandle: null,
  cfRating: null,
  cfMethod: null,
  cfProblems: [],
  verifyCF: async () => {},
  resetVerificationUI: () => {},
});

export function CFVerificationProvider({ children }: { children: ReactNode }) {
  const [cfHandle, setCFHandle] = useState<string | null>(null);
  const [cfRating, setCFRating] = useState<number | null>(null);
  const [cfMethod, setCFMethod] = useState<'oauth' | 'manual' | null>(null);
  const [cfProblems, setCFProblems] = useState<Problem[]>([]);

  const verifyCF = async (handle: string, method: 'oauth' | 'manual' = 'manual') => {
    try {
      // Snapshot API
      const res = await fetch(`/api/cf-snapshot?handle=${handle}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'CF verification failed');

      const rating = data.rating ?? 1500;

      setCFHandle(handle);
      setCFRating(rating);
      setCFMethod(method);

      // Fetch adaptive sheet
      const floor = Math.floor(rating / 100) * 100;
      const minRating = Math.max(800, floor - 100);
      const maxRating = Math.min(3500, floor + 200);

      const sheetRes = await fetch(
        `/api/adaptive-sheet/auto-generate?handle=${handle}&minRating=${minRating}&maxRating=${maxRating}&count=70`
      );
      const sheetData = await sheetRes.json();
      setCFProblems(sheetData.problems || []);
    } catch (err) {
      setCFHandle(null);
      setCFRating(null);
      setCFMethod(null);
      setCFProblems([]);
      console.error(err);
    }
  };

  const resetVerificationUI = () => {
    setCFHandle(null);
    setCFRating(null);
    setCFMethod(null);
    setCFProblems([]);
  };

  return (
    <CFVerificationContext.Provider
      value={{ cfHandle, cfRating, cfMethod, cfProblems, verifyCF, resetVerificationUI }}
    >
      {children}
    </CFVerificationContext.Provider>
  );
}

export function useCFVerification() {
  return useContext(CFVerificationContext);
}
