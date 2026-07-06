/** Serializes a params object to a query string ("?a=1&b=2"), dropping empty
 * values (undefined/null/""), so empty filters never reach the backend. */
export function toQueryString(params: object): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      sp.set(key, String(value));
    }
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}
