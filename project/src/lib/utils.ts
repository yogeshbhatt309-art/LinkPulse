/**
 * Generate a random short code of the given length using alphanumeric chars.
 */
export function generateShortCode(length: number = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  const cryptoArr = new Uint8Array(length);
  crypto.getRandomValues(cryptoArr);
  for (let i = 0; i < length; i++) {
    result += chars[cryptoArr[i] % chars.length];
  }
  return result;
}

/**
 * Validate that a string is a valid URL with http or https protocol.
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Validate that a custom alias contains only URL-safe characters.
 */
export function isValidAlias(alias: string): boolean {
  return /^[a-zA-Z0-9-_]+$/.test(alias);
}

/**
 * Build the full short URL for a given short code.
 */
export function buildShortUrl(shortCode: string): string {
  const base = import.meta.env.VITE_SUPABASE_URL as string;
  return `${base}/functions/v1/redirect/${shortCode}`;
}

/**
 * Format a date string into a human-readable format.
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Truncate a URL for display purposes.
 */
export function truncateUrl(url: string, maxLength: number = 50): string {
  if (url.length <= maxLength) return url;
  return url.slice(0, maxLength) + "...";
}
