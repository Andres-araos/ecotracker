export function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function getWeekRange(offsetWeeks = 0) {
  const now = new Date();
  const day = now.getDay() === 0 ? 7 : now.getDay(); // lunes=1 ... domingo=7
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 1 + offsetWeeks * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
  };
}

export function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
}
