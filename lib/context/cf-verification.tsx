'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { useAuth } from '../auth/context';
import { createClient } from '../supabase/client';

export interface CFVerificationData {
  handle: string;
  rating: number;
  maxRating: number;
  rank: string;
  verifiedAt: string;
}

interface CFVerificationContextType {
  isVerified: boolean;
  cfHandle: string | null;
  cfRating: number | null;
  verificationData: CFVerificationData | null;
  setVerificationData: (data: CFVerificationData | null) => void;
  clearVerification: () => void;
  resetVerificationUI: () => void;
  refreshVerificationStatus: () => void;
}

const CFVerificationContext = createContext<CFVerificationContextType | undefined>(undefined);

interface CFVerificationProviderProps {
  children: ReactNode;
}

// ---------------- Safe logging ----------------
const logSupabaseError = (context: string, error: any) => {
  if (!error) return console.error(`${context}: No error object provided`);
  console.error(`${context}:`, {
    code: error?.code ?? 'Unknown',
    message: error?.message ?? error?.toString?.() ?? JSON.stringify(error) ?? 'No message',
    details: error?.details ?? 'No details',
    hint: error?.hint ?? 'No hint',
    timestamp: new Date().toISOString(),
  });
};

// ---------------- Codeforces API Fetch ----------------
const fetchCFData = async (handle: string) => {
  try {
    const res = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
    const json = await res.json();
    if (json.status !== 'OK') throw new Error(json.comment || 'API error');
    const user = json.result[0];
    return {
      handle: user.handle,
      rating: user.rating ?? 0,
      maxRating: user.maxRating ?? 0,
      rank: user.rank ?? 'unrated',
      verifiedAt: new Date().toISOString(),
    } as CFVerificationData;
  } catch (err) {
    console.error('Error fetching Codeforces data:', err);
    return null;
  }
};

export function CFVerificationProvider({ children }: CFVerificationProviderProps) {
  const { user } = useAuth();
  const [verificationData, setVerificationDataState] = useState<CFVerificationData | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  // Supabase client
  let supabase: any = null;
  try {
    supabase = createClient();
  } catch (error) {
    console.warn('Supabase client creation failed:', error);
  }

  // ---------------- Helpers ----------------
  const cfHandle = verificationData?.handle ?? null;
  const cfRating = verificationData?.rating ?? null;

  const refreshVerificationStatus = useCallback(() => {
    try {
      const stored = localStorage.getItem('cf_verification');
      if (stored) {
        const data = JSON.parse(stored) as CFVerificationData;
        setVerificationDataState(data);
        setIsVerified(true);
        return;
      }
      setVerificationDataState(null);
      setIsVerified(false);
    } catch {
      setVerificationDataState(null);
      setIsVerified(false);
    }
  }, []);

  const saveToSupabase = useCallback(
    async (data: CFVerificationData) => {
      if (!user || !supabase) return;
      try {
        // Save handle
        const { error: handleError } = await supabase.from('cf_handles').upsert(
          {
            user_id: user.id,
            handle: data.handle,
            verified: true,
            created_at: data.verifiedAt,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
        if (handleError) logSupabaseError('handle save error', handleError);

        // Save snapshot
        const { error: snapshotError } = await supabase.from('cf_snapshots').insert({
          user_id: user.id,
          handle: data.handle,
          rating: data.rating,
          max_rating: data.maxRating,
          rank: data.rank,
          problems_solved: 0,
          snapshot_at: new Date().toISOString(),
        });
        if (snapshotError) logSupabaseError('snapshot save error', snapshotError);
      } catch (err) {
        console.error('Exception saving CF verification:', err);
      }
    },
    [user, supabase]
  );

  const setVerificationData = useCallback(
    async (data: CFVerificationData | null) => {
      if (!data) {
        localStorage.removeItem('cf_verification');
        setVerificationDataState(null);
        setIsVerified(false);
        return;
      }
      localStorage.setItem('cf_verification', JSON.stringify(data));
      setVerificationDataState(data);
      setIsVerified(true);
      if (user) await saveToSupabase(data);
    },
    [user, saveToSupabase]
  );

  const loadFromSupabase = useCallback(async () => {
    if (!user || !supabase) {
      refreshVerificationStatus();
      return;
    }
    try {
      const { data: handleData } = await supabase.from('cf_handles').select('*').eq('user_id', user.id).single();
      if (!handleData?.verified) return refreshVerificationStatus();

      const { data: snapshotData } = await supabase
        .from('cf_snapshots')
        .select('*')
        .eq('user_id', user.id)
        .order('snapshot_at', { ascending: false })
        .limit(1)
        .single();

      const verification: CFVerificationData = {
        handle: handleData.handle,
        rating: snapshotData?.rating ?? 0,
        maxRating: snapshotData?.max_rating ?? 0,
        rank: snapshotData?.rank ?? 'unrated',
        verifiedAt: handleData.created_at,
      };
      setVerificationData(verification);

      // Also fetch live CF data
      const cfData = await fetchCFData(handleData.handle);
      if (cfData) setVerificationData(cfData);
    } catch (err) {
      console.error('Error loading CF verification from Supabase:', err);
      refreshVerificationStatus();
    }
  }, [user, supabase, refreshVerificationStatus]);

  const clearVerification = useCallback(async () => {
    localStorage.removeItem('cf_verification');
    setVerificationDataState(null);
    setIsVerified(false);
    if (!user || !supabase) return;
    try {
      await supabase.from('cf_handles').delete().eq('user_id', user.id);
    } catch (err) {
      console.error('Error clearing CF verification:', err);
    }
  }, [user, supabase]);

  const resetVerificationUI = useCallback(() => {
    localStorage.removeItem('cf_verification');
    setVerificationDataState(null);
    setIsVerified(false);
  }, []);

  useEffect(() => {
    refreshVerificationStatus();
    if (user) loadFromSupabase();
  }, [user, loadFromSupabase, refreshVerificationStatus]);

  return (
    <CFVerificationContext.Provider
      value={{
        isVerified,
        cfHandle,
        cfRating,
        verificationData,
        setVerificationData,
        clearVerification,
        resetVerificationUI,
        refreshVerificationStatus,
      }}
    >
      {children}
    </CFVerificationContext.Provider>
  );
}

export function useCFVerification() {
  const context = useContext(CFVerificationContext);
  if (!context) throw new Error('useCFVerification must be used within a CFVerificationProvider');
  return context;
}