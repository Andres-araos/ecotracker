import { useCallback, useEffect, useState } from 'react';
import { getWeeklySummary } from '@/services/carbonService';
import { getWeekRange } from '@/utils/dateUtils';

export function useCarbonFootprint(userId?: string) {
  const [current, setCurrent] = useState({ meals: 0, transport: 0, energy: 0, total: 0 });
  const [previous, setPrevious] = useState({ meals: 0, transport: 0, energy: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const thisWeek = getWeekRange(0);
    const lastWeek = getWeekRange(-1);
    const [cur, prev] = await Promise.all([
      getWeeklySummary(userId, thisWeek.start, thisWeek.end),
      getWeeklySummary(userId, lastWeek.start, lastWeek.end),
    ]);
    setCurrent(cur);
    setPrevious(prev);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return { current, previous, loading, reload: load };
}
