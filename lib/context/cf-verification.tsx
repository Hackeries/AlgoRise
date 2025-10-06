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
  verificationData: CFVerificationData | null;
  setVerificationData: (data: CFVerificationData | null) => void;
  clearVerification: () => void;
  resetVerificationUI: () => void;
  refreshVerificationStatus: () => void;
}

const CFVerificationContext = createContext<
  CFVerificationContextType | undefined
>(undefined);

interface CFVerificationProviderProps {
  children: ReactNode;
}

// ---------------- Safe logging ----------------
const logSupabaseError = (context: string, error: any) => {
  if (!error) {
    console.error(`${context}: No error object provided`);
    return;
  }

  console.error(`${context}:`, {
    code: error?.code ?? 'Unknown',
    message:
      error?.message ??
      error?.toString?.() ??
      JSON.stringify(error) ??
      'No message',
    details: error?.details ?? 'No details',
    hint: error?.hint ?? 'No hint',
    timestamp: new Date().toISOString(),
  });
};

// ---------------- Codeforces API Fetch ----------------
const fetchCFData = async (handle: string) => {
  try {
    const res = await fetch(
      `https://codeforces.com/api/user.info?handles=${handle}`
    );
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

export function CFVerificationProvider({
  children,
}: CFVerificationProviderProps) {
  const [verificationData, setVerificationDataState] =
    useState<CFVerificationData | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const { user } = useAuth();

  // Create Supabase client
  let supabase: any = null;
  try {
    supabase = createClient();
  } catch (error) {
    console.warn('Supabase client creation failed:', error);
  }

  // ---------------- LocalStorage Fallback ----------------
  const refreshVerificationStatus = () => {
    try {
      const storedData = localStorage.getItem('cf_verification');
      if (storedData) {
        const data = JSON.parse(storedData) as CFVerificationData;
        setVerificationDataState(data);
        setIsVerified(true);
        return;
      }
      setVerificationDataState(null);
      setIsVerified(false);
    } catch (error) {
      console.error('Error reading CF verification status:', error);
      setVerificationDataState(null);
      setIsVerified(false);
    }
  };

  // ---------------- Save to Supabase ----------------
  const saveToSupabase = useCallback(
    async (data: CFVerificationData) => {
      if (!user || !supabase) return;

      try {
        console.log('Saving CF verification to Supabase:', data.handle);

        // Save to cf_handles table (handle and verification status)
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

        if (handleError) {
          logSupabaseError('Supabase handle save error', handleError);
        }

        const { error: snapshotError } = await supabase
          .from('cf_snapshots')
          .insert({
            user_id: user.id,
            handle: data.handle,
            rating: data.rating,
            max_rating: data.maxRating,
            rank: data.rank,
            problems_solved: 0,
            snapshot_at: new Date().toISOString(),
            snapshot_at: new Date().toISOString(),
          });

        if (snapshotError) {
          logSupabaseError('Supabase snapshot save error', snapshotError);
        }
      } catch (error) {
        console.error('Exception saving CF verification to Supabase:', error);
      }
    },
    [user, supabase]
  );

  // ---------------- Set Verification Data ----------------
  const setVerificationData = useCallback(
    async (data: CFVerificationData | null) => {
      if (!data) {
        localStorage.removeItem('cf_verification');
        setVerificationDataState(null);
        setIsVerified(false);
        return;
      }

      // localStorage.setItem("cf_verification", JSON.stringify(data));
      // setVerificationDataState(data);
      // setIsVerified(true);
      // Save to cf_snapshots table (rating data) - always create new snapshot
      const { error: snapshotError } = await supabase
        .from('cf_snapshots')

        .insert({
          user_id: user?.id,
          handle: data.handle,
          rating: data.rating,
          max_rating: data.maxRating,
          rank: data.rank,
          problems_solved: 0, // Default value, will be updated later
          snapshot_at: new Date().toISOString(),
        });

      if (user) await saveToSupabase(data);
    },
    [user, saveToSupabase]
  );

  // ---------------- Load from Supabase ----------------
  const loadFromSupabase = useCallback(async () => {
    if (!user || !supabase) {
      refreshVerificationStatus();
      return;
    }

    try {
      const { data: handleData, error: handleError } = await supabase
        .from('cf_handles')
        .select('handle, verified, created_at')
        .eq('user_id', user.id)
        .single();

      if (handleError) {
        logSupabaseError('Supabase load handle error', handleError);
        refreshVerificationStatus();
        return;
      }

      // if (!handleData?.verified) {
      //   refreshVerificationStatus();
      //   return;
      if (handleData && handleData.verified) {
        // Get latest CF snapshot for rating data
        const { data: snapshotData } = await supabase
          .from('cf_snapshots')
          .select('rating, max_rating, rank')
          .eq('user_id', user.id)
          .order('snapshot_at', { ascending: false })
          .limit(1)
          .single();

        console.log(
          'CF verification data loaded from Supabase:',
          handleData.handle
        );
        const verificationData: CFVerificationData = {
          handle: handleData.handle,
          rating: snapshotData?.rating || 0,
          maxRating: snapshotData?.max_rating || 0,
          rank: snapshotData?.rank || 'unrated',
          verifiedAt: handleData.created_at,
        };
        setVerificationData(verificationData);
      } else {
        // No verified data in Supabase, check localStorage
        refreshVerificationStatus();
      }

      // Fetch live CF data
      const cfData = await fetchCFData(handleData.handle);
      if (cfData) setVerificationData(cfData);
      else refreshVerificationStatus();
    } catch (error) {
      console.error('Exception loading CF verification from Supabase:', error);
      refreshVerificationStatus();
    }
  }, [user, supabase, setVerificationData]);

  // ---------------- Clear Verification ----------------
  const clearVerification = useCallback(async () => {
    localStorage.removeItem('cf_verification');
    setVerificationDataState(null);
    setIsVerified(false);

    if (user && supabase) {
      try {
        const { error } = await supabase
          .from('cf_handles')
          .delete()
          .eq('user_id', user.id);

        if (error) logSupabaseError('Supabase clear verification error', error);
      } catch (error) {
        console.error(
          'Exception clearing CF verification from Supabase:',
          error
        );
      }
    }
  }, [user, supabase]);

  const resetVerificationUI = useCallback(() => {
    localStorage.removeItem('cf_verification');
    setVerificationDataState(null);
    setIsVerified(false);
  }, []);

  // ---------------- Initialize ----------------
  useEffect(() => {
    refreshVerificationStatus();
    if (user) loadFromSupabase();
  }, [user, loadFromSupabase]);

  return (
    <CFVerificationContext.Provider
      value={{
        isVerified,
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
  if (!context)
    throw new Error(
      'useCFVerification must be used within a CFVerificationProvider'
    );
  return context;
}
