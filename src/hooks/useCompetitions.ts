import { useCallback, useEffect, useState } from 'react';
import { getUserCompetitions } from '@/services/competitionsService';
import { Competition } from '@/types/database.types';

export function useCompetitions(userId?: string) {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const data = await getUserCompetitions(userId);
    setCompetitions(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return { competitions, loading, reload: load };
}
