const moneyCache = new Map<string, Intl.NumberFormat>();
const compactCache = new Map<string, Intl.NumberFormat>();

function toNumber(value: string | number | null | undefined): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : Number.parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

function getMoneyFormatter(currency: string, fractionDigits: number): Intl.NumberFormat {
  const key = `${currency}|${fractionDigits}`;
  let f = moneyCache.get(key);
  if (!f) {
    try {
      f = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      });
    } catch {
      f = new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      });
    }
    moneyCache.set(key, f);
  }
  return f;
}

export function formatMoney(
  value: string | number | null | undefined,
  currency: string | null | undefined,
  options: { fallback?: string; fractionDigits?: number } = {},
): string {
  const fallback = options.fallback ?? '—';
  const n = toNumber(value);
  if (n === null) return fallback;
  const code = (currency ?? '').toUpperCase();
  const digits = options.fractionDigits ?? (Number.isInteger(n) ? 0 : 2);
  if (!code)
    return n.toLocaleString('id-ID', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  try {
    return getMoneyFormatter(code, digits).format(n);
  } catch {
    return `${code} ${n.toLocaleString('id-ID', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
  }
}

export function formatMoneyCompact(value: number, currency?: string | null): string {
  const code = (currency ?? '').toUpperCase();
  const key = code || '__';
  let f = compactCache.get(key);
  if (!f) {
    try {
      f = code
        ? new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: code,
            notation: 'compact',
            maximumFractionDigits: 1,
          })
        : new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 });
    } catch {
      f = new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 });
    }
    compactCache.set(key, f);
  }
  return f.format(value);
}
