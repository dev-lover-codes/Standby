const MEDIA_HOST = "https://d2ol7oe51mr4n9.cloudfront.net";

/** Builds the Content-Security-Policy. Allows Supabase (auth + data) and the landing video host. */
export function buildCsp(nonce: string, supabaseUrl: string, opts: { isDev: boolean; https: boolean }): string {
  const { isDev, https } = opts;
  const supabaseWs = supabaseUrl.replace(/^https:/, "wss:");
  const scriptSrc = isDev
    ? "'self' 'unsafe-eval' 'unsafe-inline'"
    : `'self' 'nonce-${nonce}' 'strict-dynamic'`;
  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' blob: data: ${MEDIA_HOST}`,
    `media-src 'self' ${MEDIA_HOST}`,
    "font-src 'self'",
    `connect-src 'self' ${supabaseUrl} ${supabaseWs}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(https ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}
