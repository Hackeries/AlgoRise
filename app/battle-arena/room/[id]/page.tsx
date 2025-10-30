'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import BattleRoom from '@/components/battle/battle-room';
import { Loader2 } from 'lucide-react';

export default function BattleRoomPage({ params }: { params: { id: string } }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUserId = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
      }
      setIsLoading(false);
    };

    getUserId();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <p className="text-slate-400">Please log in to access the battle room</p>
      </div>
    );
  }

  return <BattleRoom battleId={params.id} userId={userId} />;
}