/**
 * Secure token generator for read-only event share links
 */

const BASE64URL_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

export function createShareToken(length = 36): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);

  let token = "";
  for (let i = 0; i < length; i++) {
    token += BASE64URL_ALPHABET[bytes[i] % BASE64URL_ALPHABET.length];
  }

  return token;
}

export function isExpired(
  expiresAt: string | Date | number,
  now: string | Date | number = Date.now()
): boolean {
  const expiryTime = new Date(expiresAt).getTime();
  const currentTime = new Date(now).getTime();

  if (Number.isNaN(expiryTime) || Number.isNaN(currentTime)) {
    return true; // Treat invalid dates as expired for safety
  }

  return currentTime >= expiryTime;
}
