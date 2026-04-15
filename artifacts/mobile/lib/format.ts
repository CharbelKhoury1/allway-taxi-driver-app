export function formatCurrency(value: unknown): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "0.00";
  return amount.toFixed(2);
}

export function formatDistanceKm(value: unknown): string | null {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return `${amount} km`;
}
