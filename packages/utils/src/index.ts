// Shared utilities for YmShotS

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Date.now().toString(36);
}

export function formatCents(cents: number | bigint, currency = 'USD'): string {
  const amount = Number(cents) / 100;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function uuid(): string {
  return crypto.randomUUID();
}
