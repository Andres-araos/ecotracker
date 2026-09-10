export function co2FromFactor(quantity: number, factor: number): number {
  return Math.round(quantity * factor * 1000) / 1000;
}

export function formatCO2(kg: number): string {
  if (kg < 1) return `${Math.round(kg * 1000)} g`;
  return `${kg.toFixed(2)} kg`;
}

export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}
